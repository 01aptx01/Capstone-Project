"""Admin machine and inventory endpoints."""

import secrets
from decimal import Decimal

import bcrypt
from flask import jsonify, request, g
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.api.admin import admin_bp
from app.api.admin.decorators import roles_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Machine, MachineSlot, Product

_MAX_SLOTS_PER_MACHINE = 6


def _log_machine_modification_event(machine_code: str, action: str):
    import random
    from app.models.machine import MachineEvent
    from app.models.admin_rbac import AdminUser
    try:
        current_admin = AdminUser.query.get(g._admin_id)
        if current_admin:
            admin_name = f"{current_admin.first_name or ''} {current_admin.last_name or ''}".strip() or current_admin.email
            ev = MachineEvent(
                machine_code=machine_code,
                job_id="manual_mod",
                event_type="Machine Modified",
                state="INFO",
                seq=random.randint(1, 2000000000),
                payload_json={
                    "admin_id": g._admin_id,
                    "admin_name": admin_name,
                    "action": action
                }
            )
            db.session.add(ev)
            db.session.commit()
    except Exception as e:
        print(f"Error logging machine modification event: {e}")


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
@roles_required("admin")
def admin_machines_collection():
    if request.method == "POST":
        return _admin_create_machine()
    page, per_page = get_pagination_params()
    status = (request.args.get("status") or "").strip() or None
    q = (request.args.get("q") or "").strip()

    filters = []
    
    from app.models.admin_rbac import AdminUser
    current_admin = AdminUser.query.get(g._admin_id)
    if current_admin and current_admin.email != "admin@modpao.com":
        filters.append(Machine.created_by == g._admin_id)

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
        created_by=g._admin_id,
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


def _machine_detail_payload(m: Machine) -> dict:
    slots = sorted(m.slots, key=lambda s: s.slot_number)
    return {
        **_machine_summary(m),
        "slots": [_slot_to_dict(s) for s in slots],
    }


@admin_bp.route("/machines/<machine_code>/slots", methods=["PUT"])
@roles_required("admin")
def admin_put_machine_slots(machine_code: str):
    """Replace all inventory slots for a machine (full snapshot)."""
    m = db.session.get(Machine, machine_code)
    if not m:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(silent=True) or {}
    raw_slots = data.get("slots")
    if not isinstance(raw_slots, list):
        return jsonify({"error": "slots must be an array"}), 400

    seen_numbers: set[int] = set()
    normalized: list[tuple[int, int, int]] = []

    for item in raw_slots:
        if not isinstance(item, dict):
            return jsonify({"error": "each slot must be an object"}), 400
        try:
            sn = int(item.get("slot_number"))
            pid = int(item.get("product_id"))
            qty = int(item.get("quantity"))
        except (TypeError, ValueError):
            return jsonify(
                {"error": "slot_number, product_id, and quantity must be integers"}
            ), 400

        if sn < 1 or sn > _MAX_SLOTS_PER_MACHINE:
            return jsonify(
                {
                    "error": f"slot_number must be between 1 and {_MAX_SLOTS_PER_MACHINE}",
                }
            ), 400
        if qty < 0:
            return jsonify({"error": "quantity must be >= 0"}), 400
        if sn in seen_numbers:
            return jsonify({"error": "duplicate slot_number in request"}), 400
        seen_numbers.add(sn)
        normalized.append((sn, pid, qty))

    if len(normalized) > _MAX_SLOTS_PER_MACHINE:
        return jsonify(
            {"error": f"a machine can have at most {_MAX_SLOTS_PER_MACHINE} slots"}
        ), 400

    product_ids = [row[1] for row in normalized]
    if len(set(product_ids)) != len(product_ids):
        return jsonify(
            {"error": "duplicate product_id: each slot must have a unique product"}
        ), 400

    pids = {row[1] for row in normalized}
    if pids:
        found = db.session.scalars(
            select(Product.product_id).where(Product.product_id.in_(pids))
        ).all()
        missing = pids - set(found)
        if missing:
            return jsonify({"error": f"unknown product_id: {sorted(missing)}"}), 400

    try:
        db.session.query(MachineSlot).filter_by(machine_code=machine_code).delete(
            synchronize_session=False
        )
        for sn, pid, qty in sorted(normalized, key=lambda x: x[0]):
            db.session.add(
                MachineSlot(
                    machine_code=machine_code,
                    slot_number=sn,
                    product_id=pid,
                    quantity=qty,
                )
            )
        db.session.commit()
        _log_machine_modification_event(machine_code, "updated_slots")
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "failed to save slots"}), 400

    stmt = (
        select(Machine)
        .where(Machine.machine_code == machine_code)
        .options(
            selectinload(Machine.slots).selectinload(MachineSlot.product),
        )
    )
    m2 = db.session.scalars(stmt).first()
    assert m2 is not None
    return jsonify(_machine_detail_payload(m2)), 200


def _admin_put_machine_metadata(machine_code: str):
    m = db.session.get(Machine, machine_code)
    if not m:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "JSON body required"}), 400

    has_update = False
    if "location" in data:
        loc = data.get("location")
        if loc is None or (isinstance(loc, str) and not loc.strip()):
            m.location = None
        else:
            m.location = str(loc).strip() or None
        has_update = True

    if "status" in data:
        st = (data.get("status") or "").strip()
        if st not in ("online", "maintenance", "offline"):
            return jsonify({"error": "invalid status"}), 400
        m.status = st
        has_update = True

    if not has_update:
        return jsonify({"error": "provide at least one of: location, status"}), 400

    try:
        db.session.commit()
        _log_machine_modification_event(machine_code, "updated_metadata")
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "update failed"}), 400

    stmt = (
        select(Machine)
        .where(Machine.machine_code == machine_code)
        .options(
            selectinload(Machine.slots).selectinload(MachineSlot.product),
        )
    )
    m2 = db.session.scalars(stmt).first()
    assert m2 is not None
    return jsonify(_machine_detail_payload(m2)), 200


def _admin_delete_machine(machine_code: str):
    m = db.session.get(Machine, machine_code)
    if not m:
        return jsonify({"error": "not found"}), 404

    from app.models.order_and_payment import Order
    order_count = db.session.scalar(
        select(func.count()).select_from(Order).where(Order.machine_code == machine_code)
    ) or 0
    if order_count > 0:
        return jsonify(
            {"error": f"ไม่สามารถลบตู้ได้ มีออเดอร์ที่เกี่ยวข้องอยู่ {order_count} รายการ"}
        ), 409

    from app.models.machine import MachineEvent
    db.session.query(MachineEvent).filter_by(machine_code=machine_code).delete(
        synchronize_session=False
    )

    db.session.delete(m)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "ลบตู้ไม่สำเร็จ"}), 500

    return jsonify({"ok": True, "machine_code": machine_code}), 200


@admin_bp.route("/machines/<machine_code>", methods=["GET", "PUT", "DELETE"])
@roles_required("admin")
def admin_machine_detail(machine_code: str):
    if request.method == "DELETE":
        return _admin_delete_machine(machine_code)
    if request.method == "PUT":
        return _admin_put_machine_metadata(machine_code)
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

    return jsonify(_machine_detail_payload(m)), 200
