"""SMS delivery — Twilio when configured, console fallback otherwise."""

from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class SmsService(ABC):
    @abstractmethod
    def send(self, to_e164: str, body: str) -> str:
        """Send SMS. Returns delivery mode: 'twilio' or 'console'."""


class ConsoleSmsService(SmsService):
    def send(self, to_e164: str, body: str) -> str:
        logger.warning("[SMS:console] to=%s body=%s", to_e164, body)
        print(f"[OTP SMS console] to={to_e164} {body}", flush=True)
        return "console"


class TwilioSmsService(SmsService):
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        from twilio.rest import Client

        self._client = Client(account_sid, auth_token)
        self._from = from_number

    def send(self, to_e164: str, body: str) -> str:
        self._client.messages.create(to=to_e164, from_=self._from, body=body)
        return "twilio"


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
