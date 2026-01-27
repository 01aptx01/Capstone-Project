from flask import Blueprint, request
from app.services.buy_service import buy_product

buy_api = Blueprint("buy_api", __name__)

@buy_api.route("/api/buy", methods=["POST"])
def buy():
    data = request.json

    success = buy_product(
        data["machine_id"],
        data["product_id"]
    )

    if not success:
        return {"status": "OUT_OF_STOCK"}, 400

    return {"status": "OK", "slot": 1}