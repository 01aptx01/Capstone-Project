import logging
import os
import threading
import time
from typing import Any, Dict, Optional

import socketio
from socketio.exceptions import ConnectionRefusedError

from env_config import machine_code as _machine_code_from_env
from env_config import machine_token as _machine_token_from_env
from env_config import server_socket_url as _server_url_from_env
from ws_outbox import get_pending, mark_sent

logger = logging.getLogger(__name__)


def _server_url() -> Optional[str]:
    return _server_url_from_env()

def _machine_token_from_env() -> str:
    return _machine_token_from_env()

def _socketio_auth(machine_code: str, token: str) -> Dict[str, Any]:
    return {"machine_code": machine_code, "token": token}

class AgentSocketClient:
    def __init__(self) -> None:
        self._machine_code = ""
        self._sio = socketio.Client(
            reconnection=True,
            reconnection_attempts=0,
            reconnection_delay=1,
            reconnection_delay_max=10,
            logger=False,
            engineio_logger=False,
        )
        self._lock = threading.Lock()
        self._connected = False

        self._register_handlers()

    def _register_handlers(self) -> None:
        @self._sio.event
        def connect():
            with self._lock:
                self._connected = True
            logger.info(f"✅ [WS] connected to server as {self._machine_code}")
            try:
                self._sio.call(
                    "machine_ready",
                    {"machine_code": self._machine_code},
                    timeout=5,
                )
            except Exception:
                pass
            self.flush_outbox()

        @self._sio.event
        def disconnect():
            with self._lock:
                self._connected = False
            logger.warning("🔌 [WS] disconnected")

        @self._sio.on("job.start")
        def on_job_start(data):
            if not isinstance(data, dict):
                return

            try:
                from routes import job_manager, _run_mock_job  # local import to avoid import cycle at startup

                machine_code = data.get("machine_code") or self._machine_code
                items = data.get("items") or []
                job_id = data.get("job_id")
                order_charge_id = data.get("order_charge_id")

                job = job_manager.create_or_get(
                    job_id=job_id,
                    machine_code=machine_code,
                    items=items,
                    order_charge_id=order_charge_id,
                )

                if len(job.history) == 0:
                    threading.Thread(target=_run_mock_job, args=(job,), daemon=True).start()

                logger.info(f"🧾 [WS] received job.start job_id={job.job_id} items={len(job.items)}")

            except Exception as e:
                logger.error(f"❌ [WS] job.start handler failed: {e}")

    def connect_forever(self) -> None:
        url = _server_url()
        if not url:
            logger.warning("⚠️ [WS] SERVER_SOCKET_URL not set; websocket disabled")
            return

        machine_code = _machine_code_from_env()
        token = _machine_token_from_env()
        if not machine_code or not token:
            logger.warning(
                "⚠️ [WS] MACHINE_CODE และ MACHINE_TOKEN จำเป็น — ปิด websocket"
            )
            return

        self._machine_code = machine_code

        while True:
            try:
                if not self._sio.connected:
                    self._sio.connect(
                        url,
                        auth=_socketio_auth(machine_code, token),
                        transports=["websocket"],
                        wait=True,
                        wait_timeout=10,
                    )
                # Connected: keep a small loop and flush periodically
                for _ in range(50):
                    self.flush_outbox()
                    time.sleep(0.3)
            except ConnectionRefusedError:
                logger.error(
                    "❌ [WS] Authentication failed (MACHINE_CODE + MACHINE_TOKEN); retrying in 30s"
                )
                time.sleep(30)
            except Exception:
                time.sleep(1)

    def flush_outbox(self) -> None:
        with self._lock:
            if not self._connected:
                return

        pending = get_pending(limit=200)
        for ev in pending:
            try:
                res = self._sio.call("machine_event", ev, timeout=5)
                if isinstance(res, dict) and res.get("ok") is True:
                    job_id = ev.get("job_id")
                    seq = ev.get("seq")
                    if job_id is not None and seq is not None:
                        mark_sent(str(job_id), int(seq))
                else:
                    break
            except Exception:
                break


_client: Optional[AgentSocketClient] = None


def get_ws_client_status() -> Dict[str, Any]:
    global _client
    if _client is None:
        return {"connected": False, "machine_code": _machine_code_from_env() or None}
    with _client._lock:
        connected = _client._connected
    return {
        "connected": connected,
        "machine_code": _client._machine_code or _machine_code_from_env() or None,
        "server_url": _server_url(),
    }


def start_ws_client() -> None:
    global _client
    if _client is not None:
        return

    _client = AgentSocketClient()

    t = threading.Thread(target=_client.connect_forever, daemon=True)
    t.start()
