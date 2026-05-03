import logging
from flask import Blueprint, request, jsonify
from app.config.db import get_db

# Configure logger
logger = logging.getLogger(__name__)

# =============================================
# SERVICE LAYER
# =============================================
class ProductService:
    def __init__(self, db_provider=None):
        self.get_db = db_provider or get_db

    def get_products_by_machine(self, machine_code: str) -> list:
        db = self.get_db()
        cur = db.cursor(dictionary=True)

        try:
            cur.execute(
                """
                SELECT
                    p.product_id,
                    p.name,
                    p.description,
                    p.price,
                    p.heating_time,
                    p.image_url,
                    p.category,
                    COALESCE(SUM(ms.quantity), 0) AS stock
                FROM products p
                LEFT JOIN machine_slots ms
                    ON ms.machine_code = %s
                    AND ms.product_id = p.product_id
                GROUP BY
                    p.product_id,
                    p.name,
                    p.description,
                    p.price,
                    p.heating_time,
                    p.image_url,
                    p.category
                ORDER BY p.product_id
                """,
                (machine_code,),
            )

            products = cur.fetchall()

            # Convert Decimal price to float for JSON serialization
            for product in products:
                product["price"] = float(product["price"])

            return products

        except Exception as e:
            logger.error(f"❌ [ProductService] Database Error: {e}")
            raise e

        finally:
            cur.close()
            db.close()

# =============================================
# CONTROLLER LAYER
# =============================================
class ProductController:
    def __init__(self, product_service: ProductService):
        self.product_service = product_service
        self.blueprint = Blueprint("products_api", __name__)
        self._register_routes()

    def _register_routes(self):
        self.blueprint.add_url_rule(
            "/api/products", 
            view_func=self.get_products, 
            methods=["GET"]
        )

    def get_products(self):
        """List available products with stock"""
        machine_code = request.args.get("machine_code") or request.args.get("machine_id", "MP1-001")
        logger.info(f"[ProductController] Fetching products for machine: {machine_code}")

        try:
            products = self.product_service.get_products_by_machine(machine_code)
            return jsonify(products), 200

        except Exception as e:
            logger.error(f"❌ [ProductController] Failed to fetch products: {e}")
            return jsonify({"error": "Failed to fetch products"}), 500


# =============================================
# สร้าง Instance และนำ Blueprint ไปใช้งาน
# =============================================
product_service = ProductService()
product_controller = ProductController(product_service)
products_api = product_controller.blueprint