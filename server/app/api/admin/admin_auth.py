"""Admin authentication endpoints — login, invite, register, me.

RBAC source of truth is the database (roles + admin_user_role mapping).
"""

import os
import logging

from flask import jsonify, request

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required, roles_required, _current_admin_id
from app.extensions import db
from app.models.admin_rbac import AdminUser, Role
from app.api.admin.security import (
    create_access_token,
    create_registration_token,
    decode_registration_token,
    hash_password,
    validate_new_password,
    verify_password,
)

logger = logging.getLogger(__name__)

def _roles_for(admin: AdminUser) -> list[str]:
    return [r.name for r in (admin.roles or [])]


def _admin_to_dict(admin: AdminUser) -> dict:
    return {
        "id": admin.id,
        "email": admin.email,
        "first_name": admin.first_name,
        "last_name": admin.last_name,
        "position": admin.position,
        "phone": admin.phone,
        "is_active": admin.is_active,
        "roles": _roles_for(admin),
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
    if not admin or not verify_password(password, admin.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401

    if admin.is_active:
        token = create_access_token(admin_id=admin.id, email=admin.email, roles=_roles_for(admin))
        return jsonify({"token": token, "user": _admin_to_dict(admin)}), 200

    reg_token = create_registration_token(admin_id=admin.id)
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

    pw_err = validate_new_password(new_password)
    if pw_err:
        return jsonify({"error": pw_err}), 400

    try:
        payload = decode_registration_token(reg_token)
    except Exception:
        return jsonify({"error": "Invalid registration token."}), 401

    admin_id = payload.get("sub")
    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin user not found."}), 404

    if admin.is_active:
        return jsonify({"error": "This account is already active. Please log in."}), 400

    admin.password_hash = hash_password(new_password)
    admin.first_name = first_name or admin.first_name
    admin.last_name = last_name or admin.last_name
    admin.position = position or admin.position
    admin.phone = phone or admin.phone
    admin.is_active = True
    db.session.commit()

    token = create_access_token(admin_id=admin.id, email=admin.email, roles=_roles_for(admin))
    return jsonify({"token": token, "user": _admin_to_dict(admin)}), 200


# ---------------------------------------------------------------------------
# POST /api/admin/auth/invite (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/invite", methods=["POST"])
@roles_required("superadmin")
def admin_invite():
    """Invite a new admin — create AdminUser with temp password (inactive)."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    temp_password = data.get("temp_password") or ""

    if not email or not temp_password:
        return jsonify({"error": "Email and temporary password are required."}), 400

    pw_err = validate_new_password(temp_password)
    if pw_err:
        return jsonify({"error": pw_err}), 400

    existing = AdminUser.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": f"An admin with email {email} already exists."}), 409

    new_admin = AdminUser(
        email=email,
        password_hash=hash_password(temp_password),
        is_active=False,
    )
    db.session.add(new_admin)
    db.session.flush()

    # Default role mapping: invited admins start as 'admin'
    role_admin = Role.query.filter_by(name="admin").first()
    if not role_admin:
        role_admin = Role(name="admin", description="Standard administrative access")
        db.session.add(role_admin)
        db.session.flush()
    new_admin.roles.append(role_admin)

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
@roles_required("superadmin")
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

@admin_bp.route("/auth/change-password", methods=["POST"])
@roles_required("admin")
def admin_change_password():
    """Change password for the currently authenticated admin."""
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not current_password:
        return jsonify({"error": "Current password is required."}), 400

    pw_err = validate_new_password(new_password)
    if pw_err:
        return jsonify({"error": pw_err}), 400

    admin_id = _current_admin_id()
    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found."}), 404

    if not verify_password(current_password, admin.password_hash):
        return jsonify({"error": "Current password is incorrect."}), 401

    if verify_password(new_password, admin.password_hash):
        return jsonify(
            {"error": "New password must be different from the current password."}
        ), 400

    admin.password_hash = hash_password(new_password)
    db.session.commit()

    logger.info("🔑 Admin password changed: %s (id=%s)", admin.email, admin.id)
    return jsonify({"ok": True, "message": "Password updated successfully."}), 200


@admin_bp.route("/auth/me", methods=["GET", "PATCH"])
@roles_required("admin")
def admin_me():
    """Get or update the current authenticated admin profile."""
    admin_id = _current_admin_id()
    admin = AdminUser.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found."}), 404

    if request.method == "GET":
        return jsonify({"user": _admin_to_dict(admin)}), 200

    data = request.get_json(silent=True) or {}
    if "first_name" in data:
        admin.first_name = (data.get("first_name") or "").strip()
    if "last_name" in data:
        admin.last_name = (data.get("last_name") or "").strip()
    if "position" in data:
        admin.position = (data.get("position") or "").strip()
    if "phone" in data:
        admin.phone = (data.get("phone") or "").strip()

    db.session.commit()
    logger.info("📝 Admin profile updated: %s (id=%s)", admin.email, admin.id)
    return jsonify({"user": _admin_to_dict(admin)}), 200


# ---------------------------------------------------------------------------
# GET /api/admin/auth/admins (requires active admin)
# ---------------------------------------------------------------------------

@admin_bp.route("/auth/admins", methods=["GET"])
@roles_required("superadmin")
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
                password_hash=hash_password(password),
                first_name="Admin",
                last_name="",
                is_active=True,
            )
            db.session.add(first_admin)
            db.session.flush()

            # Ensure base roles exist
            role_admin = Role.query.filter_by(name="admin").first()
            if not role_admin:
                role_admin = Role(name="admin", description="Standard administrative access")
                db.session.add(role_admin)
                db.session.flush()

            role_super = Role.query.filter_by(name="superadmin").first()
            if not role_super:
                role_super = Role(name="superadmin", description="Full administrative access")
                db.session.add(role_super)
                db.session.flush()

            # Seed first admin as superadmin only
            first_admin.roles.append(role_super)

            db.session.commit()
            logger.info("👤 First admin seeded: %s (id=%s) as superadmin", email, first_admin.id)
        except Exception as e:
            logger.warning("⚠️  Could not seed first admin: %s", e)
