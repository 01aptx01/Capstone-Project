import os
import omise
import logging
from omise.errors import BaseError

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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
        
        if payment_type == "token":
            charge_data["card"] = payment_id
        elif payment_type in ["source", "promptpay"]:
            charge_data["source"] = payment_id
            charge_data["return_uri"] = self.return_uri
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