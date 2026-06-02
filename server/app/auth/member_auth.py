"""JWT helpers and @member_required for web-ui member APIs."""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable

import jwt
from flask import g, jsonify, request

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = int(os.environ.get("JWT_EXPIRES_HOURS", "168"))


def create_access_token(phone_number: str) -> str:
    now = datetime.utcnow()
    payload = {
        "phone_number": phone_number,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRES_HOURS),
        "type": "member",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def get_bearer_phone() -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None
    try:
        payload = _decode_token(token)
    except jwt.PyJWTError:
        return None
    phone = payload.get("phone_number")
    if not phone or payload.get("type") != "member":
        return None
    return str(phone)


def member_required(f: Callable) -> Callable:
    @wraps(f)
    def decorated(*args, **kwargs):
        phone = get_bearer_phone()
        if not phone:
            return jsonify(
                {"error": "unauthorized", "message": "ต้องเข้าสู่ระบบก่อน"}
            ), 401
        g.member_phone = phone
        return f(*args, **kwargs)

    return decorated


def require_path_phone(phone: str) -> tuple[Any, int] | None:
    """Return error response if path phone does not match token."""
    member = getattr(g, "member_phone", None)
    if not member or member != phone:
        return jsonify(
            {"error": "forbidden", "message": "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"}
        ), 403
    return None
