import logging
from app.db_config.db import get_db

# Configure logger
logger = logging.getLogger(__name__)


class InsufficientStockError(Exception):
    pass

class AlreadyClaimedError(Exception):
    """Raised when deduct_stock detects the charge was already processed (RC-6 guard)."""
    pass


# สอดคล้อง Omise QR expires_at (5 นาที) + kiosk payment countdown
PENDING_PAYMENT_BUSY_MINUTES = 5
# paid/dispensing ค้างเกินนี้ → sweeper ตั้ง dispense_failed (ปลดล็อก kiosk)
PAID_DISPENSE_STALE_MINUTES = 45

class InventoryService:
    def __init__(self, db_provider=None):
        self.get_db = db_provider or get_db

    def _ensure_machine_exists(self, cursor, machine_code: str) -> bool:
        cursor.execute(
            "SELECT machine_code FROM machines WHERE machine_code = %s",
            (machine_code,),
        )
        return cursor.fetchone() is not None

    def _get_product_price(self, cursor, product_id: int) -> float:
        cursor.execute("SELECT price FROM products WHERE product_id = %s", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Unknown product_id: {product_id}")
        return float(row["price"])

    def _deduct_from_slots(self, cursor, machine_code: str, product_id: int, quantity: int):
        cursor.execute(
            """
            SELECT id, quantity
            FROM machine_slots
            WHERE machine_code = %s AND product_id = %s AND quantity > 0
            ORDER BY slot_number
            FOR UPDATE
            """,
            (machine_code, product_id),
        )
        slots = cursor.fetchall()

        remaining = quantity
        for slot in slots:
            if remaining <= 0:
                break

            available = int(slot["quantity"])
            take = min(available, remaining)

            cursor.execute(
                """
                UPDATE machine_slots
                SET quantity = quantity - %s
                WHERE id = %s AND quantity >= %s
                """,
                (take, slot["id"], take),
            )

            if cursor.rowcount == 0:
                raise InsufficientStockError(
                    f"Slot deduction failed for machine_code={machine_code}, product_id={product_id}"
                )

            remaining -= take

        if remaining > 0:
            raise InsufficientStockError(
                f"Insufficient stock for machine_code={machine_code}, product_id={product_id} (need {quantity}, missing {remaining})"
            )

    def check_stock(self, machine_code: str, cart_items: list) -> bool:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            if not self._ensure_machine_exists(cur, machine_code):
                logger.error(f"❌ [InventoryService] check_stock: Machine {machine_code} not found")
                return False

            for item in cart_items:
                product_id = item["product_id"]
                qty = item["quantity"]

                cur.execute(
                    """
                    SELECT COALESCE(SUM(quantity), 0) AS quantity
                    FROM machine_slots
                    WHERE machine_code = %s AND product_id = %s
                    """,
                    (machine_code, product_id),
                )

                stock = cur.fetchone()
                if not stock or int(stock["quantity"]) < int(qty):
                    logger.warning(f"⚠️ [InventoryService] Product {product_id} is out of stock or low (Needed: {qty})")
                    return False

            logger.info(f"✅ [InventoryService] check_stock: All items in stock for machine {machine_code}")
            return True

        except Exception as e:
            logger.error(f"❌ [InventoryService] check_stock error: {e}")
            return False

        finally:
            cur.close()
            db.close()

    def enrich_cart_items(self, cart_items: list) -> list:
        """Attach heating_time and name from products for hardware dispatch."""
        if not cart_items:
            return []
        product_ids = [int(it["product_id"]) for it in cart_items if it.get("product_id") is not None]
        if not product_ids:
            return list(cart_items)

        db = self.get_db()
        cur = db.cursor(dictionary=True)
        meta: dict = {}
        try:
            placeholders = ",".join(["%s"] * len(product_ids))
            cur.execute(
                f"""
                SELECT product_id, heating_time, name
                FROM products
                WHERE product_id IN ({placeholders})
                """,
                tuple(product_ids),
            )
            for row in cur.fetchall() or []:
                meta[int(row["product_id"])] = row
        finally:
            cur.close()
            db.close()

        enriched: list = []
        for it in cart_items:
            pid = int(it["product_id"])
            row = meta.get(pid) or {}
            enriched.append(
                {
                    "product_id": pid,
                    "quantity": int(it["quantity"]),
                    "heating_time": int(row.get("heating_time") or it.get("heating_time") or 15),
                    "name": row.get("name") or it.get("name"),
                }
            )
        return enriched

    def compute_cart_subtotal(self, machine_code: str, cart_items: list) -> float:
        """Sum catalog prices × qty for cart lines (THB, 2 decimals)."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            if not self._ensure_machine_exists(cur, machine_code):
                logger.error(
                    f"❌ [InventoryService] compute_cart_subtotal: Machine {machine_code} not found"
                )
                return 0.0
            total = 0.0
            for item in cart_items:
                product_id = int(item["product_id"])
                qty = int(item["quantity"])
                price = self._get_product_price(cur, product_id)
                total += price * qty
            return round(total, 2)
        except Exception as e:
            logger.error(f"❌ [InventoryService] compute_cart_subtotal error: {e}")
            return 0.0
        finally:
            cur.close()
            db.close()

    def create_pending_order(
        self,
        machine_code: str,
        cart_items: list,
        charge_id: str,
        payment_method: str,
        total_price: float,
        promotion_id: int | None = None,
        user_promotion_id: int | None = None,
    ) -> bool:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            db.start_transaction()

            if not self._ensure_machine_exists(cur, machine_code):
                logger.error(f"❌ [InventoryService] create_pending_order: Machine {machine_code} not found")
                db.rollback()
                return False

            cur.execute(
                """
                INSERT INTO orders (machine_code, charge_id, total_price, payment_method, status, promotion_id, user_promotion_id)
                VALUES (%s, %s, %s, %s, 'pending_payment', %s, %s)
                """,
                (machine_code, charge_id, total_price, payment_method, promotion_id, user_promotion_id),
            )
            order_id = cur.lastrowid

            for item in cart_items:
                product_id = int(item["product_id"])
                qty = int(item["quantity"])
                price = self._get_product_price(cur, product_id)
                cur.execute(
                    """
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (order_id, product_id, qty, price),
                )

            db.commit()
            logger.info(f"✅ [InventoryService] Pending order created for charge {charge_id} (order_id={order_id})")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] create_pending_order error for charge {charge_id}: {e}")
            return False

        finally:
            cur.close()
            db.close()

    def get_order_totals_by_charge_id(self, charge_id: str) -> dict | None:
        """Return { total_price: float, promotion_id: int|None } for a pending order, or None."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT total_price, promotion_id
                FROM orders
                WHERE charge_id = %s AND status = 'pending_payment'
                """,
                (charge_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            pid = row.get("promotion_id")
            return {
                "total_price": float(row["total_price"]),
                "promotion_id": int(pid) if pid is not None else None,
            }
        finally:
            cur.close()
            db.close()

    def get_order_details_by_charge_id(self, charge_id: str) -> dict | None:
        """Return { machine_code, cart: [{product_id, quantity}] } for dispense recovery."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT order_id, machine_code
                FROM orders
                WHERE charge_id = %s
                """,
                (charge_id,),
            )
            order = cur.fetchone()
            if not order:
                return None
            cur.execute(
                """
                SELECT product_id, quantity
                FROM order_items
                WHERE order_id = %s
                """,
                (order["order_id"],),
            )
            items = cur.fetchall()
            cart = [
                {"product_id": int(it["product_id"]), "quantity": int(it["quantity"])}
                for it in items
            ]
            return {"machine_code": order["machine_code"], "cart": cart}
        finally:
            cur.close()
            db.close()

    def upgrade_draft_order(self, draft_id: str, real_charge_id: str, payment_method: str) -> bool:
        """เปลี่ยน Draft Order (ที่เพิ่งรอแตะบัตร) ให้มี charge_id จริงหลังจากชำระแล้ว"""
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            cur.execute(
                """
                UPDATE orders
                SET charge_id = %s, payment_method = %s
                WHERE charge_id = %s AND status = 'pending_payment'
                """,
                (real_charge_id, payment_method, draft_id),
            )
            db.commit()
            if cur.rowcount == 0:
                logger.warning(f"⚠️ [InventoryService] Cannot upgrade draft {draft_id} — not found or wrong status")
                return False
            logger.info(f"✅ [InventoryService] Upgraded draft {draft_id} to real charge {real_charge_id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] upgrade_draft_order error: {e}")
            return False
        finally:
            cur.close()
            db.close()

    def deduct_stock(self, machine_code: str, cart_items: list, charge_id: str = None) -> bool:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            db.start_transaction()

            if not self._ensure_machine_exists(cur, machine_code):
                logger.error(f"❌ [InventoryService] deduct_stock: Machine {machine_code} not found")
                db.rollback()
                return False

            # ─── RC-6 Guard: Atomic "claim" ───────────────────────────────────────
            # อัปเดต status → 'paid' เฉพาะเมื่อยังเป็น 'pending_payment' เท่านั้น
            # ถ้า rowcount == 0 แสดงว่า Thread อื่น (webhook หรือ poll) claim ไปแล้ว
            # → หยุดทันทีเพื่อป้องกัน Double Dispense
            if charge_id:
                cur.execute(
                    """
                    UPDATE orders
                    SET status = 'paid'
                    WHERE charge_id = %s AND status = 'pending_payment'
                    """,
                    (charge_id,),
                )
                if cur.rowcount == 0:
                    cur.execute(
                        "SELECT status FROM orders WHERE charge_id = %s",
                        (charge_id,),
                    )
                    row = cur.fetchone()
                    if row and row["status"] in ("paid", "dispensing", "completed"):
                        logger.warning(
                            f"⚠️ [InventoryService] deduct_stock: charge {charge_id} already claimed "
                            f"(Double Dispense prevented)"
                        )
                        db.rollback()
                        raise AlreadyClaimedError(charge_id)
                    else:
                        logger.error(
                            f"❌ [InventoryService] deduct_stock: charge {charge_id} not found or wrong state "
                            f"(current: {row['status'] if row else 'NOT FOUND'})"
                        )
                        db.rollback()
                        return False
            # ──────────────────────────────────────────────────────────────────────

            for item in cart_items:
                product_id = int(item["product_id"])
                qty = int(item["quantity"])
                self._deduct_from_slots(cur, machine_code, product_id, qty)

            db.commit()
            logger.info(f"✅ [InventoryService] Stock deducted successfully for charge {charge_id}")
            return True

        except AlreadyClaimedError:
            # RC-6: อีก thread จัดการไปแล้ว (rollback ทำใน guard แล้ว)
            raise

        except InsufficientStockError as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] deduct_stock insufficient for charge {charge_id}: {e}")
            raise  # re-raise ให้ caller จัดการ refund

        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] deduct_stock error for charge {charge_id}: {e}")
            return False

        finally:
            cur.close()
            db.close()

    def update_order_status(self, charge_id: str, status: str) -> None:
        """อัปเดต status ของออเดอร์ตาม Unified State Machine

        Valid statuses:
          pending_payment | cancelled | payment_failed | paid |
          dispensing | completed | dispense_failed | refunded
        """
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            cur.execute(
                """
                UPDATE orders
                SET status = %s
                WHERE charge_id = %s
                """,
                (status, charge_id),
            )
            
            # If successfully paid or being dispensed/completed, mark the user's specific coupon as 'used'!
            if status in ("paid", "dispensing", "completed"):
                cur.execute(
                    """
                    UPDATE user_promotions up
                    JOIN orders o ON o.user_promotion_id = up.id
                    SET up.status = 'used'
                    WHERE o.charge_id = %s AND up.status = 'active'
                    """,
                    (charge_id,),
                )
                
            db.commit()
            logger.info(f"✅ [InventoryService] Order {charge_id} → status='{status}'")
        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] update_order_status error for charge {charge_id}: {e}")
        finally:
            cur.close()
            db.close()

    def cancel_order(self, charge_id: str) -> bool:
        """ยกเลิกออเดอร์ — ใช้ได้เฉพาะตอนยังรอจ่ายเงิน (pending_payment)
        
        Returns True ถ้ายกเลิกสำเร็จ, False ถ้าออเดอร์อยู่ในสถานะที่ยกเลิกไม่ได้
        """
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            cur.execute(
                """
                UPDATE orders
                SET status = 'cancelled'
                WHERE charge_id = %s AND status = 'pending_payment'
                """,
                (charge_id,),
            )
            db.commit()
            if cur.rowcount == 0:
                cur.execute("SELECT status FROM orders WHERE charge_id = %s", (charge_id,))
                row = cur.fetchone()
                current = row["status"] if row else "NOT FOUND"
                logger.warning(
                    f"⚠️ [InventoryService] Cannot cancel charge {charge_id} — current status: '{current}'"
                )
                return False
            logger.info(f"✅ [InventoryService] Order {charge_id} cancelled")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] cancel_order error for charge {charge_id}: {e}")
            return False
        finally:
            cur.close()
            db.close()

    def get_order_age_minutes(self, charge_id: str) -> int | None:
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS age_min
                FROM orders
                WHERE charge_id = %s
                """,
                (charge_id,),
            )
            row = cur.fetchone()
            if not row or row.get("age_min") is None:
                return None
            return int(row["age_min"])
        finally:
            cur.close()
            db.close()

    def get_order_context_for_charge(self, charge_id: str) -> dict | None:
        """คืน { machine_code, cart: [{product_id, quantity}] } จาก DB สำหรับกู้ dispense หลังรีสตาร์ท."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT order_id, machine_code
                FROM orders
                WHERE charge_id = %s
                """,
                (charge_id,),
            )
            order = cur.fetchone()
            if not order:
                return None
            cur.execute(
                """
                SELECT product_id, quantity
                FROM order_items
                WHERE order_id = %s
                """,
                (order["order_id"],),
            )
            items = cur.fetchall() or []
            if not items:
                return None
            cart = [
                {"product_id": int(i["product_id"]), "quantity": int(i["quantity"])}
                for i in items
            ]
            return {"machine_code": order["machine_code"], "cart": cart}
        finally:
            cur.close()
            db.close()

    def list_pending_payment_orders(
        self, machine_code: str | None = None
    ) -> list[dict]:
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            if machine_code:
                cur.execute(
                    """
                    SELECT charge_id, machine_code, status, created_at
                    FROM orders
                    WHERE machine_code = %s AND status = 'pending_payment'
                    ORDER BY created_at DESC
                    """,
                    (machine_code,),
                )
            else:
                cur.execute(
                    """
                    SELECT charge_id, machine_code, status, created_at
                    FROM orders
                    WHERE status = 'pending_payment'
                    ORDER BY created_at DESC
                    """
                )
            return list(cur.fetchall() or [])
        finally:
            cur.close()
            db.close()

    def list_stale_pending_charge_ids(self) -> list[str]:
        """pending_payment เกิน TTL — สำหรับ background sweeper."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT charge_id
                FROM orders
                WHERE status = 'pending_payment'
                  AND created_at < DATE_SUB(NOW(), INTERVAL %s MINUTE)
                """,
                (PENDING_PAYMENT_BUSY_MINUTES,),
            )
            return [str(r["charge_id"]) for r in (cur.fetchall() or []) if r.get("charge_id")]
        finally:
            cur.close()
            db.close()

    def reconcile_pending_orders_for_machine(self, machine_code: str) -> int:
        """เรียก Omise reconcile ก่อนตัดสิน busy — lazy import หลีก circular."""
        from app.api.buy import buy_controller

        changed = 0
        for row in self.list_pending_payment_orders(machine_code):
            cid = row.get("charge_id")
            if not cid:
                continue
            before = row.get("status")
            after = buy_controller.reconcile_pending_charge(str(cid))
            if after != before:
                changed += 1
        return changed

    def get_blocking_order(
        self, machine_code: str, exclude_charge_id: str | None = None
    ) -> dict | None:
        """ออเดอร์ที่ยังไม่ควรเปิดซื้อใหม่บนตู้นี้ (หลัง reconcile pending แล้ว)."""
        self.reconcile_pending_orders_for_machine(machine_code)
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT charge_id, status, created_at
                FROM orders
                WHERE machine_code = %s
                  AND (
                    status IN ('paid', 'dispensing')
                    OR (
                      status = 'pending_payment'
                      AND created_at >= DATE_SUB(NOW(), INTERVAL %s MINUTE)
                    )
                  )
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (machine_code, PENDING_PAYMENT_BUSY_MINUTES),
            )
            row = cur.fetchone()
            if row and exclude_charge_id and row.get("charge_id") == exclude_charge_id:
                return None
            return row
        finally:
            cur.close()
            db.close()

    def fail_stale_paid_orders(self) -> list[str]:
        """Mark stuck paid/dispensing orders as dispense_failed; return charge_ids updated."""
        db = self.get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT charge_id
                FROM orders
                WHERE status IN ('paid', 'dispensing')
                  AND updated_at < DATE_SUB(NOW(), INTERVAL %s MINUTE)
                  AND charge_id IS NOT NULL
                """,
                (PAID_DISPENSE_STALE_MINUTES,),
            )
            rows = list(cur.fetchall() or [])
            charge_ids = [str(r["charge_id"]) for r in rows if r.get("charge_id")]
            if not charge_ids:
                return []
            for cid in charge_ids:
                cur.execute(
                    """
                    UPDATE orders
                    SET status = 'dispense_failed'
                    WHERE charge_id = %s AND status IN ('paid', 'dispensing')
                    """,
                    (cid,),
                )
            db.commit()
            logger.warning(
                "[InventoryService] Stale paid/dispensing → dispense_failed: %s",
                charge_ids,
            )
            return charge_ids
        except Exception as e:
            db.rollback()
            logger.error("[InventoryService] fail_stale_paid_orders error: %s", e)
            return []
        finally:
            cur.close()
            db.close()