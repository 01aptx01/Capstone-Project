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


def _safe_hw(label: str, fn, *args, **kwargs):
    """เรียก hardware/LED/audio call แบบปลอดภัย — ถ้า throw จะ log แล้วเดินต่อ
    ไม่ให้ exception จาก hardware (เช่นไฟ LED/เสียง ใน environment ที่ไม่มี GPIO จริง)
    ทำให้ทั้ง job ล้มเหลวกลายเป็น ERROR ทั้งที่การจ่ายสินค้า (timeline) เสร็จปกติ
    """
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        logger.warning(f"[MockJob] hardware call '{label}' failed (ignored): {e!r}")
        return None


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
        # Sort items by heating time ascending, keeping track of original indices
        items_with_time = [(i, it, int(it.get("heating_time", 15))) for i, it in enumerate(expanded)]
        items_with_time.sort(key=lambda x: x[2])

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

        # 1. Turn on GREEN slot lights FIRST for all items
        active_slots = []
        for i, it, target_time in items_with_time:
            slot_index = machine.resolve_slot_index(it.get("product_id", 1))
            _safe_hw("set_slot_active(on)", machine.set_slot_active, slot_index, True)
            if slot_index not in active_slots:
                active_slots.append(slot_index)

        # 2. Phase 1: TRANSFER_TO_OVEN (STEP1_DELAY = 2s)
        job.state = "TRANSFER_TO_OVEN"
        _safe_hw("mark_step_active(TRANSFER)", machine.mark_step_active, "TRANSFER_TO_OVEN")
        job_manager.publish(
            job,
            _mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
            ),
        )
        tick(2) # Match STEP1_DELAY
        _safe_hw("mark_step_complete(TRANSFER)", machine.mark_step_complete, "TRANSFER_TO_OVEN")

        # 3. Phase 2: HEATING & DISPENSING
        elapsed_heating = 0
        for i, it, target_time in items_with_time:
            if job.done:
                for slot in active_slots:
                    _safe_hw("set_slot_active(off)", machine.set_slot_active, slot, False)
                return

            job.current_item_index = i
            # Step A: HEATING
            time_to_heat = target_time - elapsed_heating
            if time_to_heat > 0:
                job.state = "HEATING"
                _safe_hw("mark_step_active(HEATING)", machine.mark_step_active, "HEATING")
                job_manager.publish(
                    job,
                    _mk_event(
                        job,
                        event_type="job.state",
                        state=job.state,
                        payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
                    ),
                )
                tick(time_to_heat)
                _safe_hw("mark_step_complete(HEATING)", machine.mark_step_complete, "HEATING")
                elapsed_heating = target_time

            # Step B: DISPENSING (DISPENSE_WINDOW = 2s)
            job.state = "DISPENSING"
            _safe_hw("mark_step_active(DISPENSING)", machine.mark_step_active, "DISPENSING")
            job_manager.publish(
                job,
                _mk_event(
                    job,
                    event_type="job.state",
                    state=job.state,
                    payload={"remaining_seconds": job.remaining_seconds, "current_item_index": job.current_item_index},
                ),
            )
            tick(2) # Match DISPENSE_WINDOW
            _safe_hw("mark_step_complete(DISPENSING)", machine.mark_step_complete, "DISPENSING")

        # 4. Phase 3: Post-Dispense (STEP4_HOLD = 3s)
        # UI holds Step 3 for 3 seconds after last item
        tick(3)

        # 5. Phase 4: DONE (FINAL_STEP_HOLD = 3s)
        # ตั้ง job.done = True ก่อน publish DONE — เมื่อถึงจุดนี้ถือว่าจ่ายสินค้าสำเร็จแล้ว
        # การ publish DONE คือเหตุการณ์ที่ "ต้องไปถึงให้ได้" ดังนั้นทำก่อน hardware ใดๆ
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
        # hardware ของ DONE ทั้งหมดเป็น cosmetic — wrap ให้ปลอดภัย
        _safe_hw("mark_step_active(DONE)", machine.mark_step_active, "DONE")
        tick(3) # Match FINAL_STEP_HOLD
        _safe_hw("mark_step_complete(DONE)", machine.mark_step_complete, "DONE")
        _safe_hw("step_leds.set_all", machine.step_leds.set_all, success=True)

        # Turn off all green slot lights
        for slot in active_slots:
            _safe_hw("set_slot_active(off)", machine.set_slot_active, slot, False)

        time.sleep(2.0)
        _safe_hw("step_leds.set_standby", machine.step_leds.set_standby)

    except Exception as e:
        # ถ้า job สำเร็จแล้ว (job.done = True หลัง DONE state) แต่เกิด exception
        # ในช่วง cleanup — ไม่ publish ERROR เพราะ DONE event ถูกส่งไปแล้ว
        # (ป้องกัน ERROR event ทับ DONE ที่ server อาจทำให้ status กลายเป็น dispense_failed)
        if job.done:
            logger.warning(
                f"[MockJob] cleanup exception after DONE (job={job.job_id}): {e!r} — ignoring"
            )
            return

        # log traceback เต็มเพื่อวินิจฉัยว่าอะไรทำให้ job ล้มเหลวก่อนถึง DONE
        logger.exception(f"[MockJob] job {job.job_id} FAILED before DONE: {e!r}")
        job.state = "ERROR"
        job.error_message = str(e)
        job.done = True
        _safe_hw("mark_error", machine.mark_error, str(e))
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

@routes.route("/nfc/status", methods=["GET"])
def nfc_status():
    """Endpoint for UI to poll for NFC tap status."""
    if machine.nfc._event.is_set():
        machine.nfc.reset()
        return jsonify({"status": "tapped"}), 200
    return jsonify({"status": "waiting"}), 200

@routes.route("/")
def index():
    return {"status": "agent-online", "version": "1.0.0"}