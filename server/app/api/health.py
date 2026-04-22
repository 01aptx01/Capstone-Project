from flask import Blueprint, jsonify
import os
import requests
import mysql.connector
import omise
from app.config.db import get_db

health_api = Blueprint("health_api", __name__)

@health_api.route("/api/health", methods=["GET"])
def health_check():
    """
    System Health Check
    ---
    tags:
      - System
    responses:
      200:
        description: System is healthy
      207:
        description: System is degraded
    """
    health_status = {
        "status": "OK",
        "components": {
            "mysql": {"status": "UNKNOWN"},
            "omise": {"status": "UNKNOWN"},
            "hardware_agent": {"status": "UNKNOWN"}
        }
    }

    # 1. Check MySQL
    try:
        db = get_db()
        db.ping(reconnect=True)
        db.close()
        health_status["components"]["mysql"]["status"] = "CONNECTED"
    except Exception as e:
        health_status["status"] = "DEGRADED"
        health_status["components"]["mysql"] = {"status": "ERROR", "message": str(e)}

    # 2. Check Omise API
    try:
        omise.api_secret = os.environ.get("OMISE_SECRET_KEY")
        if not omise.api_secret:
            raise Exception("OMISE_SECRET_KEY not set")
        
        # Test connectivity by retrieving account info
        account = omise.Account.retrieve()
        health_status["components"]["omise"] = {
            "status": "CONNECTED",
            "mode": "test" if account.email.endswith("@omise.co") else "live"
        }
    except Exception as e:
        health_status["status"] = "DEGRADED"
        health_status["components"]["omise"] = {"status": "ERROR", "message": str(e)}

    # 3. Check Hardware Agent
    agent_url = os.environ.get("AGENT_URL", "http://localhost:5000/dispense")
    # We'll ping the root of the agent if it has a health route, or just check connectivity
    # For now, let's assume the agent has a root route or we just check if it's reachable
    try:
        # Get the base URL from the dispense URL
        base_agent_url = agent_url.rsplit('/', 1)[0]
        response = requests.get(base_agent_url, timeout=3)
        health_status["components"]["hardware_agent"] = {
            "status": "CONNECTED",
            "url": base_agent_url
        }
    except Exception as e:
        health_status["status"] = "DEGRADED"
        health_status["components"]["hardware_agent"] = {"status": "ERROR", "message": str(e)}

    return jsonify(health_status), 200 if health_status["status"] == "OK" else 207
