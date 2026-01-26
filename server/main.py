from flask import Flask, request
import mysql.connector
import os

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

@app.route("/health")
def health():
    return {"status": "server-ok"}

@app.route("/api/buy", methods=["POST"])
def buy():
    data = request.json
    machine_id = data["machine_id"]
    product_id = data["product_id"]

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        UPDATE stock
        SET quantity = quantity - 1
        WHERE machine_id=%s AND product_id=%s AND quantity > 0
    """, (machine_id, product_id))

    if cur.rowcount == 0:
        return {"status": "OUT_OF_STOCK"}, 400

    cur.execute("""
        INSERT INTO transactions (machine_id, product_id)
        VALUES (%s, %s)
    """, (machine_id, product_id))

    db.commit()
    return {"status": "OK", "slot": 1}

app.run(host="0.0.0.0", port=8000)