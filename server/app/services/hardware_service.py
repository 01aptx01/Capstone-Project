import os
import requests
import logging

# Configure logger
logger = logging.getLogger(__name__)

class HardwareAgentService:
    def __init__(self, agent_url: str = None, timeout: int = 10):
        self.agent_url = agent_url or os.environ.get("AGENT_URL", "http://localhost:5000/dispense")
        self.timeout = timeout

    def _get_agent_base_url(self) -> str:
        base = os.environ.get("AGENT_BASE_URL")
        if base:
            return base.rstrip("/")

        url = (self.agent_url or "").rstrip("/")
        for suffix in ("/dispense", "/jobs/start"):
            if url.endswith(suffix):
                return url[: -len(suffix)]
        return url

    def start_job(self, machine_code: str, cart_items: list, job_id: str = None, order_charge_id: str = None) -> str | None:
        base_url = self._get_agent_base_url()
        if not base_url:
            return None

        payload = {
            "machine_code": machine_code,
            "items": cart_items,
        }
        if job_id:
            payload["job_id"] = job_id
        if order_charge_id:
            payload["order_charge_id"] = order_charge_id

        jobs_start_url = f"{base_url}/jobs/start"
        logger.info(f"[HardwareAgent] Starting job at {jobs_start_url} with payload: {payload}")

        try:
            response = requests.post(jobs_start_url, json=payload, timeout=self.timeout)
            if response.status_code == 200:
                data = response.json() if response.headers.get("Content-Type", "").startswith("application/json") else {}
                return data.get("job_id") or job_id
            else:
                logger.error(f"❌ [HardwareAgent] /jobs/start returned {response.status_code}: {response.text}")
                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ [HardwareAgent] /jobs/start request failed: {e}")
            return None

    def notify_dispense(self, machine_code: str, cart_items: list, charge_id: str = None) -> bool:
        """Start a hardware job; fallback to legacy /dispense if needed."""

        job_id = self.start_job(
            machine_code=machine_code,
            cart_items=cart_items,
            job_id=charge_id,
            order_charge_id=charge_id,
        )
        if job_id:
            return True

        payload = {"machine_code": machine_code, "items": cart_items}
        logger.info(f"[HardwareAgent] Falling back to legacy dispense at {self.agent_url} with payload: {payload}")
        return self._send_request(payload)

    def _send_request(self, payload: dict) -> bool:
        try:
            response = requests.post(
                self.agent_url,
                json=payload,
                timeout=self.timeout
            )

            if response.status_code == 200:
                logger.info(f"✅ [HardwareAgent] Acknowledged dispense: {response.json()}")
                return True
            else:
                logger.error(f"❌ [HardwareAgent] Returned status {response.status_code}: {response.text}")
                return False

        except requests.exceptions.ConnectionError:
            logger.error(f"❌ [HardwareAgent] Cannot connect to hardware agent at {self.agent_url}")
            return False

        except requests.exceptions.Timeout:
            logger.error(f"❌ [HardwareAgent] Request timed out ({self.agent_url}) after {self.timeout} seconds")
            return False

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ [HardwareAgent] Request failed: {e}")
            return False