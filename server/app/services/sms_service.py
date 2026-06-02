"""SMS delivery — console (dev) only; OTP is printed in server logs."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class SmsService(ABC):
    @abstractmethod
    def send(self, to_e164: str, body: str) -> str:
        """Send SMS. Returns delivery mode identifier."""


class ConsoleSmsService(SmsService):
    def send(self, to_e164: str, body: str) -> str:
        logger.warning("[SMS:console] to=%s body=%s", to_e164, body)
        print(f"[OTP SMS console] to={to_e164} {body}", flush=True)
        return "console"


def phone_to_e164(phone_th: str) -> str:
    """Convert Thai 10-digit mobile (0XXXXXXXXX) to E.164 (+66XXXXXXXXX)."""
    digits = "".join(c for c in phone_th if c.isdigit())
    if len(digits) == 10 and digits.startswith("0"):
        return "+66" + digits[1:]
    if digits.startswith("66") and len(digits) == 11:
        return "+" + digits
    if digits.startswith("+") or phone_th.startswith("+"):
        return phone_th if phone_th.startswith("+") else "+" + digits
    raise ValueError("Invalid Thai phone number")


def get_sms_service() -> SmsService:
    return ConsoleSmsService()
