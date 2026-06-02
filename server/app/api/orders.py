"""
orders.py — Customer order history, coupons, and redeem (web-ui).
"""

import logging
from datetime import datetime

from flask import Blueprint, g, jsonify, request

from app.auth.member_auth import member_required, require_path_phone
from app.db_config.db import get_db_cursor
from app.services.promotion_catalog import compute_catalog_status

logger = logging.getLogger(__name__)
orders_api = Blueprint("orders_api", __name__)


def _validate_phone(phone: str) -> bool:
    return bool(phone and len(phone) == 10 and phone.isdigit())


@orders_api.route("/api/members/<phone>/orders", methods=["GET"])
@member_required
def member_orders(phone: str):
    err = require_path_phone(phone)
    if err:
        return err

    if not _validate_phone(phone):
        return jsonify({"error": "invalid_phone", "message": "เบอร์โทรไม่ถูกต้อง", "orders": []}), 400

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
                SELECT o.order_id, o.machine_code, o.charge_id, o.total_price, o.status, o.created_at
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
                        "machine_code": row["machine_code"],
                        "orderNumber": charge[-8:] if len(charge) >= 8 else charge,
                        "charge_id": charge,
                        "datetime": str(row["created_at"]),
                        "items": items_text or "-",
                        "total": float(row["total_price"]),
                        "status": row["status"],
                    }
                )

        return jsonify({"orders": orders}), 200
    except Exception as e:
        logger.error(f"[Orders] member_orders error for {phone}: {e}")
        return jsonify({"error": "server_error", "message": "เกิดข้อผิดพลาด", "orders": []}), 500


@orders_api.route("/api/promotions/redeemable", methods=["GET"])
def redeemable_promotions():
    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                """
                SELECT
                    p.promotion_id, p.code, p.type, p.discount_amount, p.points_cost, p.expire_date, p.max_uses,
                    (SELECT COUNT(*) FROM user_promotions WHERE promotion_id = p.promotion_id) AS total_redeemed
                FROM promotions p
                WHERE p.is_active = 1
                  AND p.points_cost > -1
                  AND (p.expire_date IS NULL OR p.expire_date >= UTC_TIMESTAMP())
                  AND (
                    p.max_uses = 0
                    OR (SELECT COUNT(*) FROM user_promotions up WHERE up.promotion_id = p.promotion_id)
                       < p.max_uses
                  )
                ORDER BY p.points_cost ASC
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

            max_uses = row.get("max_uses") or 0
            total_redeemed = row.get("total_redeemed") or 0
            if max_uses > 0:
                quantity_remaining = max(0, max_uses - total_redeemed)
            else:
                quantity_remaining = None  # ไม่จำกัด

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
                    "quantity_remaining": quantity_remaining,
                }
            )
        return jsonify({"coupons": coupons}), 200
    except Exception as e:
        logger.error(f"[Orders] redeemable_promotions error: {e}")
        return jsonify({"coupons": []}), 500


@orders_api.route("/api/members/<phone>/redeem", methods=["POST"])
@member_required
def redeem_coupon(phone: str):
    err = require_path_phone(phone)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    promotion_id = data.get("promotion_id")
    if not promotion_id:
        return jsonify({"error": "invalid", "message": "ต้องระบุ promotion_id"}), 400

    try:
        promotion_id = int(promotion_id)
    except (TypeError, ValueError):
        return jsonify({"error": "invalid", "message": "promotion_id ไม่ถูกต้อง"}), 400

    try:
        with get_db_cursor() as (db, cur):
            cur.execute(
                "SELECT user_id, points FROM users WHERE phone_number = %s FOR UPDATE",
                (phone,),
            )
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "not_found", "message": "ไม่พบสมาชิก"}), 404

            cur.execute(
                """
                SELECT promotion_id, code, points_cost, is_active, expire_date, max_uses
                FROM promotions WHERE promotion_id = %s
                FOR UPDATE
                """,
                (promotion_id,),
            )
            promo = cur.fetchone()
            if not promo or not promo["is_active"]:
                return jsonify({"error": "not_found", "message": "ไม่พบคูปอง"}), 404

            if compute_catalog_status(
                bool(promo["is_active"]), promo["expire_date"]
            ) == "expired":
                return jsonify({"error": "expired", "message": "คูปองหมดอายุ"}), 400

            points_cost = int(promo["points_cost"] or 0)
            if points_cost <= -1:
                return jsonify({"error": "invalid", "message": "คูปองนี้แลกด้วยแต้มไม่ได้"}), 400

            if user["points"] < points_cost:
                return jsonify(
                    {"error": "insufficient_points", "message": "แต้มไม่พอ"}
                ), 400

            if promo["max_uses"] and promo["max_uses"] > 0:
                cur.execute(
                    "SELECT COUNT(*) AS cnt FROM user_promotions WHERE promotion_id = %s",
                    (promotion_id,),
                )
                total_redeemed = cur.fetchone()["cnt"]
                if total_redeemed >= promo["max_uses"]:
                    return jsonify(
                        {"error": "sold_out", "message": "คูปองถูกแลกครบแล้ว"}
                    ), 409

            cur.execute(
                """
                SELECT id FROM user_promotions
                WHERE user_id = %s AND promotion_id = %s AND status = 'active'
                """,
                (user["user_id"], promotion_id),
            )
            if cur.fetchone():
                return jsonify(
                    {"error": "already_owned", "message": "คุณมีคูปองนี้แล้ว"}
                ), 409

            new_points = user["points"] - points_cost
            cur.execute(
                "UPDATE users SET points = %s, last_use = NOW() WHERE user_id = %s",
                (new_points, user["user_id"]),
            )
            cur.execute(
                """
                INSERT INTO user_promotions (user_id, promotion_id, status)
                VALUES (%s, %s, 'active')
                """,
                (user["user_id"], promotion_id),
            )
            db.commit()

        return jsonify(
            {
                "status": "ok",
                "message": "แลกคูปองสำเร็จ",
                "code": promo["code"],
                "points_remaining": new_points,
            }
        ), 200
    except Exception as e:
        logger.error(f"[Orders] redeem error for {phone}: {e}")
        return jsonify({"error": "server_error", "message": "แลกคูปองไม่สำเร็จ"}), 500


@orders_api.route("/api/members/<phone>/coupons", methods=["GET"])
@member_required
def member_coupons(phone: str):
    """ดึงรายการคูปองที่ user แลกไว้แล้ว (rate limited: ผ่าน @member_required)"""
    err = require_path_phone(phone)
    if err:
        return err

    if not _validate_phone(phone):
        return jsonify({"error": "invalid_phone", "message": "เบอร์โทรไม่ถูกต้อง", "coupons": []}), 400

    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                "SELECT user_id FROM users WHERE phone_number = %s",
                (phone,),
            )
            user = cur.fetchone()
            if not user:
                return jsonify({"coupons": []}), 200

            cur.execute(
                """
                SELECT
                    up.id,
                    up.promotion_id,
                    up.status,
                    up.redeemed_at,
                    up.code AS user_coupon_code,
                    p.code,
                    p.type,
                    p.discount_amount,
                    p.points_cost,
                    p.expire_date,
                    p.is_active,
                    p.max_uses,
                    (SELECT COUNT(*) FROM user_promotions WHERE promotion_id = up.promotion_id) AS total_redeemed
                FROM user_promotions up
                JOIN promotions p ON p.promotion_id = up.promotion_id
                WHERE up.user_id = %s
                ORDER BY up.redeemed_at DESC
                """,
                (user["user_id"],),
            )
            rows = cur.fetchall()

        coupons = []
        for row in rows:
            disc = float(row["discount_amount"])
            # ใช้ p.code (ชื่อคูปอง) เป็น title โดยมี fallback เผื่อไม่มีชื่อ
            title = row["code"] or (f"ส่วนลด {disc:g}%" if (row["type"] or "").lower() == "percent" else f"ส่วนลด {disc:g} บาท")

            # คำนวณจำนวนคงเหลือ: max_uses - จำนวนที่แลกไปแล้วทั้งหมด
            max_uses = row.get("max_uses")
            total_redeemed = row.get("total_redeemed", 0)
            if max_uses and int(max_uses) > 0:
                quantity = max(0, int(max_uses) - int(total_redeemed))
            else:
                quantity = None  # ไม่จำกัด → แสดงเป็น '-' ใน UI

            coupons.append({
                "id": str(row["id"]),
                "promotion_id": row["promotion_id"],
                "code": row["user_coupon_code"],  # คืนค่ารหัสเฉพาะตัวของผู้ใช้
                "title": title,
                "description": f"ส่วนลด {disc:g} {'%' if (row['type'] or '').lower() == 'percent' else 'บาท'}",
                "discount_amount": disc,
                "type": row["type"],
                "status": row["status"],
                "expiry": str(row["expire_date"]) if row["expire_date"] else None,
                "redeemed_at": str(row["redeemed_at"]),
                "quantity": quantity,
            })

        return jsonify({"coupons": coupons}), 200

    except Exception as e:
        logger.error(f"[Orders] member_coupons error for {phone}: {e}")
        return jsonify({"error": "server_error", "message": "เกิดข้อผิดพลาด", "coupons": []}), 500


@orders_api.route("/api/members/<phone>/coupons/<int:user_promo_id>/reveal", methods=["POST"])
@member_required
def reveal_coupon_code(phone: str, user_promo_id: int):
    """เจเนอเรตรหัสคูปองสุ่มตัวเลขแบบไม่ซ้ำขึ้นมาใหม่สำหรับคูปองรายบุคคลของผู้ใช้รายนี้"""
    err = require_path_phone(phone)
    if err:
        return err

    if not _validate_phone(phone):
        return jsonify({"error": "invalid_phone", "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        with get_db_cursor() as (db, cur):
            cur.execute(
                "SELECT user_id FROM users WHERE phone_number = %s",
                (phone,),
            )
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "not_found", "message": "ไม่พบสมาชิก"}), 404

            cur.execute(
                """
                SELECT id, code, status FROM user_promotions 
                WHERE id = %s AND user_id = %s
                """,
                (user_promo_id, user["user_id"]),
            )
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "not_found", "message": "ไม่พบข้อมูลคูปอง"}), 404

            if row["status"] != "active":
                return jsonify({"error": "invalid_status", "message": "คูปองไม่อยู่ในสถานะพร้อมใช้งาน"}), 400

            code = row["code"]
            if not code:
                import random
                import string

                while True:
                    rand_str = ''.join(random.choices(string.digits, k=8))
                    generated = rand_str
                    cur.execute("SELECT 1 FROM user_promotions WHERE code = %s", (generated,))
                    if not cur.fetchone():
                        code = generated
                        break

                cur.execute(
                    "UPDATE user_promotions SET code = %s WHERE id = %s",
                    (code, user_promo_id),
                )
                db.commit()

        return jsonify({"status": "ok", "code": code}), 200

    except Exception as e:
        logger.error(f"[Orders] reveal_coupon_code error for {phone}/{user_promo_id}: {e}")
        return jsonify({"error": "server_error", "message": "ไม่สามารถดึงรหัสคูปองได้"}), 500
