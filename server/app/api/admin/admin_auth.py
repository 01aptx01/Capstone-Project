"""Admin authentication endpoints — login, invite, register, me."""

import os
import datetime
import logging

import bcrypt
import jwt
from flask import jsonify, request

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required, _current_admin_id
from app.extensions import db
from app.models.admin_rbac import AdminUser, Role, admin_user_role

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_jwt_secret() -> str:
    return (os.environ.get("ADMIN_JWT_SECRET") or "dev-change-me-to-a-long-random-secret").strip()

_JWT_EXPIRES_H = int(os.environ.get("ADMIN_JWT_EXPIRES_HOURS", "12"))
_INVITE_EXPIRES_H = int(os.environ.get("ADMIN_INVITE_EXPIRES_HOURS", "168"))


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")


def _check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def _make_token(admin: AdminUser, expires_hours: int | None = None) -> str:
    exp_h = expires_hours or _JWT_EXPIRES_H
    roles = [r.name for r in admin.roles] if getattr(admin, "roles", None) else ["admin"]
    payload = {
        "sub": str(admin.id),
        "email": admin.email,
        "roles": roles,
        "type": "admin_access",
        "is_active": admin.is_active,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=exp_h),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm="HS256")


def _admin_to_dict(admin: AdminUser) -> dict:
    return {
        "id": admin.id,
        "email": admin.email,
        "first_name": admin.first_name,
        "last_name": admin.last_name,
        "position": admin.position,
        "phone": admin.phone,
        "is_active": admin.is_active,
        "created_at": admin.created_at.isoformat() if admin.created_at else None,
    }


# ---------------------------------------------------------------------------
# POST /api/admin/auth/login
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/login", methods=["POST"])
def admin_login():
    """Authenticate admin with email + password."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    admin = AdminUser.query.filter_by(email=email).first()
    if not admin or not _check_password(password, admin.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401

    if admin.is_active:
        token = _make_token(admin)
        return jsonify({"token": token, "user": _admin_to_dict(admin)}), 200

    reg_token = _make_token(admin, expires_hours=_INVITE_EXPIRES_H)
    return jsonify({
        "needs_registration": True,
        "registration_token": reg_token,
        "email": admin.email,
    }), 200


# ---------------------------------------------------------------------------
# POST /api/admin/auth/register
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/register", methods=["POST"])
def admin_register():
    """Complete registration for an invited (pending) admin."""
    data = request.get_json(silent=True) or {}
    reg_token = data.get("registration_token") or ""
    new_password = data.get("new_password") or ""
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    position = (data.get("position") or "").strip()
    phone = (data.get("phone") or "").strip()

    if not reg_token or not new_password:
        return jsonify({"error": "Registration token and new password are required."}), 400

    try:
        payload = jwt.decode(reg_token, _get_jwt_secret(), algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Registration link has expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid registration token."}), 401

    admin_id = payload.get("sub")
    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin user not found."}), 404

    if admin.is_active:
        return jsonify({"error": "This account is already active. Please log in."}), 400

    admin.password_hash = _hash_password(new_password)
    admin.first_name = first_name or admin.first_name
    admin.last_name = last_name or admin.last_name
    admin.position = position or admin.position
    admin.phone = phone or admin.phone
    admin.is_active = True
    db.session.commit()

    token = _make_token(admin)
    return jsonify({"token": token, "user": _admin_to_dict(admin)}), 200


# ---------------------------------------------------------------------------
# POST /api/admin/auth/invite (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/invite", methods=["POST"])
@admin_required
def admin_invite():
    """Invite a new admin — create AdminUser with temp password (inactive)."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    temp_password = data.get("temp_password") or ""

    if not email or not temp_password:
        return jsonify({"error": "Email and temporary password are required."}), 400

    existing = AdminUser.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": f"An admin with email {email} already exists."}), 409

    new_admin = AdminUser(
        email=email,
        password_hash=_hash_password(temp_password),
        is_active=False,
    )
    db.session.add(new_admin)
    db.session.commit()

    frontend_url = os.environ.get("ADMIN_FRONTEND_URL", "http://localhost:3001")
    invite_link = f"{frontend_url}/login?email={email}"

    logger.info("✉️  Admin invite created for %s (id=%s)", email, new_admin.id)

    return jsonify({
        "admin": _admin_to_dict(new_admin),
        "invite_link": invite_link,
        "message": f"Invitation created for {email}. Share the login page link with the temporary password.",
    }), 201


# ---------------------------------------------------------------------------
# DELETE /api/admin/auth/revoke/<admin_id> (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/revoke/<int:admin_id>", methods=["DELETE"])
@admin_required
def admin_revoke(admin_id: int):
    """Revoke (deactivate) an admin account and force-kick via Socket.IO."""
    caller_id = _current_admin_id()
    if caller_id == admin_id:
        return jsonify({"error": "You cannot revoke your own access."}), 400

    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found."}), 404

    revoked_email = admin.email
    revoked_id = admin.id

    db.session.delete(admin)
    db.session.commit()

    try:
        from app.realtime.socketio_gateway import sio, ADMIN_ROOM
        sio.emit("admin_force_logout", {
            "admin_id": revoked_id,
            "email": revoked_email,
        }, room=ADMIN_ROOM)
    except Exception as e:
        logger.warning("⚠️  Could not emit admin_force_logout: %s", e)

    logger.info("🚫 Admin revoked: %s (id=%s) by caller id=%s", revoked_email, revoked_id, caller_id)
    return jsonify({"ok": True, "message": f"Access revoked for {revoked_email}."}), 200


# ---------------------------------------------------------------------------
# GET /api/admin/auth/me (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/me", methods=["GET"])
@admin_required
def admin_me():
    """Return current authenticated admin profile."""
    admin_id = _current_admin_id()
    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found."}), 404
    return jsonify({"user": _admin_to_dict(admin)}), 200


# ---------------------------------------------------------------------------
# GET /api/admin/auth/admins (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/admins", methods=["GET"])
@admin_required
def list_admins():
    """List all admin accounts (for the Settings → Admin Permissions tab)."""
    admins = AdminUser.query.order_by(AdminUser.created_at.asc()).all()
    return jsonify({
        "admins": [
            {
                **_admin_to_dict(a),
                "status": "Active" if a.is_active else "Pending",
            }
            for a in admins
        ],
    }), 200


# ---------------------------------------------------------------------------
# Auto-seed first admin (called from factory.py)
# ---------------------------------------------------------------------------

def seed_first_admin(app):
    """Create a default admin if the admin_users table is empty."""
    with app.app_context():
        try:
            count = AdminUser.query.count()
            if count > 0:
                return
            email = os.environ.get("ADMIN_DEFAULT_EMAIL", "admin@modpao.com").strip().lower()
            password = os.environ.get("ADMIN_DEFAULT_PASSWORD", "admin1234")
            first_admin = AdminUser(
                email=email,
                password_hash=_hash_password(password),
                first_name="Admin",
                last_name="",
                is_active=True,
            )
            db.session.add(first_admin)
            db.session.commit()
            logger.info("👤 First admin seeded: %s (id=%s)", email, first_admin.id)
        except Exception as e:
            logger.warning("⚠️  Could not seed first admin: %s", e)
