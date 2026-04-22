import os
import requests
from app.config.db import get_db

# Hardware Agent URL (configurable via environment variable)
AGENT_URL = os.environ.get("AGENT_URL", "http://localhost:5001/dispense")


def buy_product(machine_id, product_id):
    """Legacy single-product purchase: deduct stock and record transaction."""
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute("""
            UPDATE stock
            SET quantity = quantity - 1
            WHERE machine_id=%s AND product_id=%s AND quantity > 0
        """, (machine_id, product_id))

        if cur.rowcount == 0:
            return False

        cur.execute("""
            INSERT INTO transactions (machine_id, product_id)
            VALUES (%s, %s)
        """, (machine_id, product_id))

        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print(f"[BuyService] buy_product error: {e}")
        return False

    finally:
        cur.close()
        db.close()


def deduct_stock(machine_code, cart_items, charge_id=None):
    """
    Deduct stock quantities for all items in a cart.
    cart_items: list of dicts, e.g. [{"id": 1, "qty": 2}, {"id": 3, "qty": 1}]
    machine_code: string like 'MP1-001'
    Returns True if all items were deducted successfully.
    """
    db = get_db()
    cur = db.cursor(dictionary=True)

    try:
        # Resolve machine_id from machine_code
        cur.execute("SELECT id FROM machines WHERE machine_code = %s", (machine_code,))
        machine = cur.fetchone()

        if not machine:
            print(f"[BuyService] Machine not found: {machine_code}")
            return False

        machine_id = machine["id"]

        for item in cart_items:
            product_id = item["id"]
            qty = item["qty"]

            # Deduct stock
            cur.execute("""
                UPDATE stock
                SET quantity = quantity - %s
                WHERE machine_id = %s AND product_id = %s AND quantity >= %s
            """, (qty, machine_id, product_id, qty))

            if cur.rowcount == 0:
                print(f"[BuyService] Insufficient stock for product {product_id}")
                db.rollback()
                return False

            # Record transaction
            cur.execute("""
                INSERT INTO transactions (machine_id, product_id, quantity, charge_id)
                VALUES (%s, %s, %s, %s)
            """, (machine_id, product_id, qty, charge_id))

        db.commit()
        print(f"[BuyService] Stock deducted successfully for charge {charge_id}")
        return True

    except Exception as e:
        db.rollback()
        print(f"[BuyService] deduct_stock error: {e}")
        return False

    finally:
        cur.close()
        db.close()


def notify_hardware_agent(cart_items, machine_code):
    """
    Send an HTTP POST to the Hardware Agent to physically dispense items.
    Handles timeouts and connection errors gracefully.
    """
    payload = {
        "machine_id": machine_code,
        "items": cart_items
    }

    try:
        response = requests.post(
            AGENT_URL,
            json=payload,
            timeout=10  # 10 second timeout
        )

        if response.status_code == 200:
            print(f"[BuyService] Hardware agent acknowledged dispense: {response.json()}")
            return True
        else:
            print(f"[BuyService] Hardware agent returned status {response.status_code}: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"[BuyService] Cannot connect to hardware agent at {AGENT_URL}")
        return False

    except requests.exceptions.Timeout:
        print(f"[BuyService] Hardware agent request timed out ({AGENT_URL})")
        return False

    except requests.exceptions.RequestException as e:
        print(f"[BuyService] Hardware agent request failed: {e}")
        return False