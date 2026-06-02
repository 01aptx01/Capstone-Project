"""Admin CRUD for promotions (Coupon model)."""

import logging
from datetime import datetime
from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from app.api.admin import admin_bp
from app.api.admin.decorators import roles_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Coupon, Order

from app.services.coupon_service import count_promotion_redemptions

logger = logging.getLogger(__name__)

ALLOWED_TYPES = frozenset({"fixed_amount", "percent"})


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _coupon_to_dict(c: Coupon) -> dict:
    pc = getattr(c, "points_cost", None)
    if pc is None:
        pc = 0
    mu = int(getattr(c, "max_uses", 0) or 0)
    used = count_promotion_redemptions(c.promotion_id)
    return {
        "promotion_id": c.promotion_id,
        "code": c.code,
        "type": c.type,
        "discount_amount": _dec(c.discount_amount),
        "is_active": c.is_active,
        "expire_date": c.expire_date.isoformat() if c.expire_date else None,
        "points_cost": int(pc),
        "max_uses": mu,
        "used_count": used,
    }


def _parse_expire_date(raw):
    if raw is None:
        return None
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return None
        try:
            return datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("invalid expire_date")
    raise ValueError("expire_date must be a string or null")


def _parse_points_cost(raw):
    """Non-negative int; missing -> 0."""
    if raw is None:
        return 0
    try:
        n = int(raw)
    except (TypeError, ValueError):
        raise ValueError("invalid points_cost")
    if n < 0:
        raise ValueError("points_cost must be >= 0")
    return n


def _parse_max_uses(raw):
    """0 = unlimited. Non-negative int."""
    if raw is None:
        return 0
    try:
        n = int(raw)
    except (TypeError, ValueError):
        raise ValueError("invalid max_uses")
    if n < 0:
        raise ValueError("max_uses must be >= 0")
    return n


@admin_bp.route("/coupons/<int:promotion_id>/redemptions", methods=["GET"])
@roles_required("admin")
def admin_coupon_redemptions(promotion_id: int):
    """Orders that used this coupon; member phone or 'unknown'."""
    c = db.session.get(Coupon, promotion_id)
    if not c:
        return jsonify({"error": "not found"}), 404

    orders = (
        db.session.scalars(
            select(Order)
            .options(joinedload(Order.member))
            .where(Order.promotion_id == promotion_id)
            .where(Order.status.notin_(("pending_payment", "payment_failed", "cancelled")))
            .order_by(Order.created_at.desc())
            .limit(500)
        )
        .unique()
        .all()
    )

    items = []
    for order in orders:
        phone = order.member.phone_number if order.member else None
        items.append(
            {
                "order_id": order.order_id,
                "charge_id": order.charge_id,
                "status": order.status,
                "total_price": _dec(order.total_price),
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "user_label": phone if phone else "unknown",
            }
        )

    return jsonify({"items": items, "promotion_id": promotion_id, "code": c.code}), 200


@admin_bp.route("/coupons", methods=["GET"])
@roles_required("admin")
def admin_list_coupons():
    page, per_page = get_pagination_params()

    count_stmt = select(func.count(Coupon.promotion_id))
    total = db.session.scalar(count_stmt) or 0

    list_stmt = (
        select(Coupon)
        .order_by(Coupon.promotion_id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = db.session.scalars(list_stmt).all()
    items = [_coupon_to_dict(c) for c in rows]

    return jsonify(list_envelope(items, total, page, per_page)), 200


@admin_bp.route("/coupons", methods=["POST"])
@roles_required("admin")
def admin_create_coupon():
    data = request.get_json(silent=True) or {}
    code = data.get("code")
    ctype = data.get("type")
    discount_amount = data.get("discount_amount")

    if not code or not ctype or discount_amount is None:
        return jsonify({"error": "code, type, and discount_amount are required"}), 400
    if ctype not in ALLOWED_TYPES:
        return jsonify({"error": "type must be fixed_amount or percent"}), 400

    try:
        amount_dec = Decimal(str(discount_amount))
    except Exception:
        return jsonify({"error": "invalid discount_amount"}), 400

    try:
        expire_date = _parse_expire_date(data.get("expire_date"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    is_active = data.get("is_active")
    if is_active is None:
        is_active = True

    try:
        points_cost = _parse_points_cost(data.get("points_cost", 0))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    try:
        max_uses = _parse_max_uses(data.get("max_uses", 0))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    c = Coupon(
        code=str(code).strip(),
        type=ctype,
        discount_amount=amount_dec,
        is_active=bool(is_active),
        expire_date=expire_date,
        points_cost=points_cost,
        max_uses=max_uses,
    )
    try:
        db.session.add(c)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "coupon code already exists"}), 409
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_create_coupon failed: %s", e)
        return jsonify({"error": "failed to create coupon"}), 500

    return jsonify(_coupon_to_dict(c)), 201


@admin_bp.route("/coupons/<int:promotion_id>", methods=["DELETE"])
@roles_required("admin")
def admin_delete_coupon(promotion_id: int):
    c = db.session.get(Coupon, promotion_id)
    if not c:
        return jsonify({"error": "not found"}), 404
    try:
        db.session.delete(c)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "ไม่สามารถลบคูปองที่มีออเดอร์ใช้งานแล้ว"}), 409
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_delete_coupon failed: %s", e)
        return jsonify({"error": "ลบคูปองไม่สำเร็จ"}), 500
    return jsonify({"ok": True, "promotion_id": promotion_id}), 200


@admin_bp.route("/coupons/<int:promotion_id>", methods=["PUT"])
@roles_required("admin")
def admin_update_coupon(promotion_id: int):
    c = db.session.get(Coupon, promotion_id)
    if not c:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(silent=True) or {}
    if "type" in data and data["type"] is not None and data["type"] not in ALLOWED_TYPES:
        return jsonify({"error": "type must be fixed_amount or percent"}), 400

    if "expire_date" in data:
        try:
            new_expire = _parse_expire_date(data.get("expire_date"))
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    else:
        new_expire = None

    try:
        if "points_cost" in data:
            try:
                c.points_cost = _parse_points_cost(data.get("points_cost"))
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
        if "is_active" in data:
            c.is_active = bool(data["is_active"])
        if "expire_date" in data:
            c.expire_date = new_expire
        if "discount_amount" in data and data["discount_amount"] is not None:
            c.discount_amount = Decimal(str(data["discount_amount"]))
        if "type" in data and data["type"] is not None:
            c.type = data["type"]
        if "code" in data and data["code"] is not None:
            c.code = str(data["code"]).strip()
        if "max_uses" in data:
            try:
                new_max = _parse_max_uses(data.get("max_uses"))
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
            used = count_promotion_redemptions(promotion_id)
            if new_max > 0 and new_max < used:
                return jsonify(
                    {
                        "error": f"max_uses ({new_max}) cannot be less than current usage ({used})",
                    }
                ), 400
            c.max_uses = new_max
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "coupon code conflict"}), 409
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_update_coupon failed: %s", e)
        return jsonify({"error": "failed to update coupon"}), 500

    return jsonify(_coupon_to_dict(c)), 200
