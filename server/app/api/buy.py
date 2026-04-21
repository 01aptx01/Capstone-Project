from flask import Blueprint, request
from app.services.buy_service import buy_product
from app.services.omise_service import create_charge

buy_api = Blueprint("buy_api", __name__)

# Temporary in-memory store for payment statuses (e.g., {'chrg_xxx': 'PENDING'})
# In production, use your database (transactions table)
payment_statuses = {}

@buy_api.route("/api/buy/checkout", methods=["POST"])
def checkout():
    data = request.json
    payment_type = data.get("payment_type")
    payment_id = data.get("payment_id")
    amount = data.get("amount")

    # Call omise service
    charge = create_charge(amount, payment_type, payment_id)

    if not charge:
        return {"status": "ERROR", "message": "Failed to create charge"}, 400

    payment_statuses[charge.id] = charge.status

    if payment_type == "source":
        # PromptPay returns a charge with a scannable QR code in its source
        # charge.source.scannable_code.image.download_uri contains the QR code image
        qr_code_uri = charge.source.scannable_code.image.download_uri
        return {"status": "PENDING", "charge_id": charge.id, "qr_code": qr_code_uri}
    else:
        # For cards, charge could be successful immediately or pending 3DS
        if charge.status == "successful":
            payment_statuses[charge.id] = "PAID"
            return {"status": "OK", "charge_id": charge.id}
        else:
            return {"status": charge.status, "charge_id": charge.id}

@buy_api.route("/api/buy/omise-webhook", methods=["POST"])
def omise_webhook():
    event = request.json
    
    if event.get("key") == "charge.complete":
        charge_data = event.get("data")
        charge_id = charge_data.get("id")
        
        if charge_data.get("status") == "successful":
            payment_statuses[charge_id] = "PAID"
            
            # Here, you would call buy_product to deduct stock and record transaction
            # buy_product(machine_id, product_id)
            
            return {"message": "Webhook processed, payment successful"}, 200
        else:
            payment_statuses[charge_id] = "FAILED"
            return {"message": "Webhook processed, payment failed"}, 200

    return {"message": "Event ignored"}, 200

@buy_api.route("/api/buy/status/<charge_id>", methods=["GET"])
def check_status(charge_id):
    status = payment_statuses.get(charge_id, "UNKNOWN")
    return {"status": status}

@buy_api.route("/api/buy", methods=["POST"])
def buy():
    # Legacy endpoint
    data = request.json

    success = buy_product(
        data["machine_id"],
        data["product_id"]
    )

    if not success:
        return {"status": "OUT_OF_STOCK"}, 400

    return {"status": "OK", "slot": 1}