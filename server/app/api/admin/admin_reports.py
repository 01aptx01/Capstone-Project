"""Admin time-series reports."""

from datetime import date, timedelta
from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.extensions import db
from app.models import Order


def _to_float(v) -> float:
    if v is None:
        return 0.0
    if isinstance(v, Decimal):
        return float(v)
    return float(v)


@admin_bp.route("/reports/sales", methods=["GET"])
@admin_required
def admin_sales_report():
    try:
        days = min(int(request.args.get("days", 30)), 365)
    except ValueError:
        days = 30

    since = date.today() - timedelta(days=days - 1)
    rows = db.session.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total_price), 0).label("revenue"),
            func.count(Order.order_id).label("count"),
        )
        .where(Order.status == "completed")
        .where(func.date(Order.created_at) >= since)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    ).all()

    return (
        jsonify(
            {
                "days": days,
                "series": [
                    {
                        "date": str(r.day),
                        "revenue": _to_float(r.revenue),
                        "count": int(r.count or 0),
                    }
                    for r in rows
                ],
            }
        ),
        200,
    )
