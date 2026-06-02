"""Public coupon lookup and discount math for vending checkout."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from sqlalchemy import func, select

from app.extensions import db
from app.models import Coupon, Order

CouponReason = Literal["ok", "not_found", "inactive", "expired", "exhausted", "in_use"]

_STATUSES_EXCLUDE_FROM_USE_COUNT = (
    "pending_payment",
    "payment_failed",
    "cancelled",
)


def count_promotion_redemptions(promotion_id: int) -> int:
    """Orders that consumed this promotion (paid path, not abandoned checkout)."""
    n = db.session.scalar(
        select(func.count(Order.order_id)).where(
            Order.promotion_id == promotion_id,
            Order.status.notin_(_STATUSES_EXCLUDE_FROM_USE_COUNT),
        )
    )
    return int(n or 0)


def _is_expired(expire_date) -> bool:
    if expire_date is None:
        return False
    now = datetime.now(timezone.utc)
    exp = expire_date
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    return exp < now


def lookup_coupon_by_code(raw_code: str) -> tuple[CouponReason, Coupon | None, int | None]:
    """Return (status, coupon, user_promotion_id). Only status ok means coupon may be applied."""
    if raw_code is None or not str(raw_code).strip():
        return "not_found", None, None
    code_norm = str(raw_code).strip().upper()
    
    from app.db_config.db import get_db_cursor
    try:
        with get_db_cursor() as (_, cur):
            cur.execute(
                """
                SELECT id, promotion_id, status 
                FROM user_promotions 
                WHERE UPPER(code) = %s
                """,
                (code_norm,),
            )
            up_row = cur.fetchone()

            if up_row:
                # Prevent Double-Spend: Check if coupon is locked by a pending order
                cur.execute(
                    """
                    SELECT 1 FROM orders 
                    WHERE user_promotion_id = %s AND status = 'pending_payment'
                    """,
                    (up_row["id"],)
                )
                if cur.fetchone():
                    return "in_use", None, None
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"[CouponService] Error looking up user coupon: {e}")
        return "not_found", None, None

    if not up_row:
        return "not_found", None, None

    if up_row["status"] != "active":
        if up_row["status"] == "used":
            return "exhausted", None, None
        return "expired", None, None

    c = db.session.get(Coupon, up_row["promotion_id"])
    if not c:
        return "not_found", None, None
    if not c.is_active:
        return "inactive", c, None
    if _is_expired(c.expire_date):
        return "expired", c, None
    
    return "ok", c, up_row["id"]


def discount_and_final(subtotal: float, coupon: Coupon) -> tuple[float, float]:
    """Return (discount_baht, final_total_baht)."""
    st = float(subtotal)
    if st <= 0:
        return 0.0, 0.0
    dtype = (coupon.type or "").lower()
    amt = float(coupon.discount_amount)
    if dtype == "percent":
        d = st * (amt / 100.0)
    else:
        d = amt
    d = min(d, st)
    d = round(d, 2)
    final = max(0.0, round(st - d, 2))
    return d, final


def reason_message_th(reason: CouponReason) -> str:
    if reason == "not_found":
        return "ไม่พบรหัสคูปองนี้ในระบบ"
    if reason == "inactive":
        return "คูปองนี้ถูกปิดการใช้งาน"
    if reason == "expired":
        return "คูปองหมดอายุแล้ว"
    if reason == "exhausted":
        return "คูปองนี้ถูกใช้ครบจำนวนแล้ว"
    if reason == "in_use":
        return "คูปองนี้กำลังถูกใช้งานในรายการสั่งซื้ออื่น กรุณารอสักครู่หรือยกเลิกรายการเดิม"
    return ""
