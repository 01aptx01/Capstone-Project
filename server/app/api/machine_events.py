import json
import logging
from flask import Blueprint, request, jsonify

from app.db_config.db import get_db

logger = logging.getLogger(__name__)

machine_events_api = Blueprint("machine_events_api", __name__)


@machine_events_api.route("/api/machines/events", methods=["POST"])
def ingest_machine_event():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"status": "ERROR", "message": "Invalid JSON body"}), 400

    machine_code = data.get("machine_code")
    job_id = data.get("job_id")
    event_type = data.get("event_type")
    state = data.get("state")
    seq = data.get("seq")
    order_charge_id = data.get("order_charge_id")
    payload = data.get("payload")

    if not machine_code or not job_id or not event_type or seq is None:
        return (
            jsonify(
                {
                    "status": "ERROR",
                    "message": "machine_code, job_id, event_type, seq are required",
                }
            ),
            400,
        )

    try:
        seq_int = int(seq)
    except Exception:
        return jsonify({"status": "ERROR", "message": "seq must be an integer"}), 400

    payload_json = None
    if payload is not None:
        try:
            payload_json = json.dumps(payload, ensure_ascii=False)
        except Exception:
            payload_json = json.dumps({"unserializable": True})

    db = get_db()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute(
            """
            INSERT INTO machine_job_events
                (machine_code, job_id, order_charge_id, event_type, state, seq, payload_json)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                id = id
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
        db.commit()
        return jsonify({"status": "OK"}), 200

    except Exception as e:
        db.rollback()
        logger.error(f"❌ [MachineEvents] Failed to ingest event: {e}")
        return jsonify({"status": "ERROR", "message": "Failed to ingest event"}), 500

    finally:
        cur.close()
        db.close()
