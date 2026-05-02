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
from app.config.db import init_db
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
        CORS(self.app)
        self.swagger = Swagger(self.app, template_file='swagger.yaml')

    def _register_blueprints(self):
        self.app.register_blueprint(buy_api)
        self.app.register_blueprint(products_api)
        self.app.register_blueprint(health_api)
        self.app.register_blueprint(machine_events_api)

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

    def run(self):
        logger.info(f"🚀 Starting server on {self.host}:{self.port}")
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