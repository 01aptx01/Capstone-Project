from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

logger = logging.getLogger(__name__)

JOB_STATES = ["TRANSFER_TO_OVEN", "HEATING", "DISPENSING", "DONE", "ERROR"]
STEP_ORDER = ["TRANSFER_TO_OVEN", "HEATING", "DISPENSING", "DONE"]
STEP_SOUND_FILES = {
	"TRANSFER_TO_OVEN": "transfer_to_oven.mp3",
	"HEATING": "heating.mp3",
	"DISPENSING": "dispensing.mp3",
	"DONE": "done.mp3",
	"ERROR": "error.mp3",
}

DEFAULT_RGB_LED_PINS = [
	14, 15, 18,
	23, 24, 25,
	8, 7, 12,
	16, 20, 21,
]

DEFAULT_GREEN_LED_PINS = [2, 3, 4, 17, 27, 22]

try:  # Optional Raspberry Pi GPIO backend.
	from gpiozero import LED, RGBLED  # type: ignore
except Exception:  # pragma: no cover - hardware dependency
	LED = None
	RGBLED = None


def _env_flag(name: str, default: bool = False) -> bool:
	value = os.environ.get(name)
	if value is None:
		return default
	return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_path(name: str, default: str) -> Path:
	value = os.environ.get(name) or default
	return Path(value).expanduser()


def _split_ints(raw: Optional[str]) -> list[int]:
	if not raw:
		return []
	out: list[int] = []
	for part in raw.split(","):
		part = part.strip()
		if not part:
			continue
		try:
			out.append(int(part))
		except Exception:
			continue
	return out


def _find_command(candidates: Iterable[str]) -> Optional[str]:
	for candidate in candidates:
		resolved = shutil.which(candidate)
		if resolved:
			return resolved
	return None


def _default_ui_url() -> str:
	return (
		os.environ.get("MACHINE_UI_URL")
		or os.environ.get("SERVER_MACHINE_UI_URL")
		or os.environ.get("NEXT_PUBLIC_MACHINE_UI_URL")
		or "http://localhost:3000"
	)


def _default_browser_command() -> Optional[str]:
	explicit = os.environ.get("CHROMIUM_COMMAND")
	if explicit:
		resolved = shutil.which(explicit)
		if resolved:
			return resolved
	return _find_command(("chromium-browser", "chromium", "google-chrome", "google-chrome-stable"))


def _sound_directory() -> Path:
	default_dir = Path(__file__).resolve().parent / "sounds"
	env_dir = os.environ.get("MACHINE_SOUND_DIR")
	if env_dir:
		candidate = Path(env_dir).expanduser()
		if candidate.exists():
			return candidate
		logger.warning(f"[Machine] MACHINE_SOUND_DIR not found, falling back to {default_dir}")
	return default_dir


@dataclass
class MachineConfig:
	machine_code: str = field(default_factory=lambda: os.environ.get("MACHINE_CODE") or os.environ.get("MACHINE_ID") or "MP1-001")
	machine_ui_url: str = field(default_factory=_default_ui_url)
	browser_command: Optional[str] = field(default_factory=_default_browser_command)
	slot_led_pins: list[int] = field(default_factory=lambda: _split_ints(os.environ.get("GREEN_LED_PINS")) or DEFAULT_GREEN_LED_PINS.copy())
	rgb_led_pins: list[int] = field(default_factory=lambda: _split_ints(os.environ.get("RGB_LED_PINS")) or DEFAULT_RGB_LED_PINS.copy())
	sound_dir: Path = field(default_factory=_sound_directory)
	nfc_auto_approve: bool = field(default_factory=lambda: _env_flag("NFC_AUTO_APPROVE", default=True))
	browser_args: list[str] = field(
		default_factory=lambda: [
			"--kiosk",
			"--incognito",
			"--noerrdialogs",
			"--disable-infobars",
			"--autoplay-policy=no-user-gesture-required",
			"--overscroll-history-navigation=0",
			"--touch-events=enabled",
		]
	)


class _VirtualLED:
	def __init__(self, name: str):
		self.name = name
		self.is_on = False

	def on(self) -> None:
		self.is_on = True

	def off(self) -> None:
		self.is_on = False

	def blink(self, on_time: float = 0.2, off_time: float = 0.2) -> None:
		self.on()
		time.sleep(on_time)
		self.off()
		time.sleep(off_time)


class _VirtualRGBLED:
	def __init__(self, name: str):
		self.name = name
		self.color = (0.0, 0.0, 0.0)

	def _set(self, red: float, green: float, blue: float) -> None:
		self.color = (red, green, blue)

	def on(self) -> None:
		self._set(1.0, 1.0, 1.0)

	def off(self) -> None:
		self._set(0.0, 0.0, 0.0)

	@property
	def red(self) -> float:
		return self.color[0]

	@red.setter
	def red(self, value: float) -> None:
		self.color = (value, self.color[1], self.color[2])

	@property
	def green(self) -> float:
		return self.color[1]

	@green.setter
	def green(self, value: float) -> None:
		self.color = (self.color[0], value, self.color[2])

	@property
	def blue(self) -> float:
		return self.color[2]

	@blue.setter
	def blue(self, value: float) -> None:
		self.color = (self.color[0], self.color[1], value)


class KioskLauncher:
	def __init__(self, config: MachineConfig):
		self._config = config
		self._process: Optional[subprocess.Popen[Any]] = None
		self._lock = threading.Lock()

	def start(self) -> bool:
		with self._lock:
			if self._process and self._process.poll() is None:
				return True

			browser = self._config.browser_command
			if not browser:
				logger.warning("[Machine] No Chromium-compatible browser found; kiosk UI will not launch")
				return False

			if not os.environ.get("DISPLAY"):
				logger.warning("[Machine] DISPLAY is not set; skipping kiosk launch")
				return False

			args = [browser, *self._config.browser_args, self._config.machine_ui_url]
			try:
				self._process = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
				logger.info(f"[Machine] kiosk started: {' '.join(args)}")
				return True
			except Exception as exc:
				logger.error(f"[Machine] kiosk launch failed: {exc}")
				return False

	def stop(self) -> None:
		with self._lock:
			process = self._process
			self._process = None

		if process and process.poll() is None:
			try:
				process.terminate()
				process.wait(timeout=3)
			except Exception:
				try:
					process.kill()
				except Exception:
					pass


class SlotLEDController:
	def __init__(self, config: MachineConfig, slot_count: int = 6):
		self._config = config
		self._slot_count = slot_count
		self._lock = threading.Lock()
		self._devices = self._build_devices()
		self._states = [False] * slot_count

	def _build_devices(self) -> list[Any]:
		pins = list(self._config.slot_led_pins)
		if LED is None or len(pins) < self._slot_count:
			return [_VirtualLED(f"slot-{index + 1}") for index in range(self._slot_count)]
		return [LED(pin) for pin in pins[: self._slot_count]]

	def set_slot(self, slot_index: int, enabled: bool) -> None:
		if slot_index < 0 or slot_index >= self._slot_count:
			return

		with self._lock:
			self._states[slot_index] = enabled
			device = self._devices[slot_index]
			if enabled:
				device.on()
			else:
				device.off()

	def flash_slot(self, slot_index: int, duration: float = 0.8) -> None:
		if slot_index < 0 or slot_index >= self._slot_count:
			return

		self.set_slot(slot_index, True)
		time.sleep(max(0.0, duration))
		self.set_slot(slot_index, False)

	def all_off(self) -> None:
		for index in range(self._slot_count):
			self.set_slot(index, False)


class StepRGBController:
	def __init__(self, config: MachineConfig):
		self._config = config
		self._lock = threading.Lock()
		self._devices = self._build_devices()
		self._states: Dict[str, str] = {step: "off" for step in STEP_ORDER}

	def _build_devices(self) -> list[Any]:
		pins = list(self._config.rgb_led_pins)
		if RGBLED is None or len(pins) < 12:
			return [_VirtualRGBLED(f"step-{index + 1}") for index in range(len(STEP_ORDER))]

		devices: list[Any] = []
		for index in range(len(STEP_ORDER)):
			start = index * 3
			devices.append(RGBLED(red=pins[start], green=pins[start + 1], blue=pins[start + 2]))
		return devices

	def set_step(self, step_name: str, *, success: bool = True) -> None:
		if step_name not in STEP_ORDER:
			return

		color = (0.0, 1.0, 0.0) if success else (1.0, 0.0, 0.0)
		index = STEP_ORDER.index(step_name)

		with self._lock:
			self._states[step_name] = "green" if success else "red"
			device = self._devices[index]
			self._apply_color(device, color)

	def set_error(self) -> None:
		with self._lock:
			for step_name in STEP_ORDER:
				self._states[step_name] = "red"
			for device in self._devices:
				self._apply_color(device, (1.0, 0.0, 0.0))

	def set_all(self, *, success: bool = True) -> None:
		color = (0.0, 1.0, 0.0) if success else (1.0, 0.0, 0.0)
		state = "green" if success else "red"

		with self._lock:
			for step_name in STEP_ORDER:
				self._states[step_name] = state
			for device in self._devices:
				self._apply_color(device, color)

	def clear(self) -> None:
		with self._lock:
			for step_name in STEP_ORDER:
				self._states[step_name] = "off"
			for device in self._devices:
				self._apply_color(device, (0.0, 0.0, 0.0))

	@staticmethod
	def _apply_color(device: Any, color: tuple[float, float, float]) -> None:
		red, green, blue = color
		if hasattr(device, "color"):
			device.color = color
			return

		if hasattr(device, "red"):
			device.red = red
		if hasattr(device, "green"):
			device.green = green
		if hasattr(device, "blue"):
			device.blue = blue


class AudioPlayer:
	def __init__(self, sound_dir: Path):
		self._sound_dir = sound_dir
		self._lock = threading.Lock()
		explicit = os.environ.get("VLC_COMMAND")
		if explicit:
			resolved = shutil.which(explicit)
			self._player_cmd = resolved or explicit
		else:
			self._player_cmd = _find_command(("cvlc", "vlc", "ffplay", "mpg123", "aplay"))

	def play_step(self, step_name: str) -> bool:
		sound_name = STEP_SOUND_FILES.get(step_name)
		if not sound_name:
			return False

		sound_path = self._sound_dir / sound_name
		if not sound_path.exists():
			logger.info(f"[Machine] sound not found: {sound_path}")
			return False

		with self._lock:
			if not self._player_cmd:
				logger.info(f"[Machine] audio player not available, would play: {sound_path}")
				return False

			command = [self._player_cmd]
			player_name = Path(self._player_cmd).name.lower()
			if player_name == "ffplay":
				command.extend(["-nodisp", "-autoexit", str(sound_path)])
			elif player_name in {"cvlc", "vlc"}:
				command.extend(["--intf", "dummy", "--no-video", "--play-and-exit", str(sound_path)])
			else:
				command.append(str(sound_path))

			try:
				subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
				logger.info(f"[Machine] audio playing: {sound_path}")
				return True
			except Exception as exc:
				logger.error(f"[Machine] audio play failed: {exc}")
				return False


class NfcPaymentGate:
	def __init__(self, config: MachineConfig):
		self._config = config
		self._event = threading.Event()
		self._lock = threading.Lock()

	def tap(self) -> None:
		with self._lock:
			self._event.set()

	def reset(self) -> None:
		with self._lock:
			self._event.clear()

	def wait_for_payment(self, timeout: Optional[float] = None) -> bool:
		if self._config.nfc_auto_approve:
			delay = float(os.environ.get("NFC_SIMULATED_DELAY", "0.75"))
			time.sleep(max(0.0, delay))
			self.tap()
			return True

		logger.info("[Machine] waiting for NFC tap")
		return self._event.wait(timeout)


@dataclass
class MachineState:
	payment_authorized: bool = False
	active_step: Optional[str] = None
	last_error: Optional[str] = None
	current_slot_index: Optional[int] = None


class MachineController:
	def __init__(self, config: Optional[MachineConfig] = None):
		self.config = config or MachineConfig()
		self.launcher = KioskLauncher(self.config)
		self.slot_leds = SlotLEDController(self.config)
		self.step_leds = StepRGBController(self.config)
		self.audio = AudioPlayer(self.config.sound_dir)
		self.nfc = NfcPaymentGate(self.config)
		self.state = MachineState()
		self._lock = threading.RLock()

	@classmethod
	def from_env(cls) -> "MachineController":
		return cls()

	def boot(self) -> None:
		self.launcher.start()
		self.reset_indicators()

	def shutdown(self) -> None:
		self.slot_leds.all_off()
		self.step_leds.clear()
		self.launcher.stop()

	def reset_indicators(self) -> None:
		with self._lock:
			self.state.payment_authorized = False
			self.state.active_step = None
			self.state.last_error = None
			self.state.current_slot_index = None

		self.nfc.reset()
		self.slot_leds.all_off()
		self.step_leds.clear()

	def _step_index(self, step_name: str) -> Optional[int]:
		if step_name not in STEP_ORDER:
			return None
		return STEP_ORDER.index(step_name)

	def mark_step_complete(self, step_name: str) -> None:
		with self._lock:
			self.state.active_step = step_name
			self.state.last_error = None

		self.step_leds.set_step(step_name, success=True)
		self.audio.play_step(step_name)

	def mark_error(self, message: str) -> None:
		with self._lock:
			self.state.last_error = message
			self.state.active_step = "ERROR"

		logger.error(f"[Machine] error: {message}")
		self.step_leds.set_error()
		self.audio.play_step("ERROR")

	def wait_for_nfc_payment(self, timeout: Optional[float] = None) -> bool:
		self.audio.play_step("TRANSFER_TO_OVEN")
		paid = self.nfc.wait_for_payment(timeout=timeout)
		with self._lock:
			self.state.payment_authorized = paid
		return paid

	def set_slot_active(self, slot_index: int, active: bool = True) -> None:
		with self._lock:
			self.state.current_slot_index = slot_index if active else None
		self.slot_leds.set_slot(slot_index, active)

	def dispense_slot(self, slot_index: int, duration: float = 2.0) -> None:
		self.set_slot_active(slot_index, True)
		try:
			time.sleep(max(0.0, duration))
		finally:
			self.set_slot_active(slot_index, False)

	def resolve_slot_index(self, product_id: int) -> int:
		return max(0, (int(product_id) - 1) % 6)

	def run_process_step(self, step_name: str, *, success: bool = True) -> None:
		if success:
			self.mark_step_complete(step_name)
			return
		self.mark_error(f"step failed: {step_name}")

	def run_full_flow(self, items: list[dict[str, Any]]) -> bool:
		try:
			if not self.wait_for_nfc_payment(timeout=180):
				self.mark_error("NFC payment timeout")
				return False

			self.mark_step_complete("TRANSFER_TO_OVEN")

			self.mark_step_complete("HEATING")
			for item in items:
				product_id = int(item.get("product_id") or item.get("id") or 1)
				quantity = max(1, int(item.get("quantity") or item.get("qty") or 1))
				slot_index = self.resolve_slot_index(product_id)
				for _ in range(quantity):
					self.dispense_slot(slot_index)

			self.mark_step_complete("DISPENSING")
			self.mark_step_complete("DONE")
			self.step_leds.set_all(success=True)
			time.sleep(1.0)
			self.step_leds.clear()
			return True
		except Exception as exc:
			self.mark_error(str(exc))
			return False


machine = MachineController.from_env()


def bootstrap_machine() -> MachineController:
	machine.boot()
	return machine


def show_machine_ui() -> bool:
	return machine.launcher.start()


def set_step_success(step_name: str) -> None:
	machine.mark_step_complete(step_name)


def set_step_error(message: str) -> None:
	machine.mark_error(message)


def simulate_nfc_tap() -> None:
	machine.nfc.tap()


def load_machine_config() -> Dict[str, Any]:
	return {
		"machine_code": machine.config.machine_code,
		"machine_ui_url": machine.config.machine_ui_url,
		"browser_command": machine.config.browser_command,
		"slot_led_pins": machine.config.slot_led_pins,
		"rgb_led_pins": machine.config.rgb_led_pins,
		"sound_dir": str(machine.config.sound_dir),
		"nfc_auto_approve": machine.config.nfc_auto_approve,
	}


def main() -> None:
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s [%(levelname)s] %(message)s",
		datefmt="%Y-%m-%d %H:%M:%S",
	)
	logger.info(f"[Machine] booting with config: {json.dumps(load_machine_config(), ensure_ascii=False)}")
	bootstrap_machine()
	try:
		while True:
			time.sleep(1)
	except KeyboardInterrupt:
		logger.info("[Machine] shutting down")
	finally:
		machine.shutdown()


if __name__ == "__main__":
	main()

