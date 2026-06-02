import os
import logging
from dotenv import load_dotenv
load_dotenv()

import eventlet
eventlet.monkey_patch()
import eventlet.wsgi

from app.db_config.db import get_db_cursor
from app.factory import create_app
from app.realtime.socketio_gateway import make_socketio_app

# Configure logger
logger = logging.getLogger(__name__)
# Ensure our startup banner always prints (some libs configure logging early)
logging.basicConfig(level=logging.INFO, force=True, format="%(message)s")


def _print_docker_service_urls() -> None:
    """Log host vs in-container URLs (set by docker-compose environment)."""
    s = os.environ.get("DOCKER_URL_SERVER", "http://localhost:8000")
    mu = os.environ.get("DOCKER_URL_MACHINE_UI", "http://localhost:3000")
    au = os.environ.get("DOCKER_URL_ADMIN_UI", "http://localhost:3001")
    sw = os.environ.get("DOCKER_URL_SWAGGER", "http://localhost:8081")
    ag = os.environ.get("DOCKER_URL_AGENT", "http://localhost:5000")
    db = os.environ.get("DOCKER_URL_DB", "mysql://localhost:3307")
    pub = os.environ.get("DOCKER_PUBLISHED_PORT_SERVER", "8000")
    # Runtime config (avoid printing secrets)
    db_host = os.environ.get("DB_HOST", "localhost")
    db_name = os.environ.get("DB_NAME", "vending")
    db_user = os.environ.get("DB_USER", "root")
    cors = os.environ.get("CORS_ORIGINS", "")
    socketio_enabled = os.getenv("SOCKETIO_ENABLED", "1") != "0"
    from app.services.hardware_service import HardwareAgentService
    agent_url = HardwareAgentService.agent_base_url()
    kiosk_lock = bool((os.environ.get("KIOSK_SOCKET_SECRET") or "").strip())

    logger.info("")
    logger.info("=== vending-server (Flask + Socket.IO) ===")
    logger.info("host.url=%s | listen=http://0.0.0.0:%s | local=http://127.0.0.1:%s", s, pub, pub)
    logger.info("ws.enabled=%s | dispatch=socket | agent.health=%s | kiosk.secret=%s", str(socketio_enabled).lower(), agent_url or "<unset>", str(kiosk_lock).lower())
    logger.info("db=mysql://%s@%s/%s | cors.origins=%s", db_user, db_host, db_name, cors or "<unset>")
    logger.info("ui.machine=%s | ui.admin=%s | ui.swagger=%s | agent.host=%s | db.host=%s", mu, au, sw, ag, db)
    logger.info("")


class ServerApp:
    def __init__(self, host: str = "0.0.0.0", port: int = 8000):
        self.host = host
        self.port = port
        self.app = create_app()
        self._verify_environment()

        # Wrap Flask with Socket.IO gateway (rooms by machine_code)
        self.wsgi_app = make_socketio_app(self.app)

    def _verify_environment(self):
        omise_key = os.environ.get("OMISE_SECRET_KEY")
        if not omise_key:
            logger.warning("⚠️ WARNING: OMISE_SECRET_KEY is NOT set in environment!")
        else:
            logger.info(f"✅ Omise Keys Loaded (Secret key ends with ...{omise_key[-4:]})")

    def _background_sweeper(self):
        """Reconcile then cancel stale pending_payment (Omise check before cancel)."""
        from app.api.buy import buy_controller
        from app.services.buy_service import InventoryService

        inventory = InventoryService()
        logger.info("🧹 [Sweeper] Pending-payment reconcile sweeper started")
        while True:
            try:
                charge_ids = inventory.list_stale_pending_charge_ids()
                reconciled = 0
                for charge_id in charge_ids:
                    before = "pending_payment"
                    after = buy_controller.reconcile_pending_charge(charge_id)
                    if after != before:
                        reconciled += 1
                if reconciled:
                    logger.info(
                        "🧹 [Sweeper] Reconciled %s stale pending order(s)",
                        reconciled,
                    )
            except Exception as e:
                logger.error(f"❌ [Sweeper] Error in sweeper: {e}")
            eventlet.sleep(300)

    def _stale_paid_sweeper(self):
        """Mark paid/dispensing orders stuck too long as dispense_failed and trigger refund."""
        import threading as _t

        from app.realtime.socketio_gateway import _auto_refund
        from app.services.buy_service import InventoryService

        inventory = InventoryService()
        logger.info("⏱️ [Sweeper] Stale paid/dispensing order sweeper started")
        while True:
            try:
                charge_ids = inventory.fail_stale_paid_orders()
                for charge_id in charge_ids:
                    _t.Thread(
                        target=_auto_refund, args=(charge_id,), daemon=True
                    ).start()
                if charge_ids:
                    logger.info(
                        "⏱️ [Sweeper] Failed %s stale paid/dispensing order(s), refund queued",
                        len(charge_ids),
                    )
            except Exception as e:
                logger.error("❌ [Sweeper] Error in stale paid sweeper: %s", e)
            eventlet.sleep(300)

    def _user_maintenance_sweeper(self):
        """Background job to sweep and auto-suspend users inactive for > 1 year."""
        logger.info("👤 [Maintenance] User inactivity sweeper started")
        while True:
            try:
                with get_db_cursor() as (db, cur):
                    cur.execute(
                        """
                        UPDATE users 
                        SET status = 'suspended' 
                        WHERE last_use < DATE_SUB(NOW(), INTERVAL 1 YEAR)
                          AND status = 'active'
                        """
                    )
                    db.commit()
                    if cur.rowcount > 0:
                        logger.info(f"👤 [Maintenance] Suspended {cur.rowcount} inactive user(s)")
            except Exception as e:
                logger.error(f"❌ [Maintenance] Error in user maintenance: {e}")
            # Run once every 24 hours
            eventlet.sleep(86400)

    def _events_cleanup_sweeper(self):
        """Background job to delete machine_job_events older than 90 days.
        Uses LIMIT to avoid long table locks on large datasets."""
        logger.info("🗑️ [Cleanup] Machine job events cleanup sweeper started")
        while True:
            try:
                total_deleted = 0
                # Delete in batches of 10,000 to avoid long locks
                while True:
                    with get_db_cursor() as (db, cur):
                        cur.execute(
                            """
                            DELETE FROM machine_job_events
                            WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
                            LIMIT 10000
                            """
                        )
                        db.commit()
                        deleted = cur.rowcount
                    total_deleted += deleted
                    if deleted < 10000:
                        break  # no more rows to delete
                    eventlet.sleep(1)  # brief pause between batches
                if total_deleted > 0:
                    logger.info(f"🗑️ [Cleanup] Deleted {total_deleted} old machine_job_events")
            except Exception as e:
                logger.error(f"❌ [Cleanup] Error in events cleanup: {e}")
            # Run once every 24 hours
            eventlet.sleep(86400)

    def run(self):
        logger.info(f"🚀 Starting server on {self.host}:{self.port}")
        _print_docker_service_urls()

        # Start all background sweepers
        eventlet.spawn(self._background_sweeper)
        eventlet.spawn(self._stale_paid_sweeper)
        eventlet.spawn(self._user_maintenance_sweeper)
        eventlet.spawn(self._events_cleanup_sweeper)

        socketio_enabled = os.getenv("SOCKETIO_ENABLED", "1") != "0"
        if socketio_enabled:
            from app.cors_config import (
                cors_allow_headers,
                cors_allow_methods,
                is_allowed_origin,
            )

            class CorsMiddleware:
                def __init__(self, wsgi_app):
                    self.wsgi_app = wsgi_app

                def _cors_headers(self, origin: str | None) -> list[tuple[str, str]]:
                    from app.cors_config import normalize_origin

                    o = normalize_origin(origin)
                    if not o or not is_allowed_origin(o):
                        return []
                    return [
                        ("Access-Control-Allow-Origin", o),
                        ("Access-Control-Allow-Credentials", "true"),
                        ("Access-Control-Allow-Headers", cors_allow_headers()),
                        ("Access-Control-Allow-Methods", cors_allow_methods()),
                    ]

                def __call__(self, environ, start_response):
                    origin = environ.get("HTTP_ORIGIN")
                    if environ.get("REQUEST_METHOD") == "OPTIONS":
                        headers = self._cors_headers(origin)
                        if not headers:
                            start_response("403 Forbidden", [("Content-Length", "0")])
                            return [b""]
                        headers.append(("Content-Length", "0"))
                        start_response("200 OK", headers)
                        return [b""]

                    def custom_start_response(status, headers, exc_info=None):
                        headers_dict = {k.lower(): v for k, v in headers}
                        if (
                            is_allowed_origin(origin)
                            and "access-control-allow-origin" not in headers_dict
                        ):
                            headers.extend(self._cors_headers(origin))
                        return start_response(status, headers, exc_info)

                    return self.wsgi_app(environ, custom_start_response)

            wrapped_wsgi = CorsMiddleware(self.wsgi_app)
            listener = eventlet.listen((self.host, self.port))
            eventlet.wsgi.server(listener, wrapped_wsgi)
        else:
            self.app.run(host=self.host, port=self.port)

if __name__ == "__main__":
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    server = ServerApp(host=host, port=port)
    server.run()