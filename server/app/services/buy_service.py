from app.config.db import get_db

def buy_product(machine_id, product_id):
    db = get_db()
    cur = db.cursor()

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