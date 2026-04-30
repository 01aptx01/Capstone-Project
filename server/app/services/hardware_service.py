import os
import requests
import logging

# Configure logger
logger = logging.getLogger(__name__)

class HardwareAgentService:
    def __init__(self, agent_url: str = None, timeout: int = 10):
        self.agent_url = agent_url or os.environ.get("AGENT_URL", "http://localhost:5000/dispense")
        self.timeout = timeout

    def notify_dispense(self, machine_code: str, cart_items: list) -> bool:
        payload = {
            "machine_id": machine_code,
            "items": cart_items
        }
        
        logger.info(f"[HardwareAgent] Notifying hardware agent at {self.agent_url} with payload: {payload}")
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