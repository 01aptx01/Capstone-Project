import hmac
import hashlib
import json
import logging
import os
import threading
import time
from typing import Any, Dict, Optional, Tuple

import socketio

from app.db_config.db import get_db

logger = logging.getLogger(__name__)


def _now_ts() -> int:
    return int(time.time())


def _json_dumps_safe(payload: Any) -> Optional[str]:
    if payload is None:
        return None
    try:
        return json.dumps(payload, ensure_ascii=False)
    except Exception:
        return json.dumps({"unserializable": True})


def _derive_machine_key(*, fleet_secret: str, machine_code: str) -> bytes:
    return hmac.new(
        fleet_secret.encode("utf-8"),
        machine_code.encode("utf-8"),
        hashlib.sha256,
    ).digest()


def _verify_machine_auth(auth: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[str], str]:
    fleet_secret = os.environ.get("FLEET_SECRET")
    if not fleet_secret:
        machine_code = None
        if isinstance(auth, dict):
            machine_code = auth.get("machine_code") or auth.get("machine_id") or auth.get("machine")
        return True, machine_code, "auth-disabled"

    if not isinstance(auth, dict):
        return False, None, "missing auth"

    machine_code = auth.get("machine_code") or auth.get("machine_id")
    ts = auth.get("ts")
    sig = auth.get("sig")

    if not machine_code or ts is None or not sig:
        return False, None, "machine_code, ts, sig required"

    try:
        ts_int = int(ts)
    except Exception:
        return False, None, "ts must be int"

    # Short replay window
    if abs(_now_ts() - ts_int) > 60:
        return False, None, "ts out of window"

    derived_key = _derive_machine_key(fleet_secret=fleet_secret, machine_code=machine_code)
    msg = f"{machine_code}:{ts_int}".encode("utf-8")
    expected = hmac.new(derived_key, msg, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(str(expected), str(sig)):
        return False, None, "bad sig"

    return True, str(machine_code), "ok"


sio = socketio.Server(
    async_mode="eventlet",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

_online_machines: Dict[str, str] = {}


def _update_machine_presence(machine_code: str, *, online: bool) -> None:
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        status = "online" if online else "offline"
        cur.execute(
            """
            UPDATE machines
            SET status = %s, last_active = NOW()
            WHERE machine_code = %s
            """,
            (status, machine_code),
        )
        db.commit()
    except Exception:
        db.rollback()
    finally:
        cur.close()
        db.close()


def _get_pending_orders(machine_code: str) -> list[dict]:
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT order_id, charge_id
            FROM orders
            WHERE machine_code = %s
              AND status = 'paid'
              AND charge_id IS NOT NULL
            ORDER BY created_at ASC
            LIMIT 20
            """,
            (machine_code,),
        )
        return list(cur.fetchall() or [])
    finally:
        cur.close()
        db.close()


def _get_order_items(order_id: int) -> list[dict]:
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT oi.product_id, oi.quantity, p.heating_time, p.name
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            WHERE oi.order_id = %s
            ORDER BY oi.id ASC
            """,
            (order_id,),
        )
        rows = list(cur.fetchall() or [])
        items: list[dict] = []
        for r in rows:
            items.append(
                {
                    "product_id": int(r["product_id"]),
                    "quantity": int(r["quantity"]),
                    "heating_time": int(r.get("heating_time") or 15),
                    "name": r.get("name"),
                }
            )
        return items
    finally:
        cur.close()
        db.close()


def emit_job_start(machine_code: str, *, job_id: str, order_charge_id: str, items: list[dict]) -> bool:
    try:
        sio.emit(
            "job.start",
            {
                "machine_code": machine_code,
                "job_id": job_id,
                "order_charge_id": order_charge_id,
                "items": items,
            },
            room=machine_code,
        )
        return True
    except Exception as e:
        logger.warning(f"⚠️ [SocketIO] emit job.start failed: {e}")
        return False


def dispatch_pending_jobs(machine_code: str) -> int:
    sent = 0
    for o in _get_pending_orders(machine_code):
        try:
            order_id = int(o["order_id"])
            charge_id = str(o["charge_id"])
        except Exception:
            continue

        items = _get_order_items(order_id)
        if not items:
            continue

        ok = emit_job_start(machine_code, job_id=charge_id, order_charge_id=charge_id, items=items)
        if ok:
            sent += 1
    return sent



def _auto_refund(charge_id: str) -> None:
    """Called in a background thread when machine reports ERROR state.
    Triggers a full refund via Omise and updates the order record."""
    try:
        from app.services.omise_service import OmisePaymentService  # lazy import
        svc = OmisePaymentService()
        refund = svc.create_refund(charge_id)
        if refund:
            # Mark the order with refunded status
            db = get_db()
            cur = db.cursor(dictionary=True)
            try:
                cur.execute(
                    """
                    UPDATE orders
                    SET status = 'refunded'
                    WHERE charge_id = %s
                    """,
                    (charge_id,),
                )
                db.commit()
                logger.info(
                    f"✅ [AutoRefund] Order for charge {charge_id} marked refunded "
                    f"(refund_id={refund.id})"
                )
            except Exception:
                db.rollback()
                raise
            finally:
                cur.close()
                db.close()
        else:
            logger.error(
                f"❌ [AutoRefund] Refund failed for charge {charge_id}; "
                "order remains as status='dispense_failed' — manual action required"
            )
    except ValueError as ve:
        # OmisePaymentService raises ValueError when OMISE_SECRET_KEY is missing
        logger.error(f"❌ [AutoRefund] Cannot refund — Omise not configured: {ve}")
    except Exception as exc:
        logger.exception(f"❌ [AutoRefund] Unexpected error refunding charge {charge_id}: {exc}")


def _insert_machine_event(data: Dict[str, Any]) -> None:
    machine_code = data.get("machine_code")
    job_id = data.get("job_id")
    event_type = data.get("event_type")
    state = data.get("state")
    seq = data.get("seq")
    order_charge_id = data.get("order_charge_id")
    payload = data.get("payload")

    if not machine_code or not job_id or not event_type or seq is None:
        raise ValueError("machine_code, job_id, event_type, seq are required")

    seq_int = int(seq)
    payload_json = _json_dumps_safe(payload)

    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            """
            INSERT INTO machine_job_events
                (machine_code, job_id, order_charge_id, event_type, state, seq, payload_json)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE id = id
            """,
            (
                machine_code,
                job_id,
                order_charge_id,
                event_type,
                state,
                seq_int,
                payload_json,
            ),
        )

        # Update status on terminal machine states
        if order_charge_id and event_type == "job.state" and state in ("DONE", "ERROR", "DISPENSING"):
            if state == "DONE":
                new_status = "completed"
            elif state == "DISPENSING":
                new_status = "dispensing"
            else:  # ERROR
                new_status = "dispense_failed"
            cur.execute(
                """
                UPDATE orders
                SET status = %s
                WHERE charge_id = %s
                """,
                (new_status, order_charge_id),
            )

        # touch last_active
        cur.execute(
            """
            UPDATE machines
            SET last_active = NOW()
            WHERE machine_code = %s
            """,
            (machine_code,),
        )

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()
        db.close()

    # Auto-refund: fire in a background thread so we don't block eventlet
    if order_charge_id and event_type == "job.state" and state == "ERROR":
        threading.Thread(
            target=_auto_refund,
            args=(order_charge_id,),
            daemon=True,
        ).start()

    # Broadcast event to machine room so browser UI (machine-ui) receives real-time updates.
    # This replaces the need for the browser to connect directly to the local agent SSE endpoint.
    if machine_code:
        try:
            sio.emit(
                "job_event_broadcast",
                data,
                room=machine_code,
            )
        except Exception as _be:
            logger.warning(f"⚠️ [SocketIO] broadcast job_event_broadcast failed: {_be}")


@sio.event
def connect(sid, environ, auth):
    ok, machine_code, reason = _verify_machine_auth(auth)
    if not ok:
        raise ConnectionRefusedError(reason)

    if not machine_code:
        machine_code = "UNKNOWN"

    sio.enter_room(sid, machine_code)
    _online_machines[machine_code] = sid
    _update_machine_presence(machine_code, online=True)

    sent = dispatch_pending_jobs(machine_code)
    logger.info(f"✅ [SocketIO] machine connected: {machine_code} (sid={sid}) pending_sent={sent}")


@sio.event
def disconnect(sid):
    machine_code = None
    for mc, stored_sid in list(_online_machines.items()):
        if stored_sid == sid:
            machine_code = mc
            _online_machines.pop(mc, None)
            break

    if machine_code:
        _update_machine_presence(machine_code, online=False)
        logger.info(f"🔌 [SocketIO] machine disconnected: {machine_code} (sid={sid})")


@sio.event
def machine_event(sid, data):
    if not isinstance(data, dict):
        return {"ok": False, "error": "invalid payload"}

    try:
        _insert_machine_event(data)
        return {"ok": True}
    except Exception as e:
        logger.error(f"❌ [SocketIO] machine_event ingest failed: {e}")
        return {"ok": False, "error": "ingest failed"}


@sio.event
def machine_ready(sid, data):
    # Agent can call this after reconnect to request resend of pending jobs
    machine_code = None
    if isinstance(data, dict):
        machine_code = data.get("machine_code") or data.get("machine_id")

    if not machine_code:
        return {"ok": False, "error": "machine_code required"}

    sent = dispatch_pending_jobs(str(machine_code))
    return {"ok": True, "sent": sent}


def make_socketio_app(flask_app):
    return socketio.WSGIApp(sio, flask_app)
