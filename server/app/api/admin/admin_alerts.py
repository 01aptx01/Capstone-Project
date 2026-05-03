"""Admin alerts: low stock and recent machine ERROR events."""

from flask import jsonify, request
from sqlalchemy import select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.extensions import db
from app.models import MachineEvent, MachineSlot, Product

LOW_STOCK_THRESHOLD = 5


@admin_bp.route("/alerts", methods=["GET"])
@admin_required
def admin_alerts():
    threshold = request.args.get("stock_threshold", LOW_STOCK_THRESHOLD, type=int)
    if threshold is None or threshold < 0:
        threshold = LOW_STOCK_THRESHOLD

    low_stock = db.session.execute(
        select(
            MachineSlot.machine_code,
            MachineSlot.slot_number,
            MachineSlot.product_id,
            MachineSlot.quantity,
            Product.name,
        )
        .join(Product, Product.product_id == MachineSlot.product_id)
        .where(MachineSlot.quantity < threshold)
        .order_by(MachineSlot.quantity)
    ).all()

    error_events = db.session.scalars(
        select(MachineEvent)
        .where(MachineEvent.state == "ERROR")
        .order_by(MachineEvent.created_at.desc())
        .limit(50)
    ).all()

    return (
        jsonify(
            {
                "stock_threshold": threshold,
                "low_stock": [
                    {
                        "machine_code": r.machine_code,
                        "slot": r.slot_number,
                        "product_id": int(r.product_id),
                        "product_name": r.name,
                        "quantity": int(r.quantity),
                    }
                    for r in low_stock
                ],
                "machine_errors": [
                    {
                        "id": int(e.id),
                        "machine_code": e.machine_code,
                        "job_id": e.job_id,
                        "event_type": e.event_type,
                        "state": e.state,
                        "created_at": e.created_at.isoformat() if e.created_at else None,
                    }
                    for e in error_events
                ],
            }
        ),
        200,
    )
