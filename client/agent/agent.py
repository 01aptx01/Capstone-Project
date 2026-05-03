import logging
import os

from flask import Flask
from flask_cors import CORS

from routes import routes
from ws_client import start_ws_client

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(routes)
    return app


app = create_app()

# Start background Socket.IO client (server <-> agent room by MACHINE_ID)
start_ws_client()

logger.info("🚀 Hardware Agent starting on port 5000...")
_agent_url = os.environ.get("DOCKER_URL_AGENT", "http://localhost:5000")
_server_url = os.environ.get("DOCKER_URL_SERVER", "http://localhost:8000")
_pub = os.environ.get("DOCKER_PUBLISHED_PORT_AGENT", "5000")
logger.info("")
logger.info("=== vending-pi (hardware agent) ===")
logger.info("  Host browser:  %s", _agent_url)
logger.info("  Local (in container):   http://127.0.0.1:%s", _pub)
logger.info("  Network (listen):       http://0.0.0.0:%s", _pub)
logger.info("  API (from host):        %s", _server_url)
logger.info("")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)