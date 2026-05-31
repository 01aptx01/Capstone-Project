import os
import logging
import requests

logger = logging.getLogger(__name__)


class HardwareAgentService:
    """Health-check helper for Pi agent (dispatch ใช้ Socket.IO เท่านั้น)."""

    def __init__(self, timeout: int = 3):
        self.timeout = timeout

    @staticmethod
    def agent_base_url() -> str:
        base = (os.environ.get("AGENT_BASE_URL") or "").strip().rstrip("/")
        return base or "http://localhost:5000"

    def ping_health(self) -> dict:
        base = self.agent_base_url()
        try:
            response = requests.get(f"{base}/health", timeout=self.timeout)
            if response.status_code == 200:
                detail = response.json() if response.headers.get("Content-Type", "").startswith("application/json") else {}
                return {"status": "CONNECTED", "url": base, "detail": detail}
            return {"status": "ERROR", "url": base, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "ERROR", "url": base, "message": str(e)}
