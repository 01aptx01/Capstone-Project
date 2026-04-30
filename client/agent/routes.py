import logging
from flask import Blueprint, request

routes = Blueprint("routes", __name__)
logger = logging.getLogger(__name__)

@routes.route("/dispense", methods=["POST"])
def dispense():
    data = request.json
    machine_id = data.get("machine_id")
    items = data.get("items", [])
    
    logger.info(f"[Agent] Received dispense request for machine {machine_id}")
    logger.info(f"[Agent] Items to dispense: {items}")
    
    # Mock GPIO logic
    success = True # In a real Pi, this would be try-except around GPIO calls
    
    if success:
        logger.info(f"✅ [Agent] Successfully triggered GPIO for all items")
        return {"status": "success", "message": "All items dispensed"}, 200
    else:
        logger.error(f"❌ [Agent] GPIO Failure during dispense")
        return {"status": "error", "message": "Hardware failure"}, 500

@routes.route("/")
def index():
    return {"status": "agent-online", "version": "1.0.0"}