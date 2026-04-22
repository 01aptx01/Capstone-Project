from flask import Blueprint, request, jsonify
from app.services.buy_service import buy_product, deduct_stock, notify_hardware_agent
from app.services.omise_service import create_charge

buy_api = Blueprint("buy_api", __name__)

# =============================================
# IN-MEMORY STORES
# =============================================
# Payment statuses: {'chrg_xxx': 'PENDING' | 'PAID' | 'FAILED'}
payment_statuses = {}

# Pending orders: stores cart + machine_id keyed by charge_id
# e.g. {'chrg_xxx': {'cart': [{'id': 1, 'qty': 2}], 'machine_id': 'MP1-001'}}
pending_orders = {}


# =============================================
# SHARED DISPENSE LOGIC
# =============================================
def _execute_dispense(charge_id):
    """
    Shared logic for executing the dispense flow after successful payment.
    1. Retrieve the saved cart details via charge_id
    2. Deduct stock quantities in MySQL
    3. Notify the hardware agent to physically dispense items
    """
    order = pending_orders.get(charge_id)

    if not order:
        print(f"[Dispense] No pending order found for charge_id: {charge_id}")
        return False

    cart = order["cart"]
    machine_id = order["machine_id"]

    # Step 1: Deduct stock in database
    stock_ok = deduct_stock(machine_id, cart, charge_id)

    if not stock_ok:
        print(f"[Dispense] Stock deduction failed for charge_id: {charge_id}")
        return False

    # Step 2: Notify hardware agent to dispense
    agent_ok = notify_hardware_agent(cart, machine_id)

    if not agent_ok:
        print(f"[Dispense] Hardware agent notification failed for charge_id: {charge_id} (stock already deducted)")

    # Clean up the pending order
    pending_orders.pop(charge_id, None)

    return True


# =============================================
# ENDPOINTS
# =============================================

@buy_api.route("/api/buy/checkout", methods=["POST"])
def checkout():
    """
    POST /api/buy/checkout
    Accepts cart, machine_id, amount, payment_type, payment_id from the frontend.
    Creates an Omise charge and stores the cart details keyed by charge_id.
    """
    data = request.json
    payment_type = data.get("payment_type")
    payment_id = data.get("payment_id")
    amount = data.get("amount")
    cart = data.get("cart", [])
    machine_id = data.get("machine_id", "MP1-001")

    # Call omise service
    charge = create_charge(amount, payment_type, payment_id)

    if not charge:
        return jsonify({"status": "ERROR", "message": "Failed to create charge"}), 400

    # Store payment status
    payment_statuses[charge.id] = charge.status

    # Store cart and machine_id linked to this charge for later dispense
    pending_orders[charge.id] = {
        "cart": cart,
        "machine_id": machine_id
    }

    if payment_type in ['source', 'promptpay']:
        # PromptPay returns a charge with a scannable QR code in its source
        qr_code_uri = charge.source.scannable_code.image.download_uri
        return jsonify({
            "status": "PENDING",
            "charge_id": charge.id,
            "qr_code": qr_code_uri
        })
    else:
        # For cards, charge could be successful immediately or pending 3DS
        if charge.status == "successful":
            payment_statuses[charge.id] = "PAID"
            _execute_dispense(charge.id)
            return jsonify({"status": "OK", "charge_id": charge.id})
        else:
            return jsonify({"status": charge.status, "charge_id": charge.id})


@buy_api.route("/api/buy/omise-webhook", methods=["POST"])
def omise_webhook():
    """
    POST /api/buy/omise-webhook
    Receives Omise webhook events for charge completion.
    On successful payment, executes the dispense flow.
    """
    event = request.json

    if event.get("key") == "charge.complete":
        charge_data = event.get("data")
        charge_id = charge_data.get("id")

        if charge_data.get("status") == "successful":
            payment_statuses[charge_id] = "PAID"

            # Execute the full dispense flow
            success = _execute_dispense(charge_id)

            if success:
                return jsonify({"message": "Webhook processed, payment successful, dispense triggered"}), 200
            else:
                return jsonify({"message": "Webhook processed, payment successful, but dispense failed"}), 200
        else:
            payment_statuses[charge_id] = "FAILED"
            # Clean up the pending order on failure
            pending_orders.pop(charge_id, None)
            return jsonify({"message": "Webhook processed, payment failed"}), 200

    return jsonify({"message": "Event ignored"}), 200


@buy_api.route("/api/buy/mock-pay", methods=["POST"])
def mock_pay():
    """
    POST /api/buy/mock-pay
    Accepts a charge_id, marks it as 'PAID', and executes the dispense flow.
    Used for development/testing when Omise webhooks are not available.
    """
    data = request.json
    charge_id = data.get("charge_id")

    if not charge_id:
        return jsonify({"status": "ERROR", "message": "charge_id is required"}), 400

    if charge_id not in payment_statuses:
        return jsonify({"status": "ERROR", "message": "Unknown charge_id"}), 404

    # Mark as paid
    payment_statuses[charge_id] = "PAID"

    # Execute the full dispense flow
    success = _execute_dispense(charge_id)

    if success:
        return jsonify({"status": "PAID", "message": "Payment marked as successful, dispense triggered"}), 200
    else:
        return jsonify({"status": "PAID", "message": "Payment marked as successful, but dispense had issues"}), 200


@buy_api.route("/api/buy/status/<charge_id>", methods=["GET"])
def check_status(charge_id):
    """GET /api/buy/status/<charge_id> — Poll payment status."""
    status = payment_statuses.get(charge_id, "UNKNOWN")
    return jsonify({"status": status})


@buy_api.route("/api/buy", methods=["POST"])
def buy():
    """Legacy single-product purchase endpoint."""
    data = request.json

    success = buy_product(
        data["machine_id"],
        data["product_id"]
    )

    if not success:
        return jsonify({"status": "OUT_OF_STOCK"}), 400

    return jsonify({"status": "OK", "slot": 1})