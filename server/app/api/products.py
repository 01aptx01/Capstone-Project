from flask import Blueprint, request, jsonify
from app.config.db import get_db

products_api = Blueprint("products_api", __name__)


@products_api.route("/api/products", methods=["GET"])
def get_products():
    """
    GET /api/products?machine_id=MP1-001
    Returns available products with stock for the given machine.
    Defaults to MP1-001 if no machine_id is provided.
    """
    machine_code = request.args.get("machine_id", "MP1-001")

    db = get_db()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.heating_time,
                p.image_url,
                COALESCE(s.quantity, 0) AS stock
            FROM products p
            LEFT JOIN stock s ON s.product_id = p.id
            LEFT JOIN machines m ON m.id = s.machine_id
            WHERE m.machine_code = %s OR s.machine_id IS NULL
            ORDER BY p.id
        """, (machine_code,))

        products = cur.fetchall()

        # Convert Decimal price to float for JSON serialization
        for product in products:
            product["price"] = float(product["price"])

        return jsonify(products), 200

    except Exception as e:
        print(f"[Products API] Error: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500

    finally:
        cur.close()
        db.close()
