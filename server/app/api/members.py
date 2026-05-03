"""
members.py — Member (User) API
- GET  /api/members/<phone>   : ค้นหาสมาชิกจากเบอร์โทร
- POST /api/members/earn      : สะสมแต้ม (auto-register ถ้าเบอร์ใหม่)

Rate limiting:
  - GET  /api/members/<phone>  → 10 req/minute per IP (prevent brute-force enumeration)
  - POST /api/members/earn     → 20 req/minute per IP
"""

import logging
import time
from collections import defaultdict
from threading import Lock
from flask import Blueprint, jsonify, request
from app.config.db import get_db_cursor

logger = logging.getLogger(__name__)
members_api = Blueprint("members_api", __name__)


# =============================================
# Simple in-process rate limiter (no extra deps)
# Bucket: { ip: [timestamps] }
# =============================================
_rate_buckets: dict = defaultdict(list)
_rate_lock = Lock()

def _is_rate_limited(ip: str, limit: int, window_seconds: int = 60) -> bool:
    """Sliding window rate limiter. Returns True if request should be blocked."""
    now = time.monotonic()
    with _rate_lock:
        timestamps = _rate_buckets[ip]
        # Remove timestamps outside the window
        _rate_buckets[ip] = [t for t in timestamps if now - t < window_seconds]
        if len(_rate_buckets[ip]) >= limit:
            return True
        _rate_buckets[ip].append(now)
        return False


def _validate_phone(phone: str) -> bool:
    return phone and len(phone) == 10 and phone.isdigit()


@members_api.route("/api/members/<phone>", methods=["GET"])
def get_member(phone: str):
    """ค้นหาสมาชิกจากเบอร์โทร (rate limited: 10/min/IP)"""
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()

    if _is_rate_limited(client_ip, limit=10):
        logger.warning(f"[Members] Rate limit hit for GET by IP: {client_ip}")
        return jsonify({"found": False, "message": "Too many requests. Please try again later."}), 429

    if not _validate_phone(phone):
        return jsonify({"found": False, "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                "SELECT user_id, phone_number, points, registered_at, last_use, status "
                "FROM users WHERE phone_number = %s",
                (phone,),
            )
            member = cur.fetchone()

        if not member:
            return jsonify({"found": False, "message": "ไม่พบสมาชิก"}), 404

        return jsonify({
            "found": True,
            "user_id": member["user_id"],
            "phone_number": member["phone_number"],
            "points": member["points"],
            "registered_at": str(member["registered_at"]),
            "last_use": str(member["last_use"]) if member["last_use"] else None,
        }), 200

    except Exception as e:
        logger.error(f"[Members] Error fetching member {phone}: {e}")
        return jsonify({"found": False, "message": "เกิดข้อผิดพลาดในระบบ"}), 500


@members_api.route("/api/members/earn", methods=["POST"])
def earn_points():
    """
    สะสมแต้มหลังจ่ายเงิน (rate limited: 20/min/IP):
    - ถ้าเบอร์ใหม่ → สร้าง user ใหม่
    - ถ้าเบอร์เก่า → บวกแต้มเข้าไป
    แต้มคำนวณจาก total_price (1 บาท = 1 แต้ม, ปัดลง)
    """
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()

    if _is_rate_limited(client_ip, limit=20):
        logger.warning(f"[Members] Rate limit hit for POST /earn by IP: {client_ip}")
        return jsonify({"status": "ERROR", "message": "Too many requests. Please try again later."}), 429

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

    phone = (data.get("phone_number") or "").strip()
    total_price = data.get("total_price", 0)
    charge_id = data.get("charge_id")  # optional: ผูก order กับ user

    if not _validate_phone(phone):
        return jsonify({"status": "ERROR", "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        points_earned = max(1, int(float(total_price)))  # 1 บาท = 1 แต้ม
    except (TypeError, ValueError):
        points_earned = 0

    try:
        with get_db_cursor() as (db, cur):
            # ดึง user หรือสร้างใหม่
            cur.execute(
                "SELECT user_id, points FROM users WHERE phone_number = %s",
                (phone,),
            )
            member = cur.fetchone()

            if member:
                # เบอร์เก่า → บวกแต้ม
                new_points = member["points"] + points_earned
                user_id = member["user_id"]
                cur.execute(
                    "UPDATE users SET points = %s, last_use = NOW() WHERE user_id = %s",
                    (new_points, user_id),
                )
                is_new = False
            else:
                # เบอร์ใหม่ → สร้าง user
                cur.execute(
                    "INSERT INTO users (phone_number, points, last_use) VALUES (%s, %s, NOW())",
                    (phone, points_earned),
                )
                user_id = cur.lastrowid
                new_points = points_earned
                is_new = True

            # ผูก order กับ user ถ้ามี charge_id
            if charge_id:
                cur.execute(
                    "UPDATE orders SET user_id = %s WHERE charge_id = %s AND user_id IS NULL",
                    (user_id, charge_id),
                )

            db.commit()
            logger.info(f"[Members] {'Created' if is_new else 'Updated'} user {phone} → {new_points} pts (+{points_earned})")

        return jsonify({
            "status": "ok",
            "is_new_member": is_new,
            "phone_number": phone,
            "points_earned": points_earned,
            "total_points": new_points,
        }), 200

    except Exception as e:
        logger.error(f"[Members] Error earning points for {phone}: {e}")
        return jsonify({"status": "ERROR", "message": "เกิดข้อผิดพลาดในระบบ"}), 500
