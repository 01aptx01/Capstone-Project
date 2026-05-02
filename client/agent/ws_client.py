import hashlib
import hmac
import logging
import os
import threading
import time
from typing import Any, Dict, Optional

import socketio

from ws_outbox import get_pending, mark_sent

logger = logging.getLogger(__name__)


def _machine_code() -> str:
    return os.environ.get("MACHINE_CODE") or os.environ.get("MACHINE_ID") or "MP1-001"


def _server_url() -> Optional[str]:
    url = os.environ.get("SERVER_SOCKET_URL") or os.environ.get("SERVER_URL")
    if url and url.strip():
        return url.strip()
    return None


def _machine_key_bytes() -> Optional[bytes]:
    secret_hex = os.environ.get("MACHINE_SECRET_KEY")
    if not secret_hex or not secret_hex.strip():
        return None
    try:
        return bytes.fromhex(secret_hex.strip())
    except Exception:
        return None


def _make_auth() -> Dict[str, Any]:
    mc = _machine_code()
    ts = int(time.time())
    key = _machine_key_bytes()
    sig = ""
    if key:
        sig = hmac.new(key, f"{mc}:{ts}".encode("utf-8"), hashlib.sha256).hexdigest()
    return {"machine_code": mc, "ts": ts, "sig": sig}


class AgentSocketClient:
    def __init__(self):
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
            logger.info(f"✅ [WS] connected to server as {_machine_code()}")
            try:
                self._sio.call("machine_ready", {"machine_code": _machine_code()}, timeout=5)
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

                machine_code = data.get("machine_code") or data.get("machine_id") or _machine_code()
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

        while True:
            try:
                if not self._sio.connected:
                    self._sio.connect(url, auth=_make_auth(), transports=["websocket"], wait=True, wait_timeout=10)
                # Connected: keep a small loop and flush periodically
                for _ in range(5):
                    self.flush_outbox()
                    time.sleep(1)
            except Exception:
                time.sleep(2)

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


def start_ws_client() -> None:
    global _client
    if _client is not None:
        return

    _client = AgentSocketClient()

    t = threading.Thread(target=_client.connect_forever, daemon=True)
    t.start()
