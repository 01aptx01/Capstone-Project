"""Admin API auth — JWT verification via Authorization: Bearer <token>.

Authorization is enforced from DB state (admin is_active + role mappings),
not from the roles embedded in the token.
"""

from functools import wraps

from flask import request, jsonify, g

from app.api.admin.security import decode_access_token


def _current_admin_id() -> int | None:
    """Return the admin user id from the decoded JWT stored on flask.g."""
    return getattr(g, "_admin_id", None)

def _role_implies(required: str, actual_roles: list[str]) -> bool:
    """
    RBAC rule:
    - superadmin implies admin
    - otherwise require exact role
    """
    req = (required or "").strip().lower()
    roles = [(r or "").strip().lower() for r in (actual_roles or [])]
    if req == "admin":
        return ("admin" in roles) or ("superadmin" in roles)
    return req in roles


def roles_required(*required_roles: str):
    """Require one of the given roles (superadmin implies admin)."""
    def decorator(f):
        @wraps(f)
        @admin_required
        def wrapped(*args, **kwargs):
            roles = (getattr(g, "admin", {}) or {}).get("roles") or []
            if not any(_role_implies(r, roles) for r in required_roles):
                return jsonify({"error": "Insufficient permissions."}), 403
            return f(*args, **kwargs)

        return wrapped

    return decorator


def admin_required(f):
    """Protect an endpoint — verify JWT *and* check the admin still exists in DB."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header."}), 401

        token = auth_header[7:]
        try:
            payload = decode_access_token(token)
        except Exception as e:
            # keep message generic to avoid leaking details
            from flask import current_app
            current_app.logger.warning("Admin JWT decode failed: %s", e)
            return jsonify({"error": "Token has expired. Please log in again."}), 401

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
        g.admin = {
            "id": admin.id,
            "email": admin.email,
            "roles": [r.name for r in (admin.roles or [])],
            "is_active": admin.is_active,
        }
        return f(*args, **kwargs)

    return decorated
