import logging
from app.config.db import get_db

# Configure logger
logger = logging.getLogger(__name__)


class InsufficientStockError(Exception):
    pass

class AlreadyClaimedError(Exception):
    """Raised when deduct_stock detects the charge was already processed (RC-6 guard)."""
    pass

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

    def create_pending_order(
        self,
        machine_code: str,
        cart_items: list,
        charge_id: str,
        payment_method: str,
        total_price: float,
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
                INSERT INTO orders (machine_code, charge_id, total_price, payment_method, payment_status, dispense_status)
                VALUES (%s, %s, %s, %s, 'pending', 'pending')
                """,
                (machine_code, charge_id, total_price, payment_method),
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
            # อัปเดต payment_status → 'paid' เฉพาะเมื่อยังเป็น 'pending' เท่านั้น
            # ถ้า rowcount == 0 แสดงว่า Thread อื่น (webhook หรือ poll) claim ไปแล้ว
            # → หยุดทันทีเพื่อป้องกัน Double Dispense
            if charge_id:
                cur.execute(
                    """
                    UPDATE orders
                    SET payment_status = 'paid'
                    WHERE charge_id = %s AND payment_status = 'pending'
                    """,
                    (charge_id,),
                )
                if cur.rowcount == 0:
                    # อาจถูก claim แล้ว หรือ charge_id ไม่มีอยู่
                    cur.execute(
                        "SELECT payment_status FROM orders WHERE charge_id = %s",
                        (charge_id,),
                    )
                    row = cur.fetchone()
                    if row and row["payment_status"] == "paid":
                        logger.warning(
                            f"⚠️ [InventoryService] deduct_stock: charge {charge_id} already claimed "
                            f"(Double Dispense prevented)"
                        )
                        db.rollback()
                        raise AlreadyClaimedError(charge_id)
                    else:
                        logger.error(
                            f"❌ [InventoryService] deduct_stock: charge {charge_id} not found or wrong state"
                        )
                        db.rollback()
                        return False
            # ──────────────────────────────────────────────────────────────────────

            for item in cart_items:
                product_id = int(item["product_id"])
                qty = int(item["quantity"])

                self._deduct_from_slots(cur, machine_code, product_id, qty)

            # เมื่อทุกอย่างผ่านเรียบร้อย ทำการยืนยันข้อมูล
            db.commit()
            logger.info(f"✅ [InventoryService] Stock deducted successfully for charge {charge_id}")
            return True

        except AlreadyClaimedError:
            # RC-6: อีก thread จัดการไปแล้ว ไม่ต้อง rollback เพิ่ม (ทำไปแล้วใน guard)
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


    def update_dispense_status(self, charge_id: str, dispense_status: str) -> None:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            cur.execute(
                """
                UPDATE orders
                SET dispense_status = %s
                WHERE charge_id = %s
                """,
                (dispense_status, charge_id),
            )
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] update_dispense_status error for charge {charge_id}: {e}")
        finally:
            cur.close()
            db.close()