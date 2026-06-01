"""Admin API auth — JWT Bearer token validation + role-based (RBAC) checks."""

from functools import wraps

import jwt
from flask import g, jsonify, request

from app.api.admin.security import decode_access_token


def _extract_bearer_token() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[len("Bearer "):].strip() or None
    return None


def admin_required(f):
    """ต้องมี JWT ที่ถูกต้องใน header `Authorization: Bearer <token>`.

    ถ้าผ่าน จะแนบข้อมูล admin ไว้ที่ `flask.g.admin` = {id, email, roles}.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "ต้องเข้าสู่ระบบก่อน (missing token)"}), 401
        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"}), 401
        except jwt.PyJWTError:
            return jsonify({"error": "โทเค็นไม่ถูกต้อง"}), 401

        try:
            admin_id = int(payload.get("sub"))
        except (TypeError, ValueError):
            return jsonify({"error": "โทเค็นไม่ถูกต้อง"}), 401

        g.admin = {
            "id": admin_id,
            "email": payload.get("email"),
            "roles": list(payload.get("roles") or []),
        }
        return f(*args, **kwargs)

    return decorated


def roles_required(*required_roles: str):
    """ต้องมี JWT ที่ถูกต้อง + มีอย่างน้อย 1 role ที่กำหนด (RBAC)."""

    def wrapper(f):
        @wraps(f)
        @admin_required
        def decorated(*args, **kwargs):
            user_roles = set(getattr(g, "admin", {}).get("roles", []))
            if not user_roles.intersection(required_roles):
                return jsonify({"error": "สิทธิ์ไม่เพียงพอ"}), 403
            return f(*args, **kwargs)

        return decorated

    return wrapper
