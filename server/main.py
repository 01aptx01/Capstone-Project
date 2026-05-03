import os
import logging
from dotenv import load_dotenv
load_dotenv()

import eventlet
eventlet.monkey_patch()
import eventlet.wsgi

from flask import Flask, send_from_directory
from flask_cors import CORS
from flasgger import Swagger

from app.api.buy import buy_api
from app.api.products import products_api
from app.api.health import health_api
from app.api.machine_events import machine_events_api
from app.api.members import members_api
from app.config.db import init_db, get_db, get_db_cursor
from app.realtime.socketio_gateway import make_socketio_app

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class ServerApp:
    def __init__(self, host: str = "0.0.0.0", port: int = 8000):
        self.host = host
        self.port = port
        self.app = Flask(__name__)
        
        # รันการตั้งค่าต่างๆ ตามลำดับ
        logger.info("🔧 [ServerApp] Initializing database connection pool...")
        init_db()
        
        self._verify_environment()
        self._setup_extensions()
        self._register_blueprints()
        self._register_routes()

        # Wrap Flask with Socket.IO gateway (Rooms by MACHINE_ID)
        self.wsgi_app = make_socketio_app(self.app)

    def _verify_environment(self):
        omise_key = os.environ.get("OMISE_SECRET_KEY")
        if not omise_key:
            logger.warning("⚠️ WARNING: OMISE_SECRET_KEY is NOT set in environment!")
        else:
            logger.info(f"✅ Omise Keys Loaded (Secret key ends with ...{omise_key[-4:]})")

    def _setup_extensions(self):
        # Restrict CORS to known origins only (configurable via CORS_ORIGINS env var)
        # Default allows machine-ui dev server; set to specific domain in production.
        allowed_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
        CORS(self.app, origins=allowed_origins)
        self.swagger = Swagger(self.app, template_file='swagger.yaml')

    def _register_blueprints(self):
        self.app.register_blueprint(buy_api)
        self.app.register_blueprint(products_api)
        self.app.register_blueprint(health_api)
        self.app.register_blueprint(machine_events_api)
        self.app.register_blueprint(members_api)

    def _register_routes(self):
        @self.app.route("/")
        def react_index():
            return send_from_directory("web-build", "index.html")

        @self.app.route("/static/<path:path>")
        def react_static(path):
            return send_from_directory("web-build/static", path)

        @self.app.route("/health")
        def health():
            return {"status": "server-ok"}

    def _background_sweeper(self):
        """Background job to sweep and auto-cancel zombie orders stuck in pending_payment."""
        logger.info("🧹 [Sweeper] Background zombie order sweeper started")
        while True:
            try:
                with get_db_cursor() as (db, cur):
                    cur.execute(
                        """
                        UPDATE orders
                        SET status = 'cancelled'
                        WHERE status = 'pending_payment'
                          AND created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                        """
                    )
                    db.commit()
                    if cur.rowcount > 0:
                        logger.info(f"🧹 [Sweeper] Auto-cancelled {cur.rowcount} zombie order(s)")
            except Exception as e:
                logger.error(f"❌ [Sweeper] Error in sweeper: {e}")
            # Sleep for 5 minutes before next sweep
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
        
        # Start all background sweepers
        eventlet.spawn(self._background_sweeper)
        eventlet.spawn(self._user_maintenance_sweeper)
        eventlet.spawn(self._events_cleanup_sweeper)

        socketio_enabled = os.getenv("SOCKETIO_ENABLED", "1") != "0"
        if socketio_enabled:
            listener = eventlet.listen((self.host, self.port))
            eventlet.wsgi.server(listener, self.wsgi_app)
        else:
            self.app.run(host=self.host, port=self.port)

if __name__ == "__main__":
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    server = ServerApp(host=host, port=port)
    server.run()