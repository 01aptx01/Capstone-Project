"""Admin CRUD for promotions (Coupon model)."""

import logging
from datetime import datetime
from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Coupon

logger = logging.getLogger(__name__)

ALLOWED_TYPES = frozenset({"fixed_amount", "percent"})


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _coupon_to_dict(c: Coupon) -> dict:
    return {
        "promotion_id": c.promotion_id,
        "code": c.code,
        "type": c.type,
        "discount_amount": _dec(c.discount_amount),
        "is_active": c.is_active,
        "expire_date": c.expire_date.isoformat() if c.expire_date else None,
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


@admin_bp.route("/coupons", methods=["GET"])
@admin_required
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
@admin_required
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

    c = Coupon(
        code=str(code).strip(),
        type=ctype,
        discount_amount=amount_dec,
        is_active=bool(is_active),
        expire_date=expire_date,
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


@admin_bp.route("/coupons/<int:promotion_id>", methods=["PUT"])
@admin_required
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
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "coupon code conflict"}), 409
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_update_coupon failed: %s", e)
        return jsonify({"error": "failed to update coupon"}), 500

    return jsonify(_coupon_to_dict(c)), 200
