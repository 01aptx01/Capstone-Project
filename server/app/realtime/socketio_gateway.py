import json
import logging
import os
import threading
import time
from typing import Any, Dict, Optional, Tuple

import bcrypt
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


def _verify_machine_token_auth(machine_id: str, raw_token: str) -> Tuple[bool, str]:
    """Validate raw token against ``machines.secret_token_hash`` (bcrypt)."""
    if not machine_id or not raw_token:
        return False, "machine_id and token required"

    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT secret_token_hash
            FROM machines
            WHERE machine_code = %s
            LIMIT 1
            """,
            (machine_id,),
        )
        row = cur.fetchone()
        if not row:
            return False, "unknown machine_id"
        stored = row.get("secret_token_hash")
        if not stored:
            return False, "machine has no enrolled token"
        if isinstance(stored, bytes):
            stored_b = stored
        else:
            stored_b = str(stored).encode("utf-8")
        try:
            if not bcrypt.checkpw(raw_token.encode("utf-8"), stored_b):
                return False, "invalid token"
        except ValueError:
            return False, "invalid token"
        return True, "ok"
    finally:
        cur.close()
        db.close()


sio = socketio.Server(
    async_mode="eventlet",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

ADMIN_ROOM = "admin"


def _verify_admin_auth(auth: Optional[Dict[str, Any]]) -> bool:
    """Admin dashboard Socket.IO clients join ADMIN_ROOM when auth passes."""
    admin_secret = os.environ.get("ADMIN_SOCKET_SECRET")
    if not admin_secret:
        return isinstance(auth, dict) and auth.get("role") == "admin"
    return isinstance(auth, dict) and auth.get("admin_token") == admin_secret


def emit_dashboard_update(payload: Dict[str, Any]) -> None:
    """Broadcast telemetry to all admin dashboard clients."""
    try:
        sio.emit("dashboard_update", payload, room=ADMIN_ROOM)
    except Exception as e:
        logger.warning(f"[SocketIO] emit dashboard_update failed: {e}")


_online_machines: Dict[str, str] = {}


def _update_machine_is_online(machine_code: str, *, online: bool) -> None:
    """Persist Socket.IO presence on ``machines.is_online`` (and touch ``last_active``)."""
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            """
            UPDATE machines
            SET is_online = %s, last_active = NOW()
            WHERE machine_code = %s
            """,
            (1 if online else 0, machine_code),
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("[SocketIO] failed to update is_online for %s", machine_code)
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

    event_id_for_socket: Optional[int] = None
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
        cur.execute(
            """
            SELECT id FROM machine_job_events
            WHERE job_id = %s AND seq = %s
            LIMIT 1
            """,
            (job_id, seq_int),
        )
        _id_row = cur.fetchone()
        if _id_row and _id_row.get("id") is not None:
            event_id_for_socket = int(_id_row["id"])

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

    dash_payload: Dict[str, Any] = {
        "type": "machine_event",
        "machine_code": machine_code,
        "event_type": event_type,
        "state": state,
        "job_id": job_id,
        "ts": _now_ts(),
    }
    if state == "ERROR" and event_id_for_socket is not None:
        dash_payload["event_id"] = event_id_for_socket
    emit_dashboard_update(dash_payload)


@sio.event
def connect(sid, environ, auth):
    # Admin dashboard (browser) — join fleet-wide telemetry room
    if isinstance(auth, dict) and (
        "admin_token" in auth or auth.get("role") == "admin"
    ):
        if not _verify_admin_auth(auth):
            raise ConnectionRefusedError("invalid admin token")
        sio.enter_room(sid, ADMIN_ROOM)
        logger.info(f"[SocketIO] admin dashboard connected (sid={sid})")
        return

    if not isinstance(auth, dict):
        raise ConnectionRefusedError("missing auth")

    machine_id = auth.get("machine_id") or auth.get("machine_code")
    raw_token = auth.get("token")
    if machine_id is None or raw_token is None:
        raise ConnectionRefusedError("machine_id and token required in auth")

    machine_code = str(machine_id).strip()
    token_str = str(raw_token)
    if not machine_code or not token_str:
        raise ConnectionRefusedError("machine_id and token required in auth")

    ok, reason = _verify_machine_token_auth(machine_code, token_str)
    if not ok:
        raise ConnectionRefusedError(reason)

    sio.enter_room(sid, machine_code)
    _online_machines[machine_code] = sid
    _update_machine_is_online(machine_code, online=True)

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
        _update_machine_is_online(machine_code, online=False)
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
