from flask import Blueprint, request, jsonify
from app.services.buy_service import buy_product, deduct_stock, notify_hardware_agent, check_stock
from app.services.omise_service import create_charge
import logging

# Configure logger
logger = logging.getLogger(__name__)

buy_api = Blueprint("buy_api", __name__)

# =============================================
# IN-MEMORY STORES (Can be moved to Redis/DB later)
# =============================================
# Payment statuses: {'chrg_xxx': 'PENDING' | 'PAID' | 'FAILED'}
payment_statuses = {}

# Pending orders: stores cart + machine_id keyed by charge_id
pending_orders = {}


# =============================================
# SHARED DISPENSE LOGIC
# =============================================
def _execute_dispense(charge_id, charge_obj=None):
    """
    Shared logic for executing the dispense flow after successful payment.
    - charge_obj: If provided, use metadata from it if pending_orders is missing (e.g. after restart).
    """
    order = pending_orders.get(charge_id)
    
    import json
    if not order and charge_obj:
        # Recovery flow: Get cart from Omise metadata
        metadata = getattr(charge_obj, 'metadata', {})
        if 'cart' in metadata:
            order = {
                "cart": json.loads(metadata['cart']),
                "machine_id": metadata.get('machine_id', 'MP1-001')
            }
            logger.info(f"[Dispense] Recovered order from Omise metadata for charge: {charge_id}")

    if not order:
        logger.warning(f"[Dispense] No pending order found for charge_id: {charge_id}")
        return False

    cart = order["cart"]
    machine_id = order["machine_id"]

    logger.info(f"[Dispense] Starting dispense for charge {charge_id}. Cart: {cart}")

    # Step 1: Deduct stock in database
    stock_ok = deduct_stock(machine_id, cart, charge_id)

    if not stock_ok:
        logger.error(f"[Dispense] Stock deduction failed for charge_id: {charge_id}")
        return False

    # Step 2: Notify hardware agent to dispense
    agent_ok = notify_hardware_agent(cart, machine_id)

    if not agent_ok:
        logger.error(f"[Dispense] Hardware agent notification failed for charge_id: {charge_id}")

    # Clean up the pending order
    pending_orders.pop(charge_id, None)

    return True


# =============================================
# ENDPOINTS
# =============================================

@buy_api.route("/api/buy/checkout", methods=["POST"])
def checkout():
    """
    Initiate Purchase flow (Stock check + Omise Charge)
    ---
    tags:
      - Payments
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [payment_id, payment_type, amount, cart]
          properties:
            payment_id:
              type: string
              description: tok_xxx or src_xxx
            payment_type:
              type: string
              enum: [token, source]
            amount:
              type: integer
              description: Amount in smallest unit (satangs)
            cart:
              type: array
              items:
                type: object
                properties:
                  id: {type: integer}
                  quantity: {type: integer}
            machine_id:
              type: string
              default: MP1-001
    responses:
      200:
        description: Payment successful or pending (QR generated)
      400:
        description: Stock error or Payment failure
    """
    data = request.json
    logger.info(f"[Checkout] Received request: {data}")
    
    payment_type = data.get("payment_type") # 'token' or 'source'
    payment_id = data.get("payment_id")     # tok_xxx or src_xxx
    amount = data.get("amount")
    cart = data.get("cart", [])
    machine_id = data.get("machine_id", "MP1-001")

    # Step 1: Strict Stock Validation
    if not check_stock(machine_id, cart):
        logger.warning(f"[Checkout] Stock validation failed for machine {machine_id}")
        return jsonify({"status": "ERROR", "message": "One or more items are out of stock"}), 400

    # Step 2: Create Omise Charge (Server-Side Heavy)
    import json
    metadata = {
        "machine_id": machine_id,
        "cart": json.dumps(cart) # Persist cart in Omise metadata
    }
    
    logger.info(f"[Checkout] Initiating Omise charge for {amount} via {payment_type}")
    charge = create_charge(amount, payment_type, payment_id, metadata=metadata)

    if not charge:
        logger.error("[Checkout] Omise charge creation failed")
        return jsonify({
            "status": "ERROR", 
            "message": "Omise charge creation failed. Please check server logs for detailed API error."
        }), 400

    # Step 3: Persistence (Local Cache)
    payment_statuses[charge.id] = charge.status
    pending_orders[charge.id] = {
        "cart": cart,
        "machine_id": machine_id
    }

    # Step 4: Unified Response
    if charge.status == "successful":
        logger.info(f"[Checkout] Payment SUCCESS for charge {charge.id}")
        payment_statuses[charge.id] = "PAID"
        _execute_dispense(charge.id, charge_obj=charge)
        return jsonify({
            "status": "OK",
            "charge_id": charge.id,
            "message": "Payment successful, dispensing..."
        })
    elif charge.status == "pending":
        logger.info(f"[Checkout] Payment PENDING for charge {charge.id}")
        # Check if it's PromptPay (has a scannable code in the source)
        qr_code = None
        if hasattr(charge, 'source') and hasattr(charge.source, 'scannable_code'):
            qr_code = charge.source.scannable_code.image.download_uri

        return jsonify({
            "status": "PENDING",
            "charge_id": charge.id,
            "qr_code": qr_code,
            "authorize_uri": getattr(charge, 'authorize_uri', None) # For 3DS
        })
    else:
        logger.error(f"[Checkout] Payment FAILED for charge {charge.id}: {charge.failure_message}")
        return jsonify({"status": "FAILED", "charge_id": charge.id, "message": charge.failure_message}), 400


@buy_api.route("/api/buy/omise-webhook", methods=["POST"])
def omise_webhook():
    """
    Omise Webhook Listener
    ---
    tags:
      - Payments
    parameters:
      - in: body
        name: body
        description: Omise Event Object
        schema:
          type: object
    responses:
      200:
        description: Event processed
    """
    event = request.json
    logger.info(f"[Webhook] Received Omise event: {event.get('key')}")

    if event.get("key") == "charge.complete":
        charge_data = event.get("data")
        charge_id = charge_data.get("id")
        status = charge_data.get("status")

        logger.info(f"[Webhook] Charge {charge_id} status updated to: {status}")

        if status == "successful":
            payment_statuses[charge_id] = "PAID"

            # Re-fetch full charge object to get metadata if needed
            import omise
            charge_obj = omise.Charge.retrieve(charge_id)

            # Execute the full dispense flow with recovery support
            success = _execute_dispense(charge_id, charge_obj=charge_obj)

            if success:
                logger.info(f"[Webhook] Dispense triggered successfully for {charge_id}")
                return jsonify({"message": "Webhook processed, payment successful, dispense triggered"}), 200
            else:
                logger.error(f"[Webhook] Dispense failed for {charge_id}")
                return jsonify({"message": "Webhook processed, payment successful, but dispense failed"}), 200
        else:
            payment_statuses[charge_id] = "FAILED"
            # Clean up the pending order on failure
            pending_orders.pop(charge_id, None)
            logger.warning(f"[Webhook] Payment failed for {charge_id}")
            return jsonify({"message": "Webhook processed, payment failed"}), 200

    return jsonify({"message": "Event ignored"}), 200


@buy_api.route("/api/buy/mock-pay", methods=["POST"])
def mock_pay():
    """
    Development Bypass for Payment
    ---
    tags:
      - Development
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            charge_id: {type: string}
    responses:
      200:
        description: Payment forced to PAID
      404:
        description: Charge ID not found
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
    """
    Poll Payment Status
    ---
    tags:
      - Payments
    parameters:
      - name: charge_id
        in: path
        required: true
        type: string
    responses:
      200:
        description: Returns current status (PAID, PENDING, FAILED, etc.)
    """
    status = payment_statuses.get(charge_id)
    
    if not status or status == "pending":
        # Ask Omise for the latest status if unknown or still pending
        try:
            import omise
            charge = omise.Charge.retrieve(charge_id)
            status = charge.status
            payment_statuses[charge_id] = status
            
            # If it just became successful, trigger dispense (if not already triggered)
            if status == "successful":
                _execute_dispense(charge_id, charge_obj=charge)
                payment_statuses[charge_id] = "PAID"
                status = "PAID"
        except:
            status = status or "UNKNOWN"

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