"""Sensor abstraction for dispense jobs (mock now; GPIO later)."""
from __future__ import annotations

import logging
import os
import time
from typing import Protocol

logger = logging.getLogger(__name__)


class SensorProvider(Protocol):
    def wait_seconds(self, seconds: int, *, job_done_check) -> None: ...
    def wait_transfer_complete(self, timeout: float) -> bool: ...
    def wait_heating(self, seconds: int, timeout: float) -> bool: ...
    def wait_dispense_complete(self, slot_index: int, timeout: float) -> bool: ...


class MockSensorProvider:
    """Timer-based stand-in until real limit switches / probes are wired."""

    def wait_seconds(self, seconds: int, *, job_done_check) -> None:
        for _ in range(max(0, seconds)):
            if job_done_check():
                return
            time.sleep(1)

    def wait_transfer_complete(self, timeout: float) -> bool:
        return True

    def wait_heating(self, seconds: int, timeout: float) -> bool:
        return True

    def wait_dispense_complete(self, slot_index: int, timeout: float) -> bool:
        return True


def get_sensor_provider() -> SensorProvider:
    mode = (os.environ.get("SENSOR_MODE") or "mock").strip().lower()
    if mode == "mock":
        return MockSensorProvider()
    # Future: mode == "gpio" -> GpioSensorProvider()
    logger.warning("[Sensors] Unknown SENSOR_MODE=%s; using mock", mode)
    return MockSensorProvider()
