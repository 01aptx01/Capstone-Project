import logging
from app.config.db import get_db

# Configure logger
logger = logging.getLogger(__name__)

class InventoryService:
    def __init__(self, db_provider=None):
        self.get_db = db_provider or get_db

    def _get_machine_id(self, cursor, machine_code: str):
        cursor.execute("SELECT id FROM machines WHERE machine_code = %s", (machine_code,))
        machine = cursor.fetchone()
        return machine["id"] if machine else None

    def check_stock(self, machine_code: str, cart_items: list) -> bool:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            machine_id = self._get_machine_id(cur, machine_code)
            if not machine_id:
                logger.error(f"❌ [InventoryService] check_stock: Machine {machine_code} not found")
                return False

            for item in cart_items:
                product_id = item["id"]
                qty = item["qty"]

                cur.execute("""
                    SELECT quantity FROM stock 
                    WHERE machine_id = %s AND product_id = %s
                """, (machine_id, product_id))
                
                stock = cur.fetchone()
                if not stock or stock["quantity"] < qty:
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

    def deduct_stock(self, machine_code: str, cart_items: list, charge_id: str = None) -> bool:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            machine_id = self._get_machine_id(cur, machine_code)
            if not machine_id:
                logger.error(f"❌ [InventoryService] deduct_stock: Machine {machine_code} not found")
                return False

            for item in cart_items:
                product_id = item["id"]
                qty = item["qty"]

                # Deduct stock (ใช้เงื่อนไข quantity >= %s เพื่อป้องกันสต๊อกติดลบระดับ Database)
                cur.execute("""
                    UPDATE stock
                    SET quantity = quantity - %s
                    WHERE machine_id = %s AND product_id = %s AND quantity >= %s
                """, (qty, machine_id, product_id, qty))

                # ถ้าตัดสต๊อกไม่สำเร็จ (เช่น จำนวนไม่พอ) ให้ Rollback ทันที
                if cur.rowcount == 0:
                    logger.error(f"❌ [InventoryService] Insufficient stock for product {product_id} in machine {machine_id}")
                    db.rollback()
                    return False

                # Record transaction
                cur.execute("""
                    INSERT INTO transactions (machine_id, product_id, quantity, charge_id)
                    VALUES (%s, %s, %s, %s)
                """, (machine_id, product_id, qty, charge_id))

            # เมื่อทุกอย่างผ่านเรียบร้อย ทำการยืนยันข้อมูล
            db.commit()
            logger.info(f"✅ [InventoryService] Stock deducted successfully for charge {charge_id}")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"❌ [InventoryService] deduct_stock error for charge {charge_id}: {e}")
            return False

        finally:
            cur.close()
            db.close()