import os
import logging
from flask import Flask, send_from_directory
from flask_cors import CORS
from flasgger import Swagger
from dotenv import load_dotenv
load_dotenv()

from app.api.buy import buy_api
from app.api.products import products_api
from app.api.health import health_api

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class ServerApp:
    def __init__(self, host: str = "0.0.0.0", port: int = 8000):
        self.host = host
        self.port = port
        self.app = Flask(__name__)
        
        # รันการตั้งค่าต่างๆ ตามลำดับ
        self._verify_environment()
        self._setup_extensions()
        self._register_blueprints()
        self._register_routes()

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
        self.app.run(host=self.host, port=self.port)

if __name__ == "__main__":
    server = ServerApp(host="0.0.0.0", port=8000)
    server.run()