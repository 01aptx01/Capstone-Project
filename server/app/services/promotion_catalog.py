"""Catalog promotion (promotions table) status and expiry helpers."""

from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo

BANGKOK = ZoneInfo("Asia/Bangkok")


def now_bangkok() -> datetime:
    return datetime.now(BANGKOK)


def parse_expire_date_input(raw) -> datetime | None:
    """
    Parse admin/API expire_date: null, ISO datetime, or YYYY-MM-DD (end of day Bangkok).
    Returns naive UTC datetime for MySQL storage (comparable with UTC_TIMESTAMP()).
    """
    if raw is None:
        return None
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return None
        if "T" in s:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=BANGKOK)
            return dt.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        # date-only from <input type="date">
        try:
            d = date.fromisoformat(s[:10])
        except ValueError as exc:
            raise ValueError("invalid expire_date") from exc
        end_bkk = datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=BANGKOK)
        return end_bkk.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
    raise ValueError("expire_date must be a string or null")


def compute_catalog_status(
    is_active: bool,
    expire_date: datetime | None,
    *,
    now: datetime | None = None,
) -> str:
    """
    Derive catalog status (not stored in DB).
    - expired: expire_date set and past (Bangkok calendar comparison for date-only edge cases)
    - active: is_active and not expired
    - inactive: disabled manually, no expiry date passed yet
    """
    ref = now or now_bangkok()
    if expire_date is not None:
        exp = expire_date
        if exp.tzinfo is None:
            exp_utc = exp.replace(tzinfo=ZoneInfo("UTC"))
        else:
            exp_utc = exp.astimezone(ZoneInfo("UTC"))
        if exp_utc < ref.astimezone(ZoneInfo("UTC")):
            return "expired"
    if is_active:
        return "active"
    return "inactive"


def is_redeemable_catalog_row(
    is_active: bool,
    expire_date: datetime | None,
    points_cost: int,
    max_uses: int,
    total_redeemed: int,
) -> bool:
    if not is_active or points_cost <= -1:
        return False
    if compute_catalog_status(is_active, expire_date) == "expired":
        return False
    if max_uses > 0 and total_redeemed >= max_uses:
        return False
    return True
