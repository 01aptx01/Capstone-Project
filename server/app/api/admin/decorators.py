"""Admin API auth — JWT verification via Authorization: Bearer <token>.

Every protected request also verifies that the admin still exists and is active
in the database, so that a revoked admin is kicked out immediately.
"""

import os
from functools import wraps

import jwt
from flask import request, jsonify, g

def _get_jwt_secret() -> str:
    # Strip any \r or spaces to prevent CRLF env files bugs in Docker
    return (os.environ.get("ADMIN_JWT_SECRET") or "dev-change-me-to-a-long-random-secret").strip()


def _current_admin_id() -> int | None:
    """Return the admin user id from the decoded JWT stored on flask.g."""
    return getattr(g, "_admin_id", None)


def admin_required(f):
    """Protect an endpoint — verify JWT *and* check the admin still exists in DB."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header."}), 401

        token = auth_header[7:]
        try:
            payload = jwt.decode(token, _get_jwt_secret(), algorithms=["HS256"])
        except jwt.ExpiredSignatureError as e:
            from flask import current_app
            current_app.logger.warning("JWT ExpiredSignatureError: %s", e)
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError as e:
            from flask import current_app
            current_app.logger.warning("JWT InvalidTokenError: %s, Token: %s, Secret: %s", e, token, _get_jwt_secret())
            return jsonify({"error": "Invalid token."}), 401

        if not payload.get("is_active", False):
            return jsonify({"error": "Account is pending activation."}), 403

        try:
            admin_id = int(payload.get("sub"))
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid token subject."}), 401

        # DB-level check: admin must still exist and be active
        from app.models.admin_rbac import AdminUser

        admin = AdminUser.query.get(admin_id)
        if not admin or not admin.is_active:
            return jsonify({"error": "Your account has been revoked. Please contact the administrator."}), 401

        g._admin_id = admin_id
        return f(*args, **kwargs)

    return decorated
