import json
import logging
import os
import queue
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from flask import Blueprint, Response, jsonify, request, stream_with_context

from ws_outbox import enqueue_event
from machine import machine

routes = Blueprint("routes", __name__)
logger = logging.getLogger(__name__)


JOB_STATES = [
    "TRANSFER_TO_OVEN",
    "HEATING",
    "DISPENSING",
    "DONE",
    "ERROR",
]


@dataclass
class Job:
    job_id: str
    machine_code: str
    items: List[Dict[str, Any]]
    order_charge_id: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    state: str = "TRANSFER_TO_OVEN"
    seq: int = 0
    current_item_index: int = 0
    remaining_seconds: int = 0
    done: bool = False
    error_message: Optional[str] = None

    subscribers: List[queue.Queue] = field(default_factory=list)
    history: List[Dict[str, Any]] = field(default_factory=list)


class JobManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._jobs: Dict[str, Job] = {}

    def get(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def create_or_get(self, *, job_id: Optional[str], machine_code: str, items: List[Dict[str, Any]], order_charge_id: Optional[str]) -> Job:
        if not job_id:
            job_id = str(uuid.uuid4())

        with self._lock:
            existing = self._jobs.get(job_id)
            if existing:
                return existing

            normalized_items = self._normalize_items(items)
            job = Job(job_id=job_id, machine_code=machine_code, items=normalized_items, order_charge_id=order_charge_id)
            job.remaining_seconds = self._estimate_total_seconds(job)
            self._jobs[job_id] = job
            return job

    def _normalize_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        for it in items or []:
            if not isinstance(it, dict):
                continue
            product_id = it.get("product_id")
            if product_id is None:
                product_id = it.get("id")
            quantity = it.get("quantity")
            if quantity is None:
                quantity = it.get("qty")
            heating_time = it.get("heating_time")
            name = it.get("name")

            try:
                product_id = int(product_id)
                quantity = int(quantity)
            except Exception:
                continue

            try:
                heating_time = int(heating_time) if heating_time is not None else 15
            except Exception:
                heating_time = 15

            normalized.append(
                {
                    "product_id": product_id,
                    "quantity": max(1, quantity),
                    "heating_time": max(1, heating_time),
                    "name": name,
                }
            )
        return normalized

    def _expand_queue(self, job: Job) -> List[Dict[str, Any]]:
        expanded: List[Dict[str, Any]] = []
        for it in job.items:
            for _ in range(int(it.get("quantity", 1))):
                expanded.append(it)
        return expanded

    def _estimate_total_seconds(self, job: Job) -> int:
        expanded = self._expand_queue(job)
        if not expanded:
            return 0

        # Match machine-ui's timeline logic exactly:
        # STEP1_DELAY(2) + lastWindowEnd + STEP4_HOLD(3) + FINAL_STEP_HOLD(3)
        # where lastWindowEnd is calculated by buildDispenseSchedule (non-overlapping 2s windows)
        
        items = sorted(expanded, key=lambda x: int(x.get("heating_time", 15)))
        next_available = 0
        last_window_end = 0
        
        for it in items:
            finish_time = int(it.get("heating_time", 15))
            window_start = max(finish_time, next_available)
            window_end = window_start + 2 # DISPENSE_WINDOW
            last_window_end = window_end
            next_available = window_end
            
        return 2 + last_window_end + 3 + 3

    def subscribe(self, job: Job) -> queue.Queue:
        q: queue.Queue = queue.Queue()
        with self._lock:
            job.subscribers.append(q)
        return q

    def unsubscribe(self, job: Job, q: queue.Queue) -> None:
        with self._lock:
            try:
                job.subscribers.remove(q)
            except ValueError:
                pass

    def publish(self, job: Job, event: Dict[str, Any]) -> None:
        with self._lock:
            job.history.append(event)
            subscribers = list(job.subscribers)

        for q in subscribers:
            try:
                q.put_nowait(event)
            except Exception:
                pass

        self._forward_event(job, event)

    def _forward_event(self, job: Job, event: Dict[str, Any]) -> None:
        payload = {
            "machine_code": job.machine_code,
            "job_id": job.job_id,
            "order_charge_id": job.order_charge_id,
            "event_type": event.get("event_type"),
            "state": event.get("state"),
            "seq": event.get("seq"),
            "payload": event.get("payload"),
        }
        enqueue_event(payload)


job_manager = JobManager()


def _mk_event(job: Job, *, event_type: str, state: Optional[str] = None, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    job.seq += 1
    return {
        "event_type": event_type,
        "machine_code": job.machine_code,
        "job_id": job.job_id,
        "state": state,
        "seq": job.seq,
        "ts": time.time(),
        "payload": payload or {},
    }


def _run_mock_job(job: Job) -> None:
    """Run dispense job via hardware_runner (mock sensors by default)."""
    from hardware_runner import run_hardware_job

    run_hardware_job(job, job_manager, mk_event=_mk_event)

@routes.route("/jobs/start", methods=["POST"])
def start_job():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"status": "error", "message": "Invalid JSON body"}, 400

    machine_code = data.get("machine_code")
    items = data.get("items") or []
    job_id = data.get("job_id")
    order_charge_id = data.get("order_charge_id")

    if not machine_code:
        return {"status": "error", "message": "machine_code is required"}, 400

    job = job_manager.create_or_get(job_id=job_id, machine_code=machine_code, items=items, order_charge_id=order_charge_id)

    # Start mock flow if first time
    if len(job.history) == 0:
        threading.Thread(target=_run_mock_job, args=(job,), daemon=True).start()

    return {
        "status": "ok",
        "job_id": job.job_id,
        "state": job.state,
        "seq": job.seq,
        "remaining_seconds": job.remaining_seconds,
    }, 200


@routes.route("/jobs/<job_id>", methods=["GET"])
def get_job(job_id: str):
    job = job_manager.get(job_id)
    if not job:
        return jsonify({"status": "error", "message": "job not found"}), 404

    return jsonify(
        {
            "status": "ok",
            "job_id": job.job_id,
            "machine_code": job.machine_code,
            "state": job.state,
            "seq": job.seq,
            "current_item_index": job.current_item_index,
            "remaining_seconds": job.remaining_seconds,
            "done": job.done,
            "error": job.error_message,
        }
    )


@routes.route("/jobs/<job_id>/events", methods=["GET"])
def job_events(job_id: str):
    job = job_manager.get(job_id)
    if not job:
        return jsonify({"status": "error", "message": "job not found"}), 404

    # Optional replay from seq (client reconnect)
    try:
        last_seq = int(request.args.get("last_seq", "0"))
    except Exception:
        last_seq = 0

    q = job_manager.subscribe(job)

    def gen():
        try:
            # replay buffered history
            for ev in list(job.history):
                if int(ev.get("seq", 0)) > last_seq:
                    yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"

            # send live events
            while True:
                ev = q.get()
                yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
        except GeneratorExit:
            return
        finally:
            job_manager.unsubscribe(job, q)

    return Response(
        stream_with_context(gen()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@routes.route("/nfc/status", methods=["GET"])
def nfc_status():
    """Endpoint for UI to poll for NFC tap status."""
    draft_id = request.args.get("draft_id") or request.args.get("charge_id")
    st = machine.nfc.status(draft_id=draft_id)
    # Backward compatible behavior: "tapped" consumes the event once.
    if st.get("status") == "tapped":
        machine.nfc.consume_tap(draft_id=draft_id)
    return jsonify(st), 200


@routes.route("/nfc/arm", methods=["POST"])
def nfc_arm():
    """Arm NFC polling for the current payment flow (prevents stale taps leaking into next flow)."""
    body = request.get_json(silent=True) or {}
    draft_id = body.get("draft_id") or body.get("charge_id")
    ttl_ms = body.get("ttl_ms") or body.get("ttlMs") or 30000
    if not draft_id:
        return jsonify({"ok": False, "error": "draft_id required"}), 400
    try:
        ttl_ms_int = int(ttl_ms)
    except Exception:
        ttl_ms_int = 30000
    draft_id = str(draft_id)
    machine.nfc.arm(draft_id=draft_id, ttl_ms=ttl_ms_int)
    logger.info("[NFC] armed for %s (ttl_ms=%s)", draft_id, ttl_ms_int)
    return jsonify({"ok": True, **machine.nfc.status(draft_id=draft_id)}), 200


@routes.route("/nfc/disarm", methods=["POST"])
def nfc_disarm():
    """Disarm NFC polling and clear pending tap."""
    machine.nfc.disarm()
    logger.info("[NFC] disarmed")
    return jsonify({"ok": True, **machine.nfc.status()}), 200

@routes.route("/health", methods=["GET"])
def health():
    from ws_client import get_ws_client_status
    from ws_outbox import count_pending

    gpio_mode = "virtual"
    try:
        from gpiozero import LED  # type: ignore

        if LED is not None:
            gpio_mode = "gpiozero"
    except Exception:
        pass

    return jsonify(
        {
            "status": "ok",
            "machine_code": machine.config.machine_code,
            "ws": get_ws_client_status(),
            "outbox_pending": count_pending(),
            "gpio_mode": gpio_mode,
            "nfc_auto_approve": machine.config.nfc_auto_approve,
        }
    )


@routes.route("/")
def index():
    return {"status": "agent-online", "version": "1.0.0"}