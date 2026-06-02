"""OTP generation, storage, verification, and SMS dispatch."""

from __future__ import annotations

import hashlib
import logging
import os
import secrets
import time
from datetime import datetime, timedelta
from threading import Lock
from typing import Optional, Tuple

from app.db_config.db import get_db_cursor
from app.services.sms_service import get_sms_service, phone_to_e164

logger = logging.getLogger(__name__)

OTP_TTL_SECONDS = int(os.environ.get("OTP_TTL_SECONDS", "300"))
OTP_COOLDOWN_SECONDS = 60
OTP_MAX_PER_HOUR = 3

_send_buckets: dict[str, list[float]] = {}
_send_lock = Lock()


class OtpError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status
        super().__init__(message)


def _validate_phone(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) != 10 or not digits.isdigit():
        raise OtpError("invalid_phone", "เบอร์โทรต้องเป็นตัวเลข 10 หลัก", 400)
    return digits


def _hash_code(phone: str, code: str) -> str:
    salt = os.environ.get("OTP_HASH_SALT", "modpao-otp")
    payload = f"{salt}:{phone}:{code}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _check_rate_limit(phone: str) -> None:
    now = time.monotonic()
    with _send_lock:
        times = [t for t in _send_buckets.get(phone, []) if now - t < 3600]
        if len(times) >= OTP_MAX_PER_HOUR:
            raise OtpError(
                "rate_limited",
                "ส่ง OTP บ่อยเกินไป กรุณารอสักครู่",
                429,
            )
        if times and now - times[-1] < OTP_COOLDOWN_SECONDS:
            raise OtpError(
                "cooldown",
                f"กรุณารอ {OTP_COOLDOWN_SECONDS} วินาทีก่อนส่งใหม่",
                429,
            )
        times.append(now)
        _send_buckets[phone] = times


def _dev_bypass_enabled() -> bool:
    return os.environ.get("AUTH_DEV_BYPASS", "").strip().lower() in (
        "1",
        "true",
        "yes",
    )


def send_otp(phone_raw: str) -> dict:
    phone = _validate_phone(phone_raw)
    if not _dev_bypass_enabled():
        _check_rate_limit(phone)

    code = f"{secrets.randbelow(1_000_000):06d}"
    code_hash = _hash_code(phone, code)
    expires_at = datetime.utcnow() + timedelta(seconds=OTP_TTL_SECONDS)

    with get_db_cursor() as (conn, cur):
        cur.execute(
            "DELETE FROM otp_sessions WHERE phone_number = %s AND verified_at IS NULL",
            (phone,),
        )
        cur.execute(
            """
            INSERT INTO otp_sessions (phone_number, code_hash, expires_at)
            VALUES (%s, %s, %s)
            """,
            (phone, code_hash, expires_at),
        )
        conn.commit()

    body = f"MOD PAO: รหัส OTP ของคุณคือ {code} (หมดอายุ {OTP_TTL_SECONDS // 60} นาที)"
    if _dev_bypass_enabled():
        logger.warning("[OtpService] AUTH_DEV_BYPASS: OTP for %s is %s", phone, code)
        print(f"[OTP dev] phone={phone} code={code}", flush=True)
        delivery = "dev"
    else:
        try:
            e164 = phone_to_e164(phone)
            delivery = get_sms_service().send(e164, body)
        except Exception as e:
            logger.error("[OtpService] SMS failed for %s: %s", phone, e)
            raise OtpError("sms_failed", "ส่ง SMS ไม่สำเร็จ กรุณาลองใหม่", 502) from e

    return {
        "status": "sent",
        "expires_in": OTP_TTL_SECONDS,
        "delivery": delivery,
    }


def verify_otp(phone_raw: str, code_raw: str) -> str:
    phone = _validate_phone(phone_raw)
    code = (code_raw or "").strip()
    if len(code) != 6 or not code.isdigit():
        raise OtpError("invalid_code", "รหัส OTP ต้องเป็นตัวเลข 6 หลัก", 400)

    if _dev_bypass_enabled():
        return phone

    code_hash = _hash_code(phone, code)
    now = datetime.utcnow()

    with get_db_cursor() as (conn, cur):
        cur.execute(
            """
            SELECT id, code_hash, expires_at, verified_at, failed_attempts
            FROM otp_sessions
            WHERE phone_number = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (phone,),
        )
        row = cur.fetchone()
        if not row:
            raise OtpError("no_otp", "ยังไม่ได้ขอรหัส OTP", 400)
        if row["verified_at"]:
            raise OtpError("already_used", "รหัส OTP ถูกใช้แล้ว", 400)
        if row["expires_at"] < now:
            raise OtpError("expired", "รหัส OTP หมดอายุ", 400)
        if row["failed_attempts"] >= 5:
            raise OtpError("too_many_failed_attempts", "รหัส OTP นี้ถูกล็อกเนื่องจากใส่รหัสผิดเกินกำหนด กรุณาขอรหัสใหม่", 400)
            
        if row["code_hash"] != code_hash:
            cur.execute("UPDATE otp_sessions SET failed_attempts = failed_attempts + 1 WHERE id = %s", (row["id"],))
            conn.commit()
            raise OtpError("wrong_code", "รหัส OTP ไม่ถูกต้อง", 400)

        cur.execute(
            "UPDATE otp_sessions SET verified_at = %s WHERE id = %s",
            (now, row["id"]),
        )
        conn.commit()

    return phone
