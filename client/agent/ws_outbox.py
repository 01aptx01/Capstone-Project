import json
import os
import sqlite3
import threading
import time
from typing import Any, Dict, List, Optional

_DB_LOCK = threading.Lock()


def _db_path() -> str:
    return os.environ.get("AGENT_DB_PATH") or "/data/agent.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path(), timeout=30, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def init_db() -> None:
    dir_name = os.path.dirname(_db_path())
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with _DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS event_outbox (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT NOT NULL,
                    seq INTEGER NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    sent_at INTEGER NULL,
                    UNIQUE(job_id, seq)
                )
                """
            )
            conn.commit()
        finally:
            conn.close()


def enqueue_event(payload: Dict[str, Any]) -> None:
    """Persist an event to the outbox (idempotent by job_id+seq)."""
    job_id = payload.get("job_id")
    seq = payload.get("seq")
    if not job_id or seq is None:
        return

    try:
        seq_int = int(seq)
    except Exception:
        return

    init_db()

    with _DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                INSERT OR IGNORE INTO event_outbox (job_id, seq, payload_json, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (str(job_id), seq_int, json.dumps(payload, ensure_ascii=False), int(time.time())),
            )
            conn.commit()
        finally:
            conn.close()


def get_pending(limit: int = 100) -> List[Dict[str, Any]]:
    init_db()
    with _DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                """
                SELECT job_id, seq, payload_json
                FROM event_outbox
                WHERE sent_at IS NULL
                ORDER BY created_at ASC
                LIMIT ?
                """,
                (int(limit),),
            )
            rows = cur.fetchall() or []
            out: List[Dict[str, Any]] = []
            for job_id, seq, payload_json in rows:
                try:
                    out.append(json.loads(payload_json))
                except Exception:
                    # skip corrupted row
                    continue
            return out
        finally:
            conn.close()


def mark_sent(job_id: str, seq: int) -> None:
    init_db()
    with _DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                UPDATE event_outbox
                SET sent_at = ?
                WHERE job_id = ? AND seq = ?
                """,
                (int(time.time()), str(job_id), int(seq)),
            )
            conn.commit()
        finally:
            conn.close()
