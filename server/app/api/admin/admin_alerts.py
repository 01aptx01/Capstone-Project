"""Admin alerts: low stock and recent machine ERROR events."""

from datetime import datetime, timezone

from flask import jsonify, request
from sqlalchemy import select

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.extensions import db
from app.models import MachineEvent, MachineSlot, Product

LOW_STOCK_THRESHOLD = 5


def _truthy_query(val: str | None) -> bool:
    if not val:
        return False
    return val.strip().lower() in ("1", "true", "yes", "all")


@admin_bp.route("/alerts", methods=["GET"])
@admin_required
def admin_alerts():
    threshold = request.args.get("stock_threshold", LOW_STOCK_THRESHOLD, type=int)
    if threshold is None or threshold < 0:
        threshold = LOW_STOCK_THRESHOLD

    include_resolved = _truthy_query(request.args.get("include_resolved"))

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

    err_stmt = (
        select(MachineEvent)
        .where(MachineEvent.state == "ERROR")
        .order_by(MachineEvent.created_at.desc())
        .limit(50)
    )
    if not include_resolved:
        err_stmt = err_stmt.where(MachineEvent.is_resolved.is_(False))

    error_events = db.session.scalars(err_stmt).all()

    return (
        jsonify(
            {
                "stock_threshold": threshold,
                "include_resolved": include_resolved,
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
                        "is_resolved": bool(e.is_resolved),
                        "resolved_at": e.resolved_at.isoformat() if e.resolved_at else None,
                    }
                    for e in error_events
                ],
            }
        ),
        200,
    )


@admin_bp.route("/alerts/resolve/<int:event_id>", methods=["POST"])
@admin_required
def admin_resolve_alert(event_id: int):
    ev = db.session.get(MachineEvent, event_id)
    if ev is None:
        return jsonify({"error": "event not found"}), 404
    if ev.state != "ERROR":
        return jsonify({"error": "only ERROR events can be resolved"}), 400
    if ev.is_resolved:
        return jsonify({"error": "already resolved"}), 409

    now = datetime.now(timezone.utc)
    ev.is_resolved = True
    ev.resolved_at = now
    db.session.commit()

    return (
        jsonify(
            {
                "ok": True,
                "id": event_id,
                "is_resolved": True,
                "resolved_at": now.isoformat(),
            }
        ),
        200,
    )
