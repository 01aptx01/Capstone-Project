"""Admin machine and inventory endpoints."""

import secrets
from decimal import Decimal

import bcrypt
from flask import jsonify, request
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Machine, MachineSlot


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _machine_summary(m: Machine) -> dict:
    return {
        "machine_code": m.machine_code,
        "location": m.location,
        "status": m.status,
        "last_active": m.last_active.isoformat() if m.last_active else None,
        "is_online": bool(m.is_online),
    }


@admin_bp.route("/machines", methods=["GET", "POST"])
@admin_required
def admin_machines_collection():
    if request.method == "POST":
        return _admin_create_machine()
    page, per_page = get_pagination_params()
    status = (request.args.get("status") or "").strip() or None
    q = (request.args.get("q") or "").strip()

    filters = []
    if status:
        filters.append(Machine.status == status)
    if q:
        pattern = f"%{q.lower()}%"
        filters.append(
            or_(
                func.lower(Machine.machine_code).like(pattern),
                func.lower(func.coalesce(Machine.location, "")).like(pattern),
            )
        )

    count_stmt = select(func.count(Machine.machine_code))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.session.scalar(count_stmt) or 0

    list_stmt = select(Machine)
    if filters:
        list_stmt = list_stmt.where(*filters)
    list_stmt = (
        list_stmt.order_by(Machine.machine_code)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = db.session.scalars(list_stmt).all()
    items = [_machine_summary(m) for m in rows]

    return jsonify(list_envelope(items, total, page, per_page)), 200


def _admin_create_machine():
    """Create a machine; returns a one-time plaintext secret token for the admin to copy."""
    data = request.get_json(silent=True) or {}
    machine_code = (data.get("machine_code") or "").strip()
    if not machine_code:
        return jsonify({"error": "machine_code is required"}), 400
    if len(machine_code) > 20:
        return jsonify({"error": "machine_code must be at most 20 characters"}), 400

    if db.session.get(Machine, machine_code):
        return jsonify({"error": "machine_code already exists"}), 409

    raw_token = secrets.token_hex(16)
    token_hash = bcrypt.hashpw(raw_token.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    location = (data.get("location") or "").strip() or None
    status = (data.get("status") or "online").strip() or "online"
    if status not in ("online", "maintenance", "offline"):
        return jsonify({"error": "invalid status"}), 400

    machine = Machine(
        machine_code=machine_code,
        location=location,
        status=status,
        secret_token_hash=token_hash,
        is_online=False,
    )
    db.session.add(machine)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "machine_code already exists"}), 409

    payload = {**_machine_summary(machine), "secret_token": raw_token}
    return jsonify(payload), 201


def _slot_to_dict(slot: MachineSlot) -> dict:
    prod = slot.product
    product_payload = None
    if prod:
        product_payload = {
            "product_id": prod.product_id,
            "name": prod.name,
            "price": _dec(prod.price),
        }
    return {
        "id": slot.id,
        "slot_number": slot.slot_number,
        "product_id": slot.product_id,
        "quantity": slot.quantity,
        "product": product_payload,
    }


@admin_bp.route("/machines/<machine_code>", methods=["GET"])
@admin_required
def admin_get_machine(machine_code: str):
    stmt = (
        select(Machine)
        .where(Machine.machine_code == machine_code)
        .options(
            selectinload(Machine.slots).selectinload(MachineSlot.product),
        )
    )
    m = db.session.scalars(stmt).first()
    if not m:
        return jsonify({"error": "not found"}), 404

    slots = sorted(m.slots, key=lambda s: s.slot_number)
    payload = {
        **_machine_summary(m),
        "slots": [_slot_to_dict(s) for s in slots],
    }
    return jsonify(payload), 200
