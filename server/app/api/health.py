import os
import requests
import omise
from flask import Blueprint, jsonify
from app.db_config.db import get_db

class HealthController:
    def __init__(self, db_provider=None):
        """Initialize Health Controller"""
        self.get_db = db_provider or get_db
        
        # สร้าง Blueprint ภายในคลาส
        self.blueprint = Blueprint("health_api", __name__)
        self._register_routes()

    def _register_routes(self):
        """ลงทะเบียน Route สำหรับ Health Check"""
        self.blueprint.add_url_rule(
            "/api/health", 
            view_func=self.health_check, 
            methods=["GET"]
        )

    def _check_mysql(self) -> dict:
        """ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล"""
        try:
            db = self.get_db()
            db.ping(reconnect=True)
            db.close()
            return {"status": "CONNECTED"}
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

    def _check_omise(self) -> dict:
        """ตรวจสอบการเชื่อมต่อกับ Omise API"""
        try:
            omise.api_secret = os.environ.get("OMISE_SECRET_KEY")
            if not omise.api_secret:
                return {"status": "ERROR", "message": "OMISE_SECRET_KEY not set"}
            
            # Test connectivity by retrieving account info
            account = omise.Account.retrieve()
            return {
                "status": "CONNECTED",
                "mode": "test" if account.email.endswith("@omise.co") else "live"
            }
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

    def _check_hardware_agent(self) -> dict:
        """ตรวจสอบสถานะของ Hardware Agent"""
        agent_url = os.environ.get("AGENT_URL", "http://localhost:5000/dispense")
        try:
            base_agent_url = agent_url.rsplit('/', 1)[0]
            response = requests.get(base_agent_url, timeout=3)
            return {
                "status": "CONNECTED",
                "url": base_agent_url
            }
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

    def health_check(self):
        """System Health Check"""
        # รวบรวมผลการตรวจสอบจาก Private Methods
        components = {
            "mysql": self._check_mysql(),
            "omise": self._check_omise(),
            "hardware_agent": self._check_hardware_agent()
        }

        # ตรวจสอบว่ามี Component ไหนที่ Error หรือไม่
        is_degraded = any(comp.get("status") == "ERROR" for comp in components.values())

        health_status = {
            "status": "DEGRADED" if is_degraded else "OK",
            "components": components
        }

        # ถ้ามีระบบใดระบบหนึ่งร่วง ให้ตอบ 207 (Multi-Status / Degraded)
        status_code = 207 if is_degraded else 200
        return jsonify(health_status), status_code


# =============================================
# สร้าง Instance และนำ Blueprint ไปใช้งาน
# =============================================
health_controller = HealthController()
health_api = health_controller.blueprint