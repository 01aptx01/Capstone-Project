"""Dispense job orchestration using SensorProvider (mock or GPIO)."""
from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING, Any, Callable, Dict, List

from machine import machine
from sensors import SensorProvider, get_sensor_provider

if TYPE_CHECKING:
    from routes import Job, JobManager

logger = logging.getLogger(__name__)


def run_hardware_job(
    job: "Job",
    job_manager: "JobManager",
    *,
    mk_event: Callable[..., Dict[str, Any]],
    sensors: SensorProvider | None = None,
) -> None:
    sensors = sensors or get_sensor_provider()

    def job_done() -> bool:
        return job.done

    def tick(seconds: int) -> None:
        for _ in range(seconds):
            if job_done():
                return
            job.remaining_seconds = max(0, int(job.remaining_seconds) - 1)
            job_manager.publish(
                job,
                mk_event(
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

    try:
        expanded = job_manager._expand_queue(job)
        items_with_time = [(i, it, int(it.get("heating_time", 15))) for i, it in enumerate(expanded)]
        items_with_time.sort(key=lambda x: x[2])

        active_slots: List[int] = []
        for i, it, target_time in items_with_time:
            slot_index = machine.resolve_slot_index(it.get("product_id", 1))
            machine.set_slot_active(slot_index, True)
            if slot_index not in active_slots:
                active_slots.append(slot_index)

        job.state = "TRANSFER_TO_OVEN"
        machine.mark_step_active("TRANSFER_TO_OVEN")
        job_manager.publish(
            job,
            mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={
                    "remaining_seconds": job.remaining_seconds,
                    "current_item_index": job.current_item_index,
                },
            ),
        )
        if not sensors.wait_transfer_complete(timeout=30.0):
            raise RuntimeError("transfer timeout")
        tick(2)
        machine.mark_step_complete("TRANSFER_TO_OVEN")

        elapsed_heating = 0
        for i, it, target_time in items_with_time:
            if job.done:
                for slot in active_slots:
                    machine.set_slot_active(slot, False)
                return

            job.current_item_index = i
            time_to_heat = target_time - elapsed_heating
            if time_to_heat > 0:
                job.state = "HEATING"
                machine.mark_step_active("HEATING")
                job_manager.publish(
                    job,
                    mk_event(
                        job,
                        event_type="job.state",
                        state=job.state,
                        payload={
                            "remaining_seconds": job.remaining_seconds,
                            "current_item_index": job.current_item_index,
                        },
                    ),
                )
                if not sensors.wait_heating(time_to_heat, timeout=float(time_to_heat) + 60):
                    raise RuntimeError("heating timeout")
                tick(time_to_heat)
                machine.mark_step_complete("HEATING")
                elapsed_heating = target_time

            job.state = "DISPENSING"
            machine.mark_step_active("DISPENSING")
            slot_index = machine.resolve_slot_index(it.get("product_id", 1))
            job_manager.publish(
                job,
                mk_event(
                    job,
                    event_type="job.state",
                    state=job.state,
                    payload={
                        "remaining_seconds": job.remaining_seconds,
                        "current_item_index": job.current_item_index,
                    },
                ),
            )
            if not sensors.wait_dispense_complete(slot_index, timeout=30.0):
                raise RuntimeError(f"dispense timeout slot {slot_index}")
            tick(2)
            machine.mark_step_complete("DISPENSING")

        tick(3)

        job.state = "DONE"
        job.remaining_seconds = 0
        job.done = True
        machine.mark_step_active("DONE")
        job_manager.publish(
            job,
            mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={"remaining_seconds": 0, "current_item_index": job.current_item_index},
            ),
        )
        tick(3)
        machine.mark_step_complete("DONE")
        machine.step_leds.set_all(success=True)

        for slot in active_slots:
            machine.set_slot_active(slot, False)

        time.sleep(2.0)
        machine.step_leds.set_standby()

    except Exception as e:
        job.state = "ERROR"
        job.error_message = str(e)
        job.done = True
        machine.mark_error(str(e))
        job_manager.publish(
            job,
            mk_event(
                job,
                event_type="job.state",
                state=job.state,
                payload={
                    "error": job.error_message,
                    "remaining_seconds": job.remaining_seconds,
                },
            ),
        )
