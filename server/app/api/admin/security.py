"""Password hashing (bcrypt) + JWT (PyJWT / HS256) helpers for admin auth."""

import datetime
import logging
import os

import bcrypt
import jwt  # PyJWT

logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
JWT_TOKEN_TYPE = "admin_access"
JWT_INVITE_TYPE = "admin_invite"
JWT_REGISTER_TYPE = "admin_register"

# ใช้เฉพาะตอน dev ถ้าไม่ได้ตั้ง ADMIN_JWT_SECRET — production ต้องตั้งค่าจริง
_DEV_FALLBACK_SECRET = "dev-change-me-to-a-long-random-secret"


def _jwt_secret() -> str:
    secret = (os.environ.get("ADMIN_JWT_SECRET") or "").strip()
    if not secret:
        logger.warning(
            "⚠️ [Auth] ADMIN_JWT_SECRET ไม่ได้ตั้งค่า — ใช้ค่า fallback สำหรับ dev เท่านั้น "
            "(ต้องตั้งค่าจริงใน production)"
        )
        return _DEV_FALLBACK_SECRET
    return secret


def _jwt_expires_hours() -> int:
    try:
        return int(os.environ.get("ADMIN_JWT_EXPIRES_HOURS", "12"))
    except (TypeError, ValueError):
        return 12


def _invite_expires_hours() -> int:
    try:
        return int(os.environ.get("ADMIN_INVITE_EXPIRES_HOURS", "168"))  # 7 วัน
    except (TypeError, ValueError):
        return 168


# ─────────────────────────── Password ───────────────────────────

def hash_password(plain: str) -> str:
    """คืน bcrypt hash (utf-8 string) ของรหัสผ่าน."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """ตรวจรหัสผ่านกับ bcrypt hash — ปลอดภัยต่อ input ว่าง/ผิดรูปแบบ."""
    if not plain or not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ─────────────────────────── JWT ───────────────────────────

def create_access_token(*, admin_id: int, email: str, roles: list[str]) -> str:
    """ออก JWT access token สำหรับ admin (อายุตาม ADMIN_JWT_EXPIRES_HOURS)."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(admin_id),
        "email": email,
        # roles are informational only — authorization should query roles from DB
        "roles": roles,
        "type": JWT_TOKEN_TYPE,
        "iat": now,
        "exp": now + datetime.timedelta(hours=_jwt_expires_hours()),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """ถอดรหัส + ตรวจลายเซ็น/วันหมดอายุ JWT — โยน jwt.PyJWTError ถ้าไม่ผ่าน."""
    payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    if payload.get("type") != JWT_TOKEN_TYPE:
        raise jwt.InvalidTokenError("wrong token type")
    return payload


def create_invite_token(*, email: str, roles: list[str]) -> str:
    """ออก JWT คำเชิญสำหรับ admin ใหม่ (ใช้ตั้งรหัสผ่านครั้งแรก, อายุ ~7 วัน)."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "email": email,
        "roles": roles,
        "type": JWT_INVITE_TYPE,
        "iat": now,
        "exp": now + datetime.timedelta(hours=_invite_expires_hours()),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_invite_token(token: str) -> dict:
    """ถอดรหัส + ตรวจ JWT คำเชิญ — โยน jwt.PyJWTError ถ้าไม่ผ่าน."""
    payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    if payload.get("type") != JWT_INVITE_TYPE:
        raise jwt.InvalidTokenError("wrong token type")
    return payload


def create_registration_token(*, admin_id: int) -> str:
    """ออก JWT สำหรับยืนยันการสมัครครั้งแรกของ admin ที่ถูกเชิญ (อายุ ~7 วัน)."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(admin_id),
        "type": JWT_REGISTER_TYPE,
        "iat": now,
        "exp": now + datetime.timedelta(hours=_invite_expires_hours()),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_registration_token(token: str) -> dict:
    """ถอดรหัส + ตรวจ JWT สำหรับสมัครครั้งแรก — โยน jwt.PyJWTError ถ้าไม่ผ่าน."""
    payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    if payload.get("type") != JWT_REGISTER_TYPE:
        raise jwt.InvalidTokenError("wrong token type")
    return payload
