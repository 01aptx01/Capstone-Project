import os
import omise

# Load Omise Secret Key
omise.api_secret = os.environ.get("OMISE_SECRET_KEY")

def create_charge(amount: int, payment_type: str, payment_id: str):
    """
    Creates a charge using Opn Payments.
    amount is expected in smallest unit (satangs).
    """
    charge_data = {
        "amount": amount,
        "currency": "thb",
    }
    
    if payment_type == "token":
        charge_data["card"] = payment_id
    elif payment_type in ["source", "promptpay"]:
        charge_data["source"] = payment_id
        # Usually for webhook return_uri
        charge_data["return_uri"] = os.environ.get("RETURN_URI", "http://localhost:3000")
    
    try:
        charge = omise.Charge.create(**charge_data)
        return charge
    except Exception as e:
        print(f"Omise Error: {e}")
        return None
