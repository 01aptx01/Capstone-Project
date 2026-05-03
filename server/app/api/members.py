"""
members.py — Member (User) API
- GET  /api/members/<phone>   : ค้นหาสมาชิกจากเบอร์โทร
- POST /api/members/earn      : สะสมแต้ม (auto-register ถ้าเบอร์ใหม่)
"""

import logging
from flask import Blueprint, jsonify, request
from app.config.db import get_db

logger = logging.getLogger(__name__)
members_api = Blueprint("members_api", __name__)


def _get_member(phone: str) -> dict | None:
    """ดึงข้อมูล member จาก DB — คืน dict หรือ None ถ้าไม่พบ"""
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT user_id, phone_number, points, registered_at, last_use, status "
            "FROM users WHERE phone_number = %s",
            (phone,),
        )
        return cur.fetchone()
    finally:
        cur.close()
        db.close()


@members_api.route("/api/members/<phone>", methods=["GET"])
def get_member(phone: str):
    """ค้นหาสมาชิกจากเบอร์โทร"""
    try:
        member = _get_member(phone)
        if not member:
            return jsonify({"found": False, "message": "ไม่พบสมาชิก"}), 404
        return jsonify({
            "found": True,
            "user_id": member["user_id"],
            "phone_number": member["phone_number"],
            "points": member["points"],
            "registered_at": str(member["registered_at"]),
            "last_use": str(member["last_use"]) if member["last_use"] else None,
        }), 200
    except Exception as e:
        logger.error(f"[Members] Error fetching member {phone}: {e}")
        return jsonify({"found": False, "message": "เกิดข้อผิดพลาดในระบบ"}), 500


@members_api.route("/api/members/earn", methods=["POST"])
def earn_points():
    """
    สะสมแต้มหลังจ่ายเงิน:
    - ถ้าเบอร์ใหม่ → สร้าง user ใหม่
    - ถ้าเบอร์เก่า → บวกแต้มเข้าไป
    แต้มคำนวณจาก total_price (1 บาท = 1 แต้ม, ปัดลง)
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

    phone = (data.get("phone_number") or "").strip()
    total_price = data.get("total_price", 0)
    charge_id = data.get("charge_id")  # optional: ใช้ผูก order กับ user

    if not phone or len(phone) != 10 or not phone.isdigit():
        return jsonify({"status": "ERROR", "message": "เบอร์โทรไม่ถูกต้อง"}), 400

    try:
        points_earned = max(1, int(float(total_price)))  # 1 บาท = 1 แต้ม
    except (TypeError, ValueError):
        points_earned = 0

    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        try:
            # ดึง user หรือสร้างใหม่
            cur.execute(
                "SELECT user_id, points FROM users WHERE phone_number = %s",
                (phone,),
            )
            member = cur.fetchone()

            if member:
                # เบอร์เก่า → บวกแต้ม
                new_points = member["points"] + points_earned
                user_id = member["user_id"]
                cur.execute(
                    "UPDATE users SET points = %s, last_use = NOW() WHERE user_id = %s",
                    (new_points, user_id),
                )
                is_new = False
            else:
                # เบอร์ใหม่ → สร้าง user
                cur.execute(
                    "INSERT INTO users (phone_number, points, last_use) VALUES (%s, %s, NOW())",
                    (phone, points_earned),
                )
                user_id = cur.lastrowid
                new_points = points_earned
                is_new = True

            # ผูก order กับ user ถ้ามี charge_id
            if charge_id:
                cur.execute(
                    "UPDATE orders SET user_id = %s WHERE charge_id = %s AND user_id IS NULL",
                    (user_id, charge_id),
                )

            db.commit()
            logger.info(f"[Members] {'Created' if is_new else 'Updated'} user {phone} → {new_points} pts (+{points_earned})")

            return jsonify({
                "status": "ok",
                "is_new_member": is_new,
                "phone_number": phone,
                "points_earned": points_earned,
                "total_points": new_points,
            }), 200

        finally:
            cur.close()
            db.close()

    except Exception as e:
        logger.error(f"[Members] Error earning points for {phone}: {e}")
        return jsonify({"status": "ERROR", "message": "เกิดข้อผิดพลาดในระบบ"}), 500
