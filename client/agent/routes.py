import json
import logging
import os
import queue
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import requests
from flask import Blueprint, Response, jsonify, request, stream_with_context

from ws_outbox import enqueue_event

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
        transfer = 3
        dispense = 3
        expanded = self._expand_queue(job)
        heating = sum(int(x.get("heating_time", 15)) for x in expanded)
        return int(transfer + heating + dispense)

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
        sink_mode = (os.environ.get("EVENT_SINK_MODE") or "socket").lower()
        sink_url = os.environ.get("EVENT_SINK_URL")

        payload = {
            "machine_code": job.machine_code,
            "job_id": job.job_id,
            "order_charge_id": job.order_charge_id,
            "event_type": event.get("event_type"),
            "state": event.get("state"),
            "seq": event.get("seq"),
            "payload": event.get("payload"),
        }

        # Always persist locally first (offline-first)
        enqueue_event(payload)

        # Optional legacy HTTP sink (kept for compatibility)
        if sink_mode != "http" or not sink_url:
            return

        def _send():
            try:
                requests.post(sink_url, json=payload, timeout=2)
            except Exception:
                return

        threading.Thread(target=_send, daemon=True).start()


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
    """Mock hardware flow. Replace sleeps with sensor/actuator logic in production."""
    try:
        expanded = job_manager._expand_queue(job)

        def tick(seconds: int):
            for _ in range(seconds):
                if job.done:
                    return
                job.remaining_seconds = max(0, int(job.remaining_seconds) - 1)
                job_manager.publish(
                    job,
                    _mk_event(
                        job,
                        event_type="job.progress",
                        state=job.state,
                        payload={
                            "current_item_index": job.current_item_index,
                            "remaining_seconds": job.remaining_seconds,
                        },
                    ),
                )
                time.sleep(1)

        job.state = "TRANSFER_TO_OVEN"
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
            ),
        )
        tick(3)

        job.state = "HEATING"
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
            ),
        )

        for i, it in enumerate(expanded):
            if job.done:
                return
            job.current_item_index = i
            job_manager.publish(
                job,
                _mk_event(
                    job,
                    event_type="item.state",
                    state="HEATING",
                    payload={
                        "current_item_index": i,
                        "product_id": it.get("product_id"),
                        "name": it.get("name"),
                        "heating_time": it.get("heating_time"),
                        "remaining_seconds": job.remaining_seconds,
                    },
                ),
            )
            tick(int(it.get("heating_time", 15)))

        job.state = "DISPENSING"
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
            ),
        )
        tick(3)

        job.state = "DONE"
        job.remaining_seconds = 0
        job.done = True
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": 0, "current_item_index": job.current_item_index},
            ),
        )

    except Exception as e:
        job.state = "ERROR"
        job.error_message = str(e)
        job.done = True
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"error": job.error_message, "remaining_seconds": job.remaining_seconds},
            ),
        )

@routes.route("/dispense", methods=["POST"])
def dispense():
    data = request.get_json(silent=True) or {}
    machine_code = data.get("machine_code") or data.get("machine_id")
    items = data.get("items", [])

    if not machine_code:
        return {"status": "error", "message": "machine_code is required"}, 400

    logger.info(f"[Agent] Received legacy dispense request for machine {machine_code}")
    logger.info(f"[Agent] Items to dispense: {items}")

    # Legacy behavior: treat as instant OK
    return {"status": "success", "message": "All items dispensed"}, 200


@routes.route("/jobs/start", methods=["POST"])
def start_job():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"status": "error", "message": "Invalid JSON body"}, 400

    machine_code = data.get("machine_code") or data.get("machine_id")
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

@routes.route("/")
def index():
    return {"status": "agent-online", "version": "1.0.0"}