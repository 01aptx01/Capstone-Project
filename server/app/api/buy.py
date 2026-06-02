import json
import logging
import os
import hmac
import hashlib
from flask import Blueprint, request, jsonify
from app.services.omise_service import OmisePaymentService
from app.services.buy_service import (
    InventoryService,
    AlreadyClaimedError,
    InsufficientStockError,
    PENDING_PAYMENT_BUSY_MINUTES,
)
from app.realtime.socketio_gateway import emit_job_start, is_machine_agent_online

# Configure logger
logger = logging.getLogger(__name__)

class BuyController:
    def __init__(self, payment_service: OmisePaymentService, inventory_service: InventoryService):
        self.payment_service = payment_service
        self.inventory_service = inventory_service

        # IN-MEMORY: ใช้เก็บ charge → status สำหรับ Frontend polling (ไม่ใช่ source of truth)
        # Source of truth อยู่ที่ DB column `orders.status`
        self.order_statuses: dict = {}
        self.pending_orders: dict = {}

        self.blueprint = Blueprint("buy_api", __name__)
        self._register_routes()

    def _register_routes(self):
        self.blueprint.add_url_rule("/api/buy/checkout",       view_func=self.checkout,       methods=["POST"])
        self.blueprint.add_url_rule(
            "/api/buy/validate-coupon", view_func=self.validate_coupon, methods=["POST"]
        )
        self.blueprint.add_url_rule("/api/buy/create-draft",   view_func=self.create_draft,   methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/omise-webhook",  view_func=self.omise_webhook,  methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/mock-pay",       view_func=self.mock_pay,       methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/cancel",         view_func=self.cancel_order,   methods=["POST"])
        self.blueprint.add_url_rule("/api/buy/status/<charge_id>", view_func=self.check_status, methods=["GET"])
        self.blueprint.add_url_rule(
            "/api/buy/active-order", view_func=self.get_active_order, methods=["GET"]
        )
        self.blueprint.add_url_rule("/api/buy",                view_func=self.buy,            methods=["POST"])

    _MACHINE_BUSY_MESSAGE = "ตู้กำลังดำเนินการออเดอร์ก่อนหน้า กรุณารอสักครู่"

    def _reject_if_machine_busy(
        self, machine_code: str, exclude_charge_id: str | None = None
    ):
        row = self.inventory_service.get_blocking_order(
            machine_code, exclude_charge_id=exclude_charge_id
        )
        if not row:
            return None
        created = row.get("created_at")
        return (
            jsonify(
                {
                    "status": "ERROR",
                    "code": "MACHINE_BUSY",
                    "message": self._MACHINE_BUSY_MESSAGE,
                    "blocking_charge_id": row.get("charge_id"),
                    "blocking_status": row.get("status"),
                    "blocking_created_at": created.isoformat() if created else None,
                }
            ),
            409,
        )

    def get_active_order(self):
        """คืนว่าตู้นี้มีออเดอร์ค้างที่ห้ามเปิดซื้อใหม่หรือไม่ (สำหรับ kiosk หลังรีเฟรช)."""
        machine_code = request.args.get("machine_code") or "MP1-001"
        exclude_charge_id = (request.args.get("exclude_charge_id") or "").strip() or None
        row = self.inventory_service.get_blocking_order(
            machine_code, exclude_charge_id=exclude_charge_id
        )
        if not row:
            return jsonify({"busy": False, "machine_code": machine_code})
        created = row.get("created_at")
        return jsonify(
            {
                "busy": True,
                "machine_code": machine_code,
                "charge_id": row.get("charge_id"),
                "status": row.get("status"),
                "created_at": created.isoformat() if created else None,
            }
        )

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

    @staticmethod
    def _normalize_cart(raw_cart) -> list:
        cart = []
        for item in raw_cart:
            if not isinstance(item, dict):
                continue
            product_id = item.get("product_id") or item.get("id")
            quantity = item.get("quantity") or item.get("qty")
            if product_id is None or quantity is None:
                continue
            cart.append({"product_id": int(product_id), "quantity": int(quantity)})
        return cart

    def _resolve_pricing(self, machine_code: str, cart: list, coupon_code=None) -> dict | None:
        """
        Server-side subtotal and optional coupon. Returns None if coupon_code set but invalid.
        """
        from app.services.coupon_service import discount_and_final, lookup_coupon_by_code

        subtotal = self.inventory_service.compute_cart_subtotal(machine_code, cart)
        discount = 0.0
        final = subtotal
        promotion_id = None
        user_promotion_id = None
        raw = coupon_code
        if raw is not None and str(raw).strip():
            reason, c, user_promo_id = lookup_coupon_by_code(raw)
            if reason != "ok" or not c:
                return None
            discount, final = discount_and_final(subtotal, c)
            promotion_id = c.promotion_id
            user_promotion_id = user_promo_id
        return {
            "subtotal": subtotal,
            "discount": discount,
            "final": final,
            "promotion_id": promotion_id,
            "user_promotion_id": user_promotion_id,
        }

    def _handle_paid_order(self, charge_id: str, charge_obj=None) -> bool:
        """After payment success: dispense at the machine via Socket.IO job.start."""
        return self._execute_dispense(charge_id, charge_obj=charge_obj)

    # =============================================
    # INTERNAL: Dispense orchestration
    # =============================================

    def _hydrate_pending_order(self, charge_id: str, charge_obj=None) -> bool:
        """โหลด cart เข้า pending_orders จาก DB หรือ Omise metadata (หลังรีสตาร์ท server / reload UI)."""
        if charge_id in self.pending_orders:
            return True
        ctx = self.inventory_service.get_order_context_for_charge(charge_id)
        if ctx:
            self.pending_orders[charge_id] = ctx
            logger.info(f"[Dispense] Recovered order from DB for charge: {charge_id}")
            return True
        if charge_obj:
            metadata = getattr(charge_obj, "metadata", {}) or {}
            if "cart" in metadata:
                raw_cart = metadata["cart"]
                cart = json.loads(raw_cart) if isinstance(raw_cart, str) else raw_cart
                self.pending_orders[charge_id] = {
                    "cart": cart,
                    "machine_code": metadata.get("machine_code") or "MP1-001",
                }
                logger.info(
                    f"[Dispense] Recovered order from Omise metadata for charge: {charge_id}"
                )
                return True
        return False

    def reconcile_pending_charge(self, charge_id: str) -> str:
        """ซิงค์ pending_payment กับ Omise ก่อน cancel — คืน status ล่าสุดใน DB."""
        db_status = self._get_db_status(charge_id)
        if db_status != "pending_payment":
            return db_status or "unknown"

        age = self.inventory_service.get_order_age_minutes(charge_id)
        is_stale = age is not None and age >= PENDING_PAYMENT_BUSY_MINUTES

        if str(charge_id).startswith("draft_"):
            if not is_stale:
                return "pending_payment"
            self.inventory_service.cancel_order(charge_id)
            self.order_statuses.pop(charge_id, None)
            self.pending_orders.pop(charge_id, None)
            logger.info(f"[Reconcile] Cancelled stale draft {charge_id}")
            return "cancelled"

        try:
            import omise

            charge = omise.Charge.retrieve(charge_id)
        except Exception as e:
            logger.error(f"[Reconcile] Omise retrieve failed for {charge_id}: {e}")
            if is_stale:
                self.inventory_service.cancel_order(charge_id)
                return self._get_db_status(charge_id) or "cancelled"
            return "pending_payment"

        omise_status = getattr(charge, "status", None)
        if omise_status == "successful":
            self._hydrate_pending_order(charge_id, charge)
            self.order_statuses[charge_id] = "paid"
            self._execute_dispense(charge_id, charge_obj=charge)
            return self._get_db_status(charge_id) or "paid"

        if omise_status in ("failed", "expired"):
            self.inventory_service.update_order_status(charge_id, "payment_failed")
            self.order_statuses[charge_id] = "payment_failed"
            self.pending_orders.pop(charge_id, None)
            return "payment_failed"

        if is_stale:
            self.inventory_service.cancel_order(charge_id)
            self.order_statuses.pop(charge_id, None)
            self.pending_orders.pop(charge_id, None)
            logger.info(
                f"[Reconcile] Cancelled stale pending Omise charge {charge_id} (omise={omise_status})"
            )
            return self._get_db_status(charge_id) or "cancelled"

        return "pending_payment"

    def _execute_dispense(self, charge_id: str, charge_obj=None) -> bool:
        order = self.pending_orders.get(charge_id)

        if not order:
            self._hydrate_pending_order(charge_id, charge_obj)
            order = self.pending_orders.get(charge_id)

        if not order:
            logger.warning(f"[Dispense] No pending order found for charge_id: {charge_id}")
            return False

        cart = self.inventory_service.enrich_cart_items(order["cart"])
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

        # Step 2: สั่งงานผ่าน Socket.IO (Pi ต้องเชื่อมต่อ server; ถ้าหลุดจะ replay ตอน reconnect)
        if not is_machine_agent_online(machine_code):
            logger.warning(
                "[Dispense] Pi agent offline for %s — job.start queued until reconnect (charge %s)",
                machine_code,
                charge_id,
            )
        try:
            dispatched = emit_job_start(
                machine_code,
                job_id=str(charge_id),
                order_charge_id=str(charge_id),
                items=cart,
            )
            if not dispatched:
                logger.error(f"[Dispense] emit job.start returned false for {charge_id}")
                self.inventory_service.update_order_status(charge_id, "dispense_failed")
                self._trigger_refund(charge_id)
                return False
        except Exception as exc:
            logger.error(f"[Dispense] emit job.start failed for {charge_id}: {exc}")
            self.inventory_service.update_order_status(charge_id, "dispense_failed")
            self._trigger_refund(charge_id)
            return False

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

    def validate_coupon(self):
        """Machine UI: check coupon code + cart against DB; return discount breakdown."""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"valid": False, "reason": "bad_request"}), 400

        from app.services.coupon_service import (
            discount_and_final,
            lookup_coupon_by_code,
            reason_message_th,
        )

        code = data.get("code") or data.get("coupon_code")
        machine_code = data.get("machine_code") or "MP1-001"
        cart = self._normalize_cart(data.get("cart", []))

        if not cart:
            return jsonify(
                {"valid": False, "reason": "empty_cart", "message": "ตะกร้าว่าง"}
            ), 200

        if not self.inventory_service.check_stock(machine_code, cart):
            return jsonify(
                {"valid": False, "reason": "out_of_stock", "message": "สินค้าบางรายการหมดสต็อก"}
            ), 200

        subtotal = self.inventory_service.compute_cart_subtotal(machine_code, cart)
        if subtotal <= 0:
            return jsonify(
                {"valid": False, "reason": "pricing_failed", "message": "ไม่สามารถคำนวณยอดได้"}
            ), 200

        reason, c, user_promo_id = lookup_coupon_by_code(code)
        if reason != "ok" or not c:
            return jsonify(
                {
                    "valid": False,
                    "reason": reason,
                    "message": reason_message_th(reason),
                }
            ), 200

        disc, final = discount_and_final(subtotal, c)
        if final <= 0:
            return jsonify(
                {
                    "valid": False,
                    "reason": "zero_total",
                    "message": "ยอดสุทธิต้องมากกว่า 0 บาท",
                }
            ), 200

        pc = getattr(c, "points_cost", None) or 0
        try:
            pc = int(pc)
        except (TypeError, ValueError):
            pc = 0

        if (c.type or "").lower() == "percent":
            label_th = f"ส่วนลด {disc:.2f} บาท ({float(c.discount_amount):g}% ของยอดรวม)"
        else:
            label_th = f"ส่วนลด {disc:.2f} บาท (คงที่)"

        return jsonify(
            {
                "valid": True,
                "promotion_id": c.promotion_id,
                "code": c.code,
                "type": c.type,
                "discount_amount": float(c.discount_amount),
                "points_cost": pc,
                "subtotal_thb": subtotal,
                "discount_thb": disc,
                "final_thb": final,
                "label_th": label_th,
            }
        ), 200

    def checkout(self):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        logger.info(f"[Checkout] Received request: {data}")

        payment_type = data.get("payment_type")
        payment_id   = data.get("payment_id")
        amount       = data.get("amount")
        raw_cart     = data.get("cart", [])
        machine_code = data.get("machine_code") or "MP1-001"
        draft_id     = data.get("draft_id")
        coupon_code  = data.get("coupon_code") or data.get("couponCode")

        busy_resp = self._reject_if_machine_busy(
            machine_code, exclude_charge_id=draft_id
        )
        if busy_resp:
            return busy_resp

        cart = self._normalize_cart(raw_cart)

        payment_method = "qr_code" if payment_type in ("source", "truemoney") else "credit_card"

        # Step 1: Stock validation
        if not self.inventory_service.check_stock(machine_code, cart):
            logger.warning(f"[Checkout] Stock validation failed for machine {machine_code}")
            return jsonify({"status": "ERROR", "message": "One or more items are out of stock"}), 400

        if draft_id:
            row = self.inventory_service.get_order_totals_by_charge_id(draft_id)
            if not row:
                return jsonify(
                    {"status": "ERROR", "message": "Draft order not found or already processed"}
                ), 400
            total_price = row["total_price"]
            promotion_id = row["promotion_id"]
        else:
            pricing = self._resolve_pricing(machine_code, cart, coupon_code)
            if pricing is None:
                return jsonify(
                    {"status": "ERROR", "message": "Invalid or expired coupon"}
                ), 400
            if pricing["final"] <= 0:
                return jsonify(
                    {"status": "ERROR", "message": "Order total must be greater than zero"}
                ), 400
            total_price = pricing["final"]
            promotion_id = pricing["promotion_id"]
            user_promotion_id = pricing["user_promotion_id"]

        charge_amount_satang = int(round(float(total_price) * 100))
        client_satang = int(amount) if amount is not None else None
        if client_satang is not None and abs(client_satang - charge_amount_satang) > 2:
            logger.warning(
                "[Checkout] Client amount %s satang != server %s (using server)",
                client_satang,
                charge_amount_satang,
            )

        # Step 2: Create Omise Charge
        metadata = {
            "machine_code": machine_code,
            "cart": json.dumps(cart)
        }
        logger.info(
            f"[Checkout] Initiating Omise charge for {charge_amount_satang} satang via {payment_type}"
        )
        charge = self.payment_service.create_charge(
            charge_amount_satang, payment_type, payment_id, metadata=metadata
        )

        if not charge:
            logger.error("[Checkout] Omise charge creation failed")
            return jsonify({"status": "ERROR", "message": "Omise charge creation failed."}), 400

        # Step 3: จัดการ Order ใน DB (อัปเกรด draft หรือสร้างใหม่)
        self.order_statuses[charge.id] = "pending_payment"
        self.pending_orders[charge.id] = {
            "cart": cart,
            "machine_code": machine_code,
        }

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
                promotion_id=promotion_id,
                user_promotion_id=user_promotion_id,
            )

        if not persisted:
            logger.error(f"[Checkout] Failed to persist pending order for charge {charge.id}")
            return jsonify({"status": "ERROR", "message": "Failed to persist order"}), 500

        # Step 4: Response ตาม Omise status
        if charge.status == "successful":
            # บัตรเครดิตผ่านทันที
            logger.info(f"[Checkout] Payment SUCCESS for charge {charge.id}")
            self.order_statuses[charge.id] = "paid"
            self._handle_paid_order(charge.id, charge_obj=charge)
            return jsonify(
                {
                    "status": "paid",
                    "charge_id": charge.id,
                    "message": "Payment successful, dispensing...",
                }
            )

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
                success = self._handle_paid_order(charge_id, charge_obj=charge_obj)
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
        payment_method = data.get("payment_method", "credit_card")
        coupon_code = data.get("coupon_code") or data.get("couponCode")

        busy_resp = self._reject_if_machine_busy(machine_code)
        if busy_resp:
            return busy_resp

        cart = self._normalize_cart(raw_cart)

        if not self.inventory_service.check_stock(machine_code, cart):
            return jsonify({"status": "ERROR", "message": "One or more items are out of stock"}), 400

        pricing = self._resolve_pricing(machine_code, cart, coupon_code)
        if pricing is None:
            return jsonify({"status": "ERROR", "message": "Invalid or expired coupon"}), 400
        if pricing["final"] <= 0:
            return jsonify(
                {"status": "ERROR", "message": "Order total must be greater than zero"}
            ), 400

        total_price = pricing["final"]
        promotion_id = pricing["promotion_id"]
        user_promotion_id = pricing["user_promotion_id"]

        import uuid
        draft_id = f"draft_{uuid.uuid4().hex[:16]}"
        
        self.order_statuses[draft_id] = "pending_payment"
        self.pending_orders[draft_id] = {
            "cart": cart,
            "machine_code": machine_code,
        }
        
        persisted = self.inventory_service.create_pending_order(
            machine_code=machine_code,
            cart_items=cart,
            charge_id=draft_id,
            payment_method=payment_method,
            total_price=total_price,
            promotion_id=promotion_id,
            user_promotion_id=user_promotion_id,
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
        import os

        allow = os.environ.get("ALLOW_MOCK_PAY", "1").strip().lower() in (
            "1",
            "true",
            "yes",
        )
        flask_env = os.environ.get("FLASK_ENV", "").strip().lower()
        if flask_env == "production" or not allow:
            return jsonify(
                {
                    "error": "forbidden",
                    "message": "mock-pay is disabled in this environment",
                }
            ), 403

        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

        charge_id = data.get("charge_id")
        if not charge_id:
            return jsonify({"status": "ERROR", "message": "charge_id is required"}), 400

        if charge_id not in self.order_statuses:
            return jsonify({"status": "ERROR", "message": "Unknown charge_id"}), 404

        order = self.pending_orders.get(charge_id)
        machine_code = (order or {}).get("machine_code") or "MP1-001"
        busy_resp = self._reject_if_machine_busy(
            machine_code, exclude_charge_id=charge_id
        )
        if busy_resp:
            return busy_resp

        self.order_statuses[charge_id] = "paid"
        success = self._handle_paid_order(charge_id)

        if success:
            return jsonify({"status": "paid", "message": "Payment marked as successful, dispense triggered"}), 200
        else:
            return jsonify({"status": "paid", "message": "Payment marked as successful, but dispense had issues"}), 200

    @staticmethod
    def _qr_uri_from_omise_charge(charge) -> str | None:
        try:
            source = getattr(charge, "source", None)
            scannable = getattr(source, "scannable_code", None) if source else None
            if scannable and getattr(scannable, "image", None):
                return scannable.image.download_uri
        except Exception:
            pass
        return None

    def _order_payment_method(self, charge_id: str) -> str | None:
        try:
            from app.db_config.db import get_db

            db = get_db()
            cur = db.cursor(dictionary=True)
            try:
                cur.execute(
                    "SELECT payment_method FROM orders WHERE charge_id = %s",
                    (charge_id,),
                )
                row = cur.fetchone()
                return row["payment_method"] if row else None
            finally:
                cur.close()
                db.close()
        except Exception:
            return None

    def check_status(self, charge_id):
        """Poll Order Status — reconcile ก่อน; คืน qr_code สำหรับกู้หน้าจอหลังรีเฟรช"""
        db_status = self._get_db_status(charge_id)
        payload: dict = {"status": db_status or "unknown"}

        if db_status == "pending_payment":
            reconciled = self.reconcile_pending_charge(charge_id)
            db_status = self._get_db_status(charge_id) or reconciled
            payload["status"] = db_status
            if db_status == "pending_payment" and not str(charge_id).startswith("draft_"):
                try:
                    import omise
                    charge = omise.Charge.retrieve(charge_id)
                    qr_uri = self._qr_uri_from_omise_charge(charge)
                    if qr_uri:
                        payload["qr_code"] = qr_uri
                except Exception as e:
                    logger.error("[CheckStatus] QR recovery failed for %s: %s", charge_id, e)
            pm = self._order_payment_method(charge_id)
            if pm:
                payload["payment_method"] = pm

        return jsonify(payload)

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

buy_controller = BuyController(payment_service, inventory_service)
buy_api = buy_controller.blueprint