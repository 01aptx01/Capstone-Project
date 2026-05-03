"""Admin CRUD for products."""

import logging
from decimal import Decimal

from flask import jsonify, request
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required
from app.api.admin.pagination import get_pagination_params, list_envelope
from app.extensions import db
from app.models import Product

logger = logging.getLogger(__name__)


def _dec(value):
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else value


def _product_to_dict(p: Product) -> dict:
    return {
        "product_id": p.product_id,
        "name": p.name,
        "description": p.description,
        "price": _dec(p.price),
        "image_url": p.image_url,
        "heating_time": p.heating_time,
        "category": p.category,
    }


@admin_bp.route("/products", methods=["GET"])
@admin_required
def admin_list_products():
    page, per_page = get_pagination_params()
    q = (request.args.get("q") or "").strip()

    filters = []
    if q:
        pattern = f"%{q.lower()}%"
        filters.append(
            or_(
                func.lower(Product.name).like(pattern),
                func.lower(Product.description).like(pattern),
            )
        )

    count_stmt = select(func.count(Product.product_id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.session.scalar(count_stmt) or 0

    list_stmt = select(Product)
    if filters:
        list_stmt = list_stmt.where(*filters)
    list_stmt = (
        list_stmt.order_by(Product.product_id)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = db.session.scalars(list_stmt).all()
    items = [_product_to_dict(p) for p in rows]

    return jsonify(list_envelope(items, total, page, per_page)), 200


@admin_bp.route("/products", methods=["POST"])
@admin_required
def admin_create_product():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    price = data.get("price")
    if not name or price is None:
        return jsonify({"error": "name and price are required"}), 400

    try:
        price_dec = Decimal(str(price))
    except Exception:
        return jsonify({"error": "invalid price"}), 400

    p = Product(
        name=str(name).strip(),
        price=price_dec,
        description=data.get("description"),
        image_url=data.get("image_url"),
        heating_time=data.get("heating_time"),
        category=(data.get("category") or "meat"),
    )
    try:
        db.session.add(p)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_create_product failed: %s", e)
        return jsonify({"error": "failed to create product"}), 500

    return jsonify(_product_to_dict(p)), 201


@admin_bp.route("/products/<int:product_id>", methods=["PUT"])
@admin_required
def admin_update_product(product_id: int):
    p = db.session.get(Product, product_id)
    if not p:
        return jsonify({"error": "not found"}), 404

    data = request.get_json(silent=True) or {}
    try:
        if "name" in data and data["name"] is not None:
            p.name = str(data["name"]).strip()
        if "price" in data and data["price"] is not None:
            p.price = Decimal(str(data["price"]))
        if "description" in data:
            p.description = data["description"]
        if "image_url" in data:
            p.image_url = data["image_url"]
        if "heating_time" in data:
            p.heating_time = data["heating_time"]
        if "category" in data and data["category"] is not None:
            p.category = str(data["category"])
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_update_product failed: %s", e)
        return jsonify({"error": "failed to update product"}), 500

    return jsonify(_product_to_dict(p)), 200


@admin_bp.route("/products/<int:product_id>", methods=["DELETE"])
@admin_required
def admin_delete_product(product_id: int):
    p = db.session.get(Product, product_id)
    if not p:
        return jsonify({"error": "not found"}), 404

    try:
        db.session.delete(p)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return (
            jsonify(
                {
                    "error": "cannot delete product: still referenced by slots or order history",
                }
            ),
            409,
        )
    except Exception as e:
        db.session.rollback()
        logger.exception("admin_delete_product failed: %s", e)
        return jsonify({"error": "failed to delete product"}), 500

    return jsonify({"status": "deleted", "product_id": product_id}), 200
