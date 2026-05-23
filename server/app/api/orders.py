"""
orders.py — Customer order history and pickup (web-ui pre-order flow).
"""

import logging
from flask import Blueprint, jsonify, request
from app.db_config.db import get_db_cursor

logger = logging.getLogger(__name__)
orders_api = Blueprint("orders_api", __name__)


def _validate_phone(phone: str) -> bool:
    return bool(phone and len(phone) == 10 and phone.isdigit())


def _map_ui_status(db_status: str) -> str:
    if db_status in ("ready_to_scan", "paid"):
        return "ready_to_scan"
    if db_status == "completed":
        return "completed"
    if db_status in ("dispensing",):
        return "ready_to_scan"
    return "completed"


@orders_api.route("/api/members/<phone>/orders", methods=["GET"])
def member_orders(phone: str):
    if not _validate_phone(phone):
        return jsonify({"orders": [], "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                "SELECT user_id FROM users WHERE phone_number = %s",
                (phone,),
            )
            user = cur.fetchone()
            if not user:
                return jsonify({"orders": []}), 200

            cur.execute(
                """
                SELECT o.order_id, o.charge_id, o.total_price, o.status, o.created_at
                FROM orders o
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC
                LIMIT 50
                """,
                (user["user_id"],),
            )
            rows = cur.fetchall()

            orders = []
            for row in rows:
                cur.execute(
                    """
                    SELECT p.name, oi.quantity
                    FROM order_items oi
                    JOIN products p ON p.product_id = oi.product_id
                    WHERE oi.order_id = %s
                    """,
                    (row["order_id"],),
                )
                items = cur.fetchall()
                items_text = ", ".join(
                    f"{it['name']} x{it['quantity']}" for it in items
                )
                charge = row["charge_id"] or str(row["order_id"])
                orders.append(
                    {
                        "id": str(row["order_id"]),
                        "orderNumber": charge[-8:] if len(charge) >= 8 else charge,
                        "charge_id": charge,
                        "datetime": str(row["created_at"]),
                        "items": items_text or "-",
                        "total": float(row["total_price"]),
                        "status": _map_ui_status(row["status"]),
                    }
                )

        return jsonify({"orders": orders}), 200
    except Exception as e:
        logger.error(f"[Orders] member_orders error for {phone}: {e}")
        return jsonify({"orders": [], "message": "เกิดข้อผิดพลาด"}), 500


@orders_api.route("/api/promotions/redeemable", methods=["GET"])
def redeemable_promotions():
    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                """
                SELECT promotion_id, code, type, discount_amount, points_cost, expire_date
                FROM promotions
                WHERE is_active = 1 AND points_cost > 0
                ORDER BY points_cost ASC
                """
            )
            rows = cur.fetchall()

        coupons = []
        for row in rows:
            disc = float(row["discount_amount"])
            if (row["type"] or "").lower() == "percent":
                title = f"ส่วนลด {disc:g}%"
            else:
                title = f"ส่วนลด {disc:g} บาท"
            coupons.append(
                {
                    "promotion_id": row["promotion_id"],
                    "code": row["code"],
                    "title": title,
                    "description": f"แลกด้วย {row['points_cost']} แต้ม",
                    "points_cost": int(row["points_cost"]),
                    "discount_amount": disc,
                    "type": row["type"],
                    "expiry": str(row["expire_date"]) if row["expire_date"] else None,
                }
            )
        return jsonify({"coupons": coupons}), 200
    except Exception as e:
        logger.error(f"[Orders] redeemable_promotions error: {e}")
        return jsonify({"coupons": []}), 500


@orders_api.route("/api/members/<phone>/redeem", methods=["POST"])
def redeem_coupon(phone: str):
    # TODO: deduct points and assign coupon to member wallet
    _ = request.get_json(silent=True)
    return jsonify(
        {"status": "not_implemented", "message": "Redeem not implemented yet"}
    ), 501


@orders_api.route("/api/orders/<charge_id>/pickup", methods=["POST"])
def pickup_order(charge_id: str):
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone_number") or "").strip()

    if not _validate_phone(phone):
        return jsonify({"status": "ERROR", "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                """
                SELECT o.order_id, o.status, o.user_id, u.phone_number
                FROM orders o
                LEFT JOIN users u ON u.user_id = o.user_id
                WHERE o.charge_id = %s
                """,
                (charge_id,),
            )
            order = cur.fetchone()

        if not order:
            return jsonify({"status": "ERROR", "message": "ไม่พบออเดอร์"}), 404

        if order["status"] != "ready_to_scan":
            return jsonify(
                {
                    "status": "ERROR",
                    "message": f"ออเดอร์ไม่พร้อมรับ (สถานะ: {order['status']})",
                }
            ), 409

        if order["user_id"] and order["phone_number"] != phone:
            return jsonify({"status": "ERROR", "message": "ออเดอร์ไม่ตรงกับบัญชี"}), 403

        from app.api.buy import buy_controller

        details = buy_controller.inventory_service.get_order_details_by_charge_id(
            charge_id
        )
        if not details:
            return jsonify({"status": "ERROR", "message": "ไม่พบรายการสินค้า"}), 404

        buy_controller.pending_orders[charge_id] = {
            "cart": details["cart"],
            "machine_code": details["machine_code"],
            "fulfillment_mode": "pickup",
        }
        buy_controller.order_statuses[charge_id] = "paid"
        success = buy_controller._execute_dispense(charge_id)

        if success:
            return jsonify(
                {"status": "ok", "message": "กำลังจ่ายสินค้า กรุณารอรับที่ช่องรับ"}
            ), 200
        return jsonify(
            {"status": "ERROR", "message": "ไม่สามารถจ่ายสินค้าได้ กรุณาติดต่อเจ้าหน้าที่"}
        ), 500

    except Exception as e:
        logger.error(f"[Orders] pickup_order error for {charge_id}: {e}")
        return jsonify({"status": "ERROR", "message": "เกิดข้อผิดพลาดในระบบ"}), 500
