"""Admin order list with customer and transaction context."""

from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Order, Transaction


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _tx_to_dict(t: Transaction) -> dict:
    return {
        "id": t.id,
        "provider": t.provider,
        "provider_ref": t.provider_ref,
        "amount": _dec(t.amount),
        "currency": t.currency,
        "status": t.status,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


def _order_list_item(o: Order) -> dict:
    phone = o.member.phone_number if o.member else None
    txs = sorted(o.transactions, key=lambda x: x.id) if o.transactions else []
    return {
        "order_id": o.order_id,
        "machine_code": o.machine_code,
        "user_id": o.user_id,
        "customer_phone": phone,
        "promotion_id": o.promotion_id,
        "charge_id": o.charge_id,
        "total_price": _dec(o.total_price),
        "payment_method": o.payment_method,
        "status": o.status,
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "updated_at": o.updated_at.isoformat() if o.updated_at else None,
        "transactions": [_tx_to_dict(t) for t in txs],
    }


@admin_bp.route("/orders", methods=["GET"])
@admin_required
def admin_list_orders():
    page, per_page = get_pagination_params()
    status_filter = (request.args.get("status") or "").strip() or None
    machine_code = (request.args.get("machine_code") or "").strip() or None

    filters = []
    if status_filter:
        filters.append(Order.status == status_filter)
    if machine_code:
        filters.append(Order.machine_code == machine_code)

    count_stmt = select(func.count(Order.order_id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.session.scalar(count_stmt) or 0

    list_stmt = select(Order).options(
        selectinload(Order.member),
        selectinload(Order.transactions),
    )
    if filters:
        list_stmt = list_stmt.where(*filters)
    list_stmt = (
        list_stmt.order_by(Order.order_id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = db.session.scalars(list_stmt).all()
    items = [_order_list_item(o) for o in rows]

    return jsonify(list_envelope(items, total, page, per_page)), 200
