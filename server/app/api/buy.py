import json
import logging
import os
import hmac
import hashlib
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

        # IN-MEMORY: ใช้เก็บ charge → status สำหรับ Frontend polling (ไม่ใช่ source of truth)
        # Source of truth อยู่ที่ DB column `orders.status`
        self.order_statuses: dict = {}
        self.pending_orders: dict = {}

        self.blueprint = Blueprint("buy_api", __name__)
        self._register_routes()

    def _register_routes(self):
        self.blueprint.add_url_rule("/api/buy/checkout",       view_func=self.checkout,       methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/create-draft",   view_func=self.create_draft,   methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/omise-webhook",  view_func=self.omise_webhook,  methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/mock-pay",       view_func=self.mock_pay,       methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/cancel",         view_func=self.cancel_order,   methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/status/<charge_id>", view_func=self.check_status, methods=["GET"])
        self.blueprint.add_url_rule("/api/buy",                view_func=self.buy,            methods=["POST"])

    def _verify_webhook_signature(self, body: bytes) -> bool:
        """Verify Omise webhook HMAC-SHA256 signature.
        Returns True if signature is valid or if OMISE_WEBHOOK_SECRET is not configured.
        https://docs.opn.ooo/webhooks#signature
        """
        webhook_secret = os.environ.get("OMISE_WEBHOOK_SECRET")
        if not webhook_secret:
            logger.warning("[Webhook] OMISE_WEBHOOK_SECRET not set — skipping signature check (set for production)")
            return True

        signature = request.headers.get("X-Omise-Signature", "")
        if not signature:
            logger.warning("[Webhook] Missing X-Omise-Signature header")
            return False

        expected = hmac.new(
            webhook_secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            logger.error("[Webhook] Invalid webhook signature — request rejected")
            return False

        return True

    # =============================================
    # INTERNAL: Dispense orchestration
    # =============================================

    def _execute_dispense(self, charge_id: str, charge_obj=None) -> bool:
        order = self.pending_orders.get(charge_id)

        if not order and charge_obj:
            # Recovery: ดึงข้อมูล cart จาก Omise metadata
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

        # Step 1: Atomic claim + stock deduction (RC-6 / RC-7 guard)
        try:
            stock_ok = self.inventory_service.deduct_stock(machine_code, cart, charge_id)
        except AlreadyClaimedError:
            # RC-6: อีก thread (webhook/poll) claim ไปแล้ว → ปลอดภัย ไม่ต้อง refund
            logger.warning(f"[Dispense] charge {charge_id} already claimed — skipping (RC-6)")
            return False
        except InsufficientStockError:
            # RC-7: TOCTOU — สต๊อกหมดระหว่างรอ Omise แต่เงินถูกตัดไปแล้ว → refund
            logger.error(f"[Dispense] Stock exhausted after charge for {charge_id} (TOCTOU) — triggering refund")
            self.inventory_service.update_order_status(charge_id, "dispense_failed")
            self._trigger_refund(charge_id)
            return False
        except Exception as exc:
            logger.error(f"[Dispense] Unexpected error in deduct_stock for {charge_id}: {exc}")
            self.inventory_service.update_order_status(charge_id, "dispense_failed")
            self._trigger_refund(charge_id)
            return False

        if not stock_ok:
            logger.error(f"[Dispense] Stock deduction returned False for charge_id: {charge_id}")
            return False

        # Step 2: Dispatch to hardware
        dispatch_mode = (os.environ.get("DISPATCH_MODE") or "socket").lower()
        if dispatch_mode == "http":
            agent_ok = self.hardware_agent.notify_dispense(machine_code, cart, charge_id=charge_id)
            if not agent_ok:
                logger.error(f"[Dispense] Hardware agent notification failed for charge_id: {charge_id}")
                self.inventory_service.update_order_status(charge_id, "dispense_failed")
                self._trigger_refund(charge_id)
        else:
            # Socket.IO dispatch — สถานะจะถูกอัปเดตตาม event จากเครื่อง
            emit_job_start(
                machine_code,
                job_id=str(charge_id),
                order_charge_id=str(charge_id),
                items=cart,
            )

        # Clean up in-memory order
        self.pending_orders.pop(charge_id, None)
        return True

    def _trigger_refund(self, charge_id: str) -> None:
        """Fire auto-refund in background thread."""
        import threading as _t
        from app.realtime.socketio_gateway import _auto_refund
        _t.Thread(target=_auto_refund, args=(charge_id,), daemon=True).start()

    # =============================================
    # ROUTE HANDLERS
    # =============================================

    def checkout(self):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        logger.info(f"[Checkout] Received request: {data}")

        payment_type = data.get("payment_type")
        payment_id   = data.get("payment_id")
        amount       = data.get("amount")
        raw_cart     = data.get("cart", [])
        machine_code = data.get("machine_code") or data.get("machine_id", "MP1-001")
        draft_id     = data.get("draft_id")

        # Normalize cart → [{product_id, quantity}]
        cart = []
        for item in raw_cart:
            if not isinstance(item, dict):
                continue
            product_id = item.get("product_id") or item.get("id")
            quantity   = item.get("quantity")   or item.get("qty")
            cart.append({"product_id": int(product_id), "quantity": int(quantity)})

        payment_method = "qr_code" if payment_type == "source" else "credit_card"
        total_price    = (float(amount) / 100.0) if amount is not None else 0.0

        # Step 1: Stock validation
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

        # Step 3: จัดการ Order ใน DB (อัปเกรด draft หรือสร้างใหม่)
        self.order_statuses[charge.id] = "pending_payment"
        self.pending_orders[charge.id] = {"cart": cart, "machine_code": machine_code}

        if draft_id:
            persisted = self.inventory_service.upgrade_draft_order(draft_id, charge.id, payment_method)
            self.order_statuses.pop(draft_id, None)
            self.pending_orders.pop(draft_id, None)
        else:
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

        # Step 4: Response ตาม Omise status
        if charge.status == "successful":
            # บัตรเครดิตผ่านทันที
            logger.info(f"[Checkout] Payment SUCCESS for charge {charge.id}")
            self.order_statuses[charge.id] = "paid"
            self._execute_dispense(charge.id, charge_obj=charge)
            return jsonify({"status": "paid", "charge_id": charge.id, "message": "Payment successful, dispensing..."})

        elif charge.status == "pending":
            # QR Code — รอลูกค้าสแกน
            logger.info(f"[Checkout] Payment PENDING for charge {charge.id}")
            qr_code = None
            if hasattr(charge, 'source') and hasattr(charge.source, 'scannable_code'):
                qr_code = charge.source.scannable_code.image.download_uri
            return jsonify({
                "status": "pending_payment",
                "charge_id": charge.id,
                "qr_code": qr_code,
                "authorize_uri": getattr(charge, 'authorize_uri', None)
            })

        else:
            # จ่ายไม่ผ่านทันที
            logger.error(f"[Checkout] Payment FAILED for charge {charge.id}: {charge.failure_message}")
            self.order_statuses[charge.id] = "payment_failed"
            self.inventory_service.update_order_status(charge.id, "payment_failed")
            self.pending_orders.pop(charge.id, None)
            return jsonify({
                "status": "payment_failed",
                "charge_id": charge.id,
                "message": charge.failure_message
            }), 400

    def omise_webhook(self):
        """Omise Webhook Listener — with HMAC signature verification"""
        raw_body = request.get_data()  # must read before get_json()
        if not self._verify_webhook_signature(raw_body):
            return jsonify({"message": "Invalid signature"}), 401

        event = request.get_json(silent=True)
        if not isinstance(event, dict):
            return jsonify({"message": "Invalid JSON body"}), 400

        logger.info(f"[Webhook] Received Omise event: {event.get('key')}")

        if event.get("key") == "charge.complete":
            charge_data = event.get("data", {})
            charge_id   = charge_data.get("id")
            status      = charge_data.get("status")

            logger.info(f"[Webhook] Charge {charge_id} status updated to: {status}")

            if status == "successful":
                self.order_statuses[charge_id] = "paid"
                import omise
                charge_obj = omise.Charge.retrieve(charge_id)
                success = self._execute_dispense(charge_id, charge_obj=charge_obj)
                msg = "dispense triggered" if success else "dispense skipped (already claimed or failed)"
                return jsonify({"message": f"Webhook processed, payment successful, {msg}"}), 200
            else:
                self.order_statuses[charge_id] = "payment_failed"
                self.inventory_service.update_order_status(charge_id, "payment_failed")
                self.pending_orders.pop(charge_id, None)
                return jsonify({"message": "Webhook processed, payment failed"}), 200

        return jsonify({"message": "Event ignored"}), 200

    def create_draft(self):
        """สร้าง Draft Order รอการแตะบัตร (สถานะ pending_payment)"""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        machine_code = data.get("machine_code", "MP1-001")
        raw_cart = data.get("cart", [])
        amount = data.get("amount")
        payment_method = data.get("payment_method", "credit_card")
        total_price = (float(amount) / 100.0) if amount is not None else 0.0

        cart = []
        for item in raw_cart:
            if not isinstance(item, dict):
                continue
            product_id = item.get("product_id") or item.get("id")
            quantity = item.get("quantity") or item.get("qty")
            cart.append({"product_id": int(product_id), "quantity": int(quantity)})

        if not self.inventory_service.check_stock(machine_code, cart):
            return jsonify({"status": "ERROR", "message": "One or more items are out of stock"}), 400

        import uuid
        draft_id = f"draft_{uuid.uuid4().hex[:16]}"
        
        self.order_statuses[draft_id] = "pending_payment"
        self.pending_orders[draft_id] = {"cart": cart, "machine_code": machine_code}
        
        persisted = self.inventory_service.create_pending_order(
            machine_code=machine_code,
            cart_items=cart,
            charge_id=draft_id,
            payment_method=payment_method,
            total_price=total_price,
        )
        
        if not persisted:
            return jsonify({"status": "ERROR", "message": "Failed to create draft"}), 500

        return jsonify({"status": "pending_payment", "charge_id": draft_id})

    def cancel_order(self):
        """ยกเลิกออเดอร์ที่ยังอยู่ในสถานะ pending_payment"""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        charge_id = data.get("charge_id")
        if not charge_id:
            return jsonify({"status": "ERROR", "message": "charge_id is required"}), 400

        # ถ้าเป็น QR หรือบัตรที่ส่งให้ Omise แล้ว ให้กดยกเลิกใน Omise ด้วย
        if not charge_id.startswith("draft_"):
            self.payment_service.cancel_charge(charge_id)

        ok = self.inventory_service.cancel_order(charge_id)
        if ok:
            self.order_statuses.pop(charge_id, None)
            self.pending_orders.pop(charge_id, None)
            return jsonify({"status": "cancelled", "charge_id": charge_id}), 200
        else:
            # อาจจ่ายเงินไปแล้ว ยกเลิกไม่ได้
            return jsonify({
                "status": "ERROR",
                "message": "Cannot cancel — order may already be paid or does not exist"
            }), 409

    def mock_pay(self):
        """Development Bypass for Payment"""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        charge_id = data.get("charge_id")
        if not charge_id:
            return jsonify({"status": "ERROR", "message": "charge_id is required"}), 400

        if charge_id not in self.order_statuses:
            return jsonify({"status": "ERROR", "message": "Unknown charge_id"}), 404

        self.order_statuses[charge_id] = "paid"
        success = self._execute_dispense(charge_id)

        if success:
            return jsonify({"status": "paid", "message": "Payment marked as successful, dispense triggered"}), 200
        else:
            return jsonify({"status": "paid", "message": "Payment marked as successful, but dispense had issues"}), 200

    def check_status(self, charge_id):
        """Poll Order Status — คืนค่าจาก DB เสมอ (single source of truth)"""
        db_status = self._get_db_status(charge_id)

        if db_status:
            # ถ้า DB บอกว่ายังรอจ่าย แต่ Omise บอกว่าผ่านแล้ว → trigger dispense
            if db_status == "pending_payment":
                try:
                    import omise
                    charge = omise.Charge.retrieve(charge_id)
                    if charge.status == "successful":
                        self.order_statuses[charge_id] = "paid"
                        self._execute_dispense(charge_id, charge_obj=charge)
                        return jsonify({"status": "paid"})
                except Exception as e:
                    logger.error(f"[CheckStatus] Error retrieving charge {charge_id}: {e}")
            return jsonify({"status": db_status})

        # Fallback: ดูจาก in-memory
        status = self.order_statuses.get(charge_id, "unknown")
        return jsonify({"status": status})

    def _get_db_status(self, charge_id: str) -> str | None:
        """ดึง status จาก DB โดยตรง"""
        try:
            from app.db_config.db import get_db
            db = get_db()
            cur = db.cursor(dictionary=True)
            try:
                cur.execute(
                    "SELECT status FROM orders WHERE charge_id = %s",
                    (charge_id,),
                )
                row = cur.fetchone()
                return row["status"] if row else None
            finally:
                cur.close()
                db.close()
        except Exception as e:
            logger.error(f"[CheckStatus] DB query failed for {charge_id}: {e}")
            return None

    def buy(self):
        """Direct buy endpoint - alias for checkout"""
        return self.checkout()


# =============================================
# สร้าง Instance และ Expose Blueprint
# =============================================
payment_service   = OmisePaymentService()
inventory_service = InventoryService()
hardware_agent    = HardwareAgentService()

buy_controller = BuyController(payment_service, inventory_service, hardware_agent)
buy_api = buy_controller.blueprint