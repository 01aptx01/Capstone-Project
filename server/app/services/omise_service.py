import os
import omise
import logging
from omise.errors import BaseError

# Configure logger
logger = logging.getLogger(__name__)

class OmisePaymentService:
    def __init__(self, secret_key: str = None):
        self.api_secret = secret_key or os.environ.get("OMISE_SECRET_KEY")
        if not self.api_secret:
            logger.error("❌ [Omise] FATAL: OMISE_SECRET_KEY is not set!")
            raise ValueError("OMISE_SECRET_KEY is missing in environment.")
            
        omise.api_secret = self.api_secret
        self.return_uri = os.environ.get("RETURN_URI", "http://localhost:3000/payment-result")

    def create_charge(self, amount: int, payment_type: str, payment_id: str, metadata: dict = None):
        try:
            amount_int = int(float(amount))
            logger.info(f"[Omise] Attempting to create charge: {amount_int} THB(satangs) via {payment_type}")
        except (TypeError, ValueError) as e:
            logger.error(f"[Omise] FATAL: Invalid amount format: {amount} ({e})")
            return None

        charge_data = {
            "amount": amount_int,
            "currency": "thb",
            "capture": True,
            "metadata": metadata or {}
        }
        
        from datetime import datetime, timedelta
        import pytz

        if payment_type == "token":
            charge_data["card"] = payment_id
        elif payment_type in ["source", "promptpay"]:
            charge_data["source"] = payment_id
            charge_data["return_uri"] = self.return_uri
            # ให้ PromptPay QR หมดอายุใน 5 นาที เพื่อไม่ให้ค้าง Pending ใน Dashboard
            expires_at = datetime.now(pytz.utc) + timedelta(minutes=5)
            charge_data["expires_at"] = expires_at.isoformat()
        else:
            logger.error(f"❌ [Omise] Unsupported payment type: {payment_type}")
            return None
            
        # ส่งหน้าที่การยิง API ให้กับ Private Method
        return self._execute_charge(charge_data)

    def _execute_charge(self, charge_data: dict):
        try:
            logger.info(f"[Omise] Request Payload: {charge_data}")
            charge = omise.Charge.create(**charge_data)
            
            logger.info(f"✅ [Omise] SUCCESS: Charge Created")
            logger.info(f"   - ID: {charge.id}")
            logger.info(f"   - Status: {charge.status}")
            logger.info(f"   - Amount: {charge.amount} {charge.currency}")
            return charge

        except BaseError as oe: 
            logger.error(f"❌ [Omise] API ERROR (BaseError):")
            logger.error(f"   - Details: {oe}")
            
            if 'authentication' in str(oe).lower():
                logger.error(f"   !!! CHECK YOUR OMISE_SECRET_KEY !!!")
            return None

        except Exception as e:
            logger.error(f"❌ [Omise] UNEXPECTED SYSTEM ERROR: {type(e).__name__}: {e}")
            logger.exception("Full traceback:")
            return None

    def create_refund(self, charge_id: str, amount: int = None):
        """
        Issue a refund for a given charge_id via Omise API.
        - charge_id: the Omise charge ID (e.g. 'chrg_test_xxx')
        - amount:    refund amount in satangs (THB × 100). None = full refund.
        Returns the Refund object on success, None on failure.
        """
        if not charge_id:
            logger.error("❌ [Omise] create_refund called with empty charge_id")
            return None
        try:
            omise.api_secret = self.api_secret  # ensure key is set
            charge = omise.Charge.retrieve(charge_id)
            refund_kwargs = {}
            if amount is not None:
                refund_kwargs["amount"] = int(amount)
            refund = charge.refund(**refund_kwargs)
            logger.info(
                f"✅ [Omise] Refund created for charge {charge_id}: "
                f"refund_id={refund.id} amount={refund.amount} status={refund.status}"
            )
            return refund
        except BaseError as oe:
            logger.error(f"❌ [Omise] Refund API error for charge {charge_id}: {oe}")
            return None
        except Exception as e:
            logger.error(f"❌ [Omise] Unexpected error during refund for charge {charge_id}: {type(e).__name__}: {e}")
            return None

    def cancel_charge(self, charge_id: str):
        """
        Attempt to reverse or expire a pending charge.
        Omise allows reversing uncaptured credit card charges.
        For PromptPay, it might not be natively cancellable but we can try reverse() or let it expire.
        """
        if not charge_id or charge_id.startswith("draft_"):
            return True
            
        try:
            omise.api_secret = self.api_secret
            charge = omise.Charge.retrieve(charge_id)
            if charge.status == "pending":
                # สำหรับ PromptPay หรือรายการที่ยัง pending ลองสั่ง reverse หรือ update ให้ expire
                # (Omise Python SDK ใช้คำสั่ง reverse() สำหรับยกเลิกรายการ)
                charge.reverse()
                logger.info(f"✅ [Omise] Charge {charge_id} reversed/cancelled successfully.")
                return True
            return True
        except BaseError as oe:
            logger.warning(f"⚠️ [Omise] Could not reverse charge {charge_id}: {oe}")
            return False
        except Exception as e:
            logger.warning(f"⚠️ [Omise] Error cancelling charge {charge_id}: {e}")
            return False