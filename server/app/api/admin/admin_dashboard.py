"""Admin dashboard aggregates."""

from datetime import date
from decimal import Decimal

from flask import jsonify
from sqlalchemy import func, select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.extensions import db
from app.models import Machine, Order, OrderItem, Product


def _to_float(v) -> float:
    if v is None:
        return 0.0
    if isinstance(v, Decimal):
        return float(v)
    return float(v)


@admin_bp.route("/dashboard/summary", methods=["GET"])
@admin_required
def admin_dashboard_summary():
    today = date.today()

    total_sales_today = db.session.scalar(
        select(func.coalesce(func.sum(Order.total_price), 0))
        .where(Order.status == "completed")
        .where(func.date(Order.created_at) == today)
    )
    active_machines = db.session.scalar(
        select(func.count(Machine.machine_code)).where(Machine.status == "online")
    )
    top_products = db.session.execute(
        select(
            Product.product_id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold"),
        )
        .join(OrderItem, OrderItem.product_id == Product.product_id)
        .join(Order, Order.order_id == OrderItem.order_id)
        .where(Order.status == "completed")
        .group_by(Product.product_id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    ).all()

    return (
        jsonify(
            {
                "total_sales_today": _to_float(total_sales_today),
                "active_machines": int(active_machines or 0),
                "top_products": [
                    {
                        "product_id": int(r.product_id),
                        "name": r.name,
                        "total_sold": int(r.total_sold or 0),
                    }
                    for r in top_products
                ],
            }
        ),
        200,
    )
