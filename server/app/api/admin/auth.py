"""Admin authentication routes: login / me / logout (+ default admin seeding)."""

import logging
import os

import jwt
from flask import g, jsonify, request
from sqlalchemy import func, select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required, roles_required
from app.api.admin.security import (
    create_access_token,
    create_invite_token,
    decode_invite_token,
    hash_password,
    verify_password,
)
from app.extensions import db
from app.models import AdminUser, Role
from app.services.email_service import send_admin_invite_email

logger = logging.getLogger(__name__)

MIN_PASSWORD_LENGTH = 8


def _roles_for(admin: AdminUser) -> list[str]:
    return [r.name for r in (admin.roles or [])]


def _frontend_url() -> str:
    return (os.environ.get("ADMIN_FRONTEND_URL") or "http://localhost:3001").rstrip("/")


def _get_or_create_roles(names: list[str]) -> list[Role]:
    out: list[Role] = []
    for raw in names:
        name = (raw or "").strip()
        if not name:
            continue
        role = db.session.scalar(select(Role).where(Role.name == name))
        if not role:
            role = Role(name=name, description=f"{name} role")
            db.session.add(role)
            db.session.flush()
        out.append(role)
    return out


# ─────────────────────────── Routes ───────────────────────────

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    """ตรวจ email + รหัสผ่าน (bcrypt) แล้วออก JWT access token."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "รูปแบบคำขอไม่ถูกต้อง"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "กรุณากรอกอีเมลและรหัสผ่าน"}), 400

    admin = db.session.scalar(select(AdminUser).where(AdminUser.email == email))
    # ข้อความ generic เพื่อไม่บอกว่าผิดที่ email หรือ password
    if not admin or not admin.is_active or not verify_password(password, admin.password_hash):
        return jsonify({"error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"}), 401

    roles = _roles_for(admin)
    token = create_access_token(admin_id=admin.id, email=admin.email, roles=roles)
    logger.info(f"🔓 [Auth] admin '{admin.email}' เข้าสู่ระบบสำเร็จ")
    return (
        jsonify(
            {
                "token": token,
                "admin": {"id": admin.id, "email": admin.email, "roles": roles},
            }
        ),
        200,
    )


@admin_bp.route("/me", methods=["GET"])
@admin_required
def admin_me():
    """คืนข้อมูล admin ปัจจุบันจาก JWT (ใช้ตรวจว่า token ยังใช้ได้)."""
    return jsonify({"admin": g.admin}), 200


@admin_bp.route("/logout", methods=["POST"])
@admin_required
def admin_logout():
    """JWT เป็น stateless — ฝั่ง client ลบ token ทิ้งเอง (endpoint นี้ไว้เพื่อความสมบูรณ์)."""
    return jsonify({"ok": True}), 200


# ─────────────────────── Invite / Register (admin ใหม่) ───────────────────────

@admin_bp.route("/invites", methods=["POST"])
@roles_required("superadmin")
def create_admin_invite():
    """superadmin เชิญ admin ใหม่ผ่าน email → ออก invite token + ส่งอีเมล (ถ้าตั้ง SMTP)."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    roles = data.get("roles") or ["admin"]

    if not email or "@" not in email:
        return jsonify({"error": "อีเมลไม่ถูกต้อง"}), 400
    if not isinstance(roles, list) or not all(isinstance(r, str) for r in roles) or not roles:
        return jsonify({"error": "roles ไม่ถูกต้อง"}), 400

    existing = db.session.scalar(select(AdminUser).where(AdminUser.email == email))
    if existing and existing.is_active:
        return jsonify({"error": "อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว"}), 409

    token = create_invite_token(email=email, roles=roles)
    invite_link = f"{_frontend_url()}/register?token={token}"
    emailed = send_admin_invite_email(email, invite_link)
    logger.info(f"✉️ [Invite] {g.admin['email']} เชิญ '{email}' (emailed={emailed})")

    return (
        jsonify(
            {
                "email": email,
                "roles": roles,
                "invite_link": invite_link,
                "emailed": emailed,
            }
        ),
        201,
    )


@admin_bp.route("/admins", methods=["POST"])
@roles_required("superadmin")
def create_admin_direct():
    """superadmin สร้างบัญชี admin ตรงๆ พร้อม "รหัสผ่านชั่วคราว" — ใช้งานได้ทันที
    (เหมาะตอนยังไม่ได้ตั้ง SMTP — สร้างเสร็จเอา email+รหัสไปให้เขา login ได้เลย)."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    roles = data.get("roles") or ["admin"]

    if not email or "@" not in email:
        return jsonify({"error": "อีเมลไม่ถูกต้อง"}), 400
    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"รหัสผ่านต้องยาวอย่างน้อย {MIN_PASSWORD_LENGTH} ตัวอักษร"}), 400
    if not isinstance(roles, list) or not all(isinstance(r, str) for r in roles) or not roles:
        return jsonify({"error": "roles ไม่ถูกต้อง"}), 400

    existing = db.session.scalar(select(AdminUser).where(AdminUser.email == email))
    if existing and existing.is_active:
        return jsonify({"error": "อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว"}), 409

    try:
        if not existing:
            admin = AdminUser(email=email, password_hash=hash_password(password), is_active=True)
            db.session.add(admin)
        else:
            admin = existing
            admin.password_hash = hash_password(password)
            admin.is_active = True
        admin.roles = _get_or_create_roles(roles)
        db.session.commit()
    except Exception as e:  # noqa: BLE001
        db.session.rollback()
        logger.error(f"[CreateAdmin] สร้างบัญชีไม่สำเร็จ ({email}): {e}")
        return jsonify({"error": "สร้างบัญชีไม่สำเร็จ"}), 500

    logger.info(f"🆕 [CreateAdmin] {g.admin['email']} สร้างบัญชี admin '{email}'")
    return jsonify({"email": admin.email, "roles": _roles_for(admin)}), 201


@admin_bp.route("/invites/accept", methods=["GET"])
def get_invite_info():
    """หน้า register เรียกเพื่อตรวจ invite token + แสดงอีเมลที่ถูกเชิญ (ล็อกไว้)."""
    token = request.args.get("token", "")
    try:
        payload = decode_invite_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "คำเชิญหมดอายุแล้ว"}), 400
    except jwt.PyJWTError:
        return jsonify({"error": "คำเชิญไม่ถูกต้อง"}), 400
    return jsonify({"email": payload.get("email"), "roles": payload.get("roles", [])}), 200


@admin_bp.route("/register", methods=["POST"])
def admin_register():
    """ผู้ถูกเชิญตั้งรหัสผ่านจาก invite token → สร้างบัญชี + auto-login (คืน access token)."""
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    password = data.get("password") or ""

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"รหัสผ่านต้องยาวอย่างน้อย {MIN_PASSWORD_LENGTH} ตัวอักษร"}), 400

    try:
        payload = decode_invite_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "คำเชิญหมดอายุแล้ว"}), 400
    except jwt.PyJWTError:
        return jsonify({"error": "คำเชิญไม่ถูกต้อง"}), 400

    email = (payload.get("email") or "").strip().lower()
    role_names = payload.get("roles") or ["admin"]
    if not email:
        return jsonify({"error": "คำเชิญไม่ถูกต้อง"}), 400

    admin = db.session.scalar(select(AdminUser).where(AdminUser.email == email))
    # กัน token ถูกใช้ซ้ำหลังลงทะเบียนแล้ว (single-use โดยพฤตินัย)
    if admin and admin.is_active:
        return jsonify({"error": "บัญชีนี้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ"}), 409

    try:
        if not admin:
            admin = AdminUser(email=email, password_hash=hash_password(password), is_active=True)
            db.session.add(admin)
        else:
            admin.password_hash = hash_password(password)
            admin.is_active = True

        admin.roles = _get_or_create_roles(role_names)
        db.session.commit()
    except Exception as e:  # noqa: BLE001
        db.session.rollback()
        logger.error(f"[Register] สร้างบัญชี admin ไม่สำเร็จ ({email}): {e}")
        return jsonify({"error": "ลงทะเบียนไม่สำเร็จ"}), 500

    roles = _roles_for(admin)
    access = create_access_token(admin_id=admin.id, email=admin.email, roles=roles)
    logger.info(f"🆕 [Register] สร้างบัญชี admin '{email}' สำเร็จ")
    return (
        jsonify(
            {
                "token": access,
                "admin": {"id": admin.id, "email": admin.email, "roles": roles},
            }
        ),
        201,
    )


# ─────────────────────────── Seeding ───────────────────────────

def seed_default_admin() -> None:
    """สร้าง admin เริ่มต้น + role 'superadmin' ถ้ายังไม่มี admin ในระบบ (idempotent).

    อ่านค่าเริ่มต้นจาก env:
      ADMIN_DEFAULT_EMAIL    (default: admin@modpao.com)
      ADMIN_DEFAULT_PASSWORD (default: admin1234)
    """
    email = (os.environ.get("ADMIN_DEFAULT_EMAIL") or "admin@modpao.com").strip().lower()
    password = os.environ.get("ADMIN_DEFAULT_PASSWORD") or "admin1234"

    try:
        count = db.session.scalar(select(func.count(AdminUser.id))) or 0
        if count > 0:
            return  # มี admin อยู่แล้ว ไม่ต้อง seed

        role = db.session.scalar(select(Role).where(Role.name == "superadmin"))
        if not role:
            role = Role(name="superadmin", description="Full administrative access")
            db.session.add(role)
            db.session.flush()

        admin = AdminUser(
            email=email,
            password_hash=hash_password(password),
            is_active=True,
        )
        admin.roles.append(role)
        db.session.add(admin)
        db.session.commit()
        logger.warning(
            f"🔐 [Seed] สร้าง admin เริ่มต้น '{email}' "
            f"(รหัสผ่านจาก ADMIN_DEFAULT_PASSWORD หรือค่า default 'admin1234') "
            f"— กรุณาเปลี่ยนรหัสผ่านใน production!"
        )
    except Exception as e:  # noqa: BLE001 — startup seed ต้องไม่ทำให้ app ล้ม
        db.session.rollback()
        logger.error(f"[Seed] สร้าง admin เริ่มต้นไม่สำเร็จ: {e}")
