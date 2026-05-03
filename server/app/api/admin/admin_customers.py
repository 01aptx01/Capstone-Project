"""Admin endpoints for member customers (User model)."""

from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Order, User

ORDER_HISTORY_LIMIT = 50


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _user_to_dict(u: User) -> dict:
    return {
        "user_id": u.user_id,
        "phone_number": u.phone_number,
        "points": u.points,
        "status": u.status,
        "registered_at": u.registered_at.isoformat() if u.registered_at else None,
        "last_use": u.last_use.isoformat() if u.last_use else None,
    }


@admin_bp.route("/customers", methods=["GET"])
@admin_required
def admin_list_customers():
    page, per_page = get_pagination_params()
    q = (request.args.get("q") or "").strip()

    filters = []
    if q:
        pattern = f"%{q}%"
        filters.append(User.phone_number.like(pattern))

    count_stmt = select(func.count(User.user_id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.session.scalar(count_stmt) or 0

    list_stmt = select(User)
    if filters:
        list_stmt = list_stmt.where(*filters)
    list_stmt = (
        list_stmt.order_by(User.user_id)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = db.session.scalars(list_stmt).all()
    items = [_user_to_dict(u) for u in rows]

    return jsonify(list_envelope(items, total, page, per_page)), 200


def _order_summary(o: Order) -> dict:
    return {
        "order_id": o.order_id,
        "status": o.status,
        "total_price": _dec(o.total_price),
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "charge_id": o.charge_id,
    }


@admin_bp.route("/customers/<int:user_id>", methods=["GET"])
@admin_required
def admin_get_customer(user_id: int):
    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "not found"}), 404

    orders_stmt = (
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .limit(ORDER_HISTORY_LIMIT)
    )
    orders = db.session.scalars(orders_stmt).all()

    payload = {
        "customer": _user_to_dict(u),
        "orders": [_order_summary(o) for o in orders],
    }
    return jsonify(payload), 200
