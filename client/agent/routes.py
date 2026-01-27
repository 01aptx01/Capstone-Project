from flask import Blueprint

routes = Blueprint("routes", __name__)

@routes.route("/dispense/<int:slot>")
def dispense(slot):
    print(f"Dispensing slot {slot}")
    return {"status": "dispensed", "slot": slot}