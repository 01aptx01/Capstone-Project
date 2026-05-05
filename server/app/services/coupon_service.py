"""Public coupon lookup and discount math for vending checkout."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from sqlalchemy import func, select

from app.extensions import db
from app.models import Coupon

CouponReason = Literal["ok", "not_found", "inactive", "expired"]


def _is_expired(expire_date) -> bool:
    if expire_date is None:
        return False
    now = datetime.now(timezone.utc)
    exp = expire_date
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    return exp < now


def lookup_coupon_by_code(raw_code: str) -> tuple[CouponReason, Coupon | None]:
    """Return (status, coupon). Only status ok means coupon may be applied."""
    if raw_code is None or not str(raw_code).strip():
        return "not_found", None
    code_norm = str(raw_code).strip().upper()
    c = db.session.scalar(select(Coupon).where(func.upper(Coupon.code) == code_norm))
    if not c:
        return "not_found", None
    if not c.is_active:
        return "inactive", c
    if _is_expired(c.expire_date):
        return "expired", c
    return "ok", c


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
    return ""
