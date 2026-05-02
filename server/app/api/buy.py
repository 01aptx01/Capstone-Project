import json
import logging
import os
from flask import Blueprint, request, jsonify
from app.services.omise_service import OmisePaymentService
from app.services.buy_service import InventoryService, AlreadyClaimedError, InsufficientStockError
from app.services.hardware_service import HardwareAgentService
from app.realtime.socketio_gateway import emit_job_start

# Configure logger
logger = logging.getLogger(__name__)
class BuyController:
    def __init__(self, payment_service: OmisePaymentService, inventory_service: InventoryService, hardware_agent: HardwareAgentService):
        self.payment_service = payment_service
        self.inventory_service = inventory_service
        self.hardware_agent = hardware_agent

        # IN-MEMORY STORES
        self.payment_statuses = {}
        self.pending_orders = {}

        # สร้าง Blueprint ในตัว
        self.blueprint = Blueprint("buy_api", __name__)
        self._register_routes()

    def _register_routes(self):
        self.blueprint.add_url_rule("/api/buy/checkout", view_func=self.checkout, methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/omise-webhook", view_func=self.omise_webhook, methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/mock-pay", view_func=self.mock_pay, methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/status/<charge_id>", view_func=self.check_status, methods=["GET"])
        self.blueprint.add_url_rule("/api/buy", view_func=self.buy, methods=["POST"])

    def _execute_dispense(self, charge_id: str, charge_obj=None) -> bool:
        order = self.pending_orders.get(charge_id)
        
        if not order and charge_obj:
            # Recovery flow: Get cart from Omise metadata
            metadata = getattr(charge_obj, 'metadata', {})
            if 'cart' in metadata:
                order = {
                    "cart": json.loads(metadata['cart']),
                    "machine_code": metadata.get('machine_code') or metadata.get('machine_id', 'MP1-001')
                }
                logger.info(f"[Dispense] Recovered order from Omise metadata for charge: {charge_id}")

        if not order:
            logger.warning(f"[Dispense] No pending order found for charge_id: {charge_id}")
            return False

        cart = order["cart"]
        machine_code = order["machine_code"]

        logger.info(f"[Dispense] Starting dispense for charge {charge_id}. Cart: {cart}")

        # Step 1: Deduct stock in database + atomic payment claim (RC-6/RC-7 guard)
        try:
            stock_ok = self.inventory_service.deduct_stock(machine_code, cart, charge_id)
        except AlreadyClaimedError:
            # RC-6: อีก thread (webhook/poll) claim ไปแล้ว → ปลอดภัย ไม่ต้อง refund
            logger.warning(f"[Dispense] charge {charge_id} already claimed — skipping (RC-6)")
            return False
        except InsufficientStockError:
            # RC-7: TOCTOU — สต๊อกหมดระหว่างรอ Omise แต่เงินถูกตัดไปแล้ว → refund
            logger.error(f"[Dispense] Stock exhausted after charge for {charge_id} (TOCTOU) — triggering refund")
            import threading as _t
            from app.realtime.socketio_gateway import _auto_refund
            _t.Thread(target=_auto_refund, args=(charge_id,), daemon=True).start()
            return False
        except Exception as exc:
            logger.error(f"[Dispense] Unexpected error in deduct_stock for {charge_id}: {exc}")
            import threading as _t
            from app.realtime.socketio_gateway import _auto_refund
            _t.Thread(target=_auto_refund, args=(charge_id,), daemon=True).start()
            return False

        if not stock_ok:
            logger.error(f"[Dispense] Stock deduction returned False for charge_id: {charge_id}")
            return False

        # Step 2: Notify hardware agent to dispense (ใช้ OOP Service)
        dispatch_mode = (os.environ.get("DISPATCH_MODE") or "socket").lower()
        if dispatch_mode == "http":
            agent_ok = self.hardware_agent.notify_dispense(machine_code, cart, charge_id=charge_id)
            if not agent_ok:
                logger.error(f"[Dispense] Hardware agent notification failed for charge_id: {charge_id}")
                self.inventory_service.update_dispense_status(charge_id, "failed")
        else:
            # Socket.IO dispatch to machine room. Do NOT mark dispensed here.
            # The server will update orders.dispense_status when machine reports DONE/ERROR.
            emit_job_start(
                machine_code,
                job_id=str(charge_id),
                order_charge_id=str(charge_id),
                items=cart,
            )

        # Clean up the pending order
        self.pending_orders.pop(charge_id, None)

        return True

    # =============================================
    # ROUTE HANDLERS
    # =============================================

    def checkout(self):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        logger.info(f"[Checkout] Received request: {data}")
        
        payment_type = data.get("payment_type")
        payment_id = data.get("payment_id")
        amount = data.get("amount")
        raw_cart = data.get("cart", [])
        machine_code = data.get("machine_code") or data.get("machine_id", "MP1-001")

        # Normalize cart to: [{product_id, quantity}]
        cart = []
        for item in raw_cart:
            if not isinstance(item, dict):
                continue
            product_id = item.get("product_id")
            if product_id is None:
                product_id = item.get("id")
            quantity = item.get("quantity")
            if quantity is None:
                quantity = item.get("qty")
            cart.append({"product_id": int(product_id), "quantity": int(quantity)})

        # Map Omise request type -> business payment method
        payment_method = "qr_code" if payment_type == "source" else "credit_card"
        total_price = (float(amount) / 100.0) if amount is not None else 0.0

        # Step 1: Strict Stock Validation
        if not self.inventory_service.check_stock(machine_code, cart):
            logger.warning(f"[Checkout] Stock validation failed for machine {machine_code}")
            return jsonify({"status": "ERROR", "message": "One or more items are out of stock"}), 400

        # Step 2: Create Omise Charge
        metadata = {
            "machine_code": machine_code,
            "cart": json.dumps(cart)
        }
        
        logger.info(f"[Checkout] Initiating Omise charge for {amount} via {payment_type}")
        charge = self.payment_service.create_charge(amount, payment_type, payment_id, metadata=metadata)

        if not charge:
            logger.error("[Checkout] Omise charge creation failed")
            return jsonify({"status": "ERROR", "message": "Omise charge creation failed."}), 400

        # Step 3: Persistence (Local Cache)
        self.payment_statuses[charge.id] = charge.status
        self.pending_orders[charge.id] = {"cart": cart, "machine_code": machine_code}

        # Step 3.5: Persist order to DB (pending)
        persisted = self.inventory_service.create_pending_order(
            machine_code=machine_code,
            cart_items=cart,
            charge_id=charge.id,
            payment_method=payment_method,
            total_price=total_price,
        )
        if not persisted:
            logger.error(f"[Checkout] Failed to persist pending order for charge {charge.id}")
            return jsonify({"status": "ERROR", "message": "Failed to persist order"}), 500

        # Step 4: Unified Response
        if charge.status == "successful":
            logger.info(f"[Checkout] Payment SUCCESS for charge {charge.id}")
            self.payment_statuses[charge.id] = "PAID"
            self._execute_dispense(charge.id, charge_obj=charge)
            return jsonify({"status": "OK", "charge_id": charge.id, "message": "Payment successful, dispensing..."})
            
        elif charge.status == "pending":
            logger.info(f"[Checkout] Payment PENDING for charge {charge.id}")
            qr_code = None
            if hasattr(charge, 'source') and hasattr(charge.source, 'scannable_code'):
                qr_code = charge.source.scannable_code.image.download_uri

            return jsonify({
                "status": "PENDING",
                "charge_id": charge.id,
                "qr_code": qr_code,
                "authorize_uri": getattr(charge, 'authorize_uri', None)
            })
        else:
            logger.error(f"[Checkout] Payment FAILED for charge {charge.id}: {charge.failure_message}")
            return jsonify({"status": "FAILED", "charge_id": charge.id, "message": charge.failure_message}), 400

    def omise_webhook(self):
        """Omise Webhook Listener"""
        event = request.get_json(silent=True)
        if not isinstance(event, dict):
            return jsonify({"message": "Invalid JSON body"}), 400

        logger.info(f"[Webhook] Received Omise event: {event.get('key')}")

        if event.get("key") == "charge.complete":
            charge_data = event.get("data")
            charge_id = charge_data.get("id")
            status = charge_data.get("status")

            logger.info(f"[Webhook] Charge {charge_id} status updated to: {status}")

            if status == "successful":
                self.payment_statuses[charge_id] = "PAID"
                
                # Fetch fresh charge object (ผ่าน Service)
                import omise
                charge_obj = omise.Charge.retrieve(charge_id)

                success = self._execute_dispense(charge_id, charge_obj=charge_obj)

                if success:
                    return jsonify({"message": "Webhook processed, payment successful, dispense triggered"}), 200
                else:
                    return jsonify({"message": "Webhook processed, payment successful, but dispense failed"}), 200
            else:
                self.payment_statuses[charge_id] = "FAILED"
                self.pending_orders.pop(charge_id, None)
                return jsonify({"message": "Webhook processed, payment failed"}), 200

        return jsonify({"message": "Event ignored"}), 200

    def mock_pay(self):
        """Development Bypass for Payment"""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        charge_id = data.get("charge_id")

        if not charge_id:
            return jsonify({"status": "ERROR", "message": "charge_id is required"}), 400

        if charge_id not in self.payment_statuses:
            return jsonify({"status": "ERROR", "message": "Unknown charge_id"}), 404

        self.payment_statuses[charge_id] = "PAID"
        success = self._execute_dispense(charge_id)

        if success:
            return jsonify({"status": "PAID", "message": "Payment marked as successful, dispense triggered"}), 200
        else:
            return jsonify({"status": "PAID", "message": "Payment marked as successful, but dispense had issues"}), 200

    def check_status(self, charge_id):
        """Poll Payment Status"""
        status = self.payment_statuses.get(charge_id)
        
        if not status or status == "pending":
            try:
                import omise
                charge = omise.Charge.retrieve(charge_id)
                status = charge.status
                self.payment_statuses[charge_id] = status
                
                if status == "successful":
                    self._execute_dispense(charge_id, charge_obj=charge)
                    self.payment_statuses[charge_id] = "PAID"
                    status = "PAID"
            except Exception as e:
                logger.error(f"[CheckStatus] Error retrieving charge {charge_id}: {e}")
                status = status or "UNKNOWN"

        return jsonify({"status": status})

    def buy(self):
        """Direct buy endpoint - alias for checkout"""
        return self.checkout()

# =============================================
# การสร้าง Blueprint ส่งออกไปใช้งาน
# =============================================
# เราจะสร้าง Instance ของ Services ขึ้นมาก่อน
payment_service = OmisePaymentService()
inventory_service = InventoryService()
hardware_agent = HardwareAgentService()

# จากนั้นสร้าง Controller และ Expose Blueprint ออกไปให้ app.py เรียกใช้
buy_controller = BuyController(payment_service, inventory_service, hardware_agent)
buy_api = buy_controller.blueprint