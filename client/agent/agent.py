import logging
from dotenv import load_dotenv
load_dotenv()

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


from machine import bootstrap_machine

app = create_app()

# Initialize Hardware Machine Kiosk & LEDs
bootstrap_machine()

# Start background Socket.IO client (server <-> agent room by MACHINE_ID)
start_ws_client()

logger.info("🚀 Hardware Agent starting on port 5000...")

if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000, threaded=True)
    finally:
        from machine import machine
        machine.shutdown()