import logging
import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from flasgger import Swagger

load_dotenv()

from app.api.buy import buy_api
from app.api.health import health_api
from app.api.machine_events import machine_events_api
from app.api.members import members_api
from app.api.products import products_api
from app.db_config.db import init_db
from app.db_config.sqlalchemy_uri import build_sqlalchemy_database_uri
from app.extensions import db, migrate

logger = logging.getLogger(__name__)

def _resolve_swagger_path() -> str:
    """Docker: /app/swagger.yaml. Local dev: repo root next to server/."""
    base = os.path.dirname(__file__)
    candidates = (
        os.path.join(base, "..", "swagger.yaml"),
        os.path.join(base, "..", "..", "swagger.yaml"),
    )
    for p in candidates:
        ap = os.path.abspath(p)
        if os.path.isfile(ap):
            return ap
    return os.path.abspath(candidates[0])


_SWAGGER_FILE = _resolve_swagger_path()


def create_app() -> Flask:
    """Flask application factory (used by ServerApp, wsgi.py, and Flask-Migrate CLI)."""
    # Use flask_app (not app): `import app.models` would shadow a local named `app`.
    flask_app = Flask(__name__)

    if os.getenv("DEFER_DB_POOL") == "1":
        logger.info("🔧 [create_app] Skipping mysql.connector pool (DEFER_DB_POOL=1).")
    else:
        logger.info("🔧 [create_app] Initializing database connection pool...")
        init_db()

    flask_app.config["SQLALCHEMY_DATABASE_URI"] = build_sqlalchemy_database_uri()
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)

    import app.models  # noqa: F401

    allowed_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(flask_app, origins=allowed_origins)
    Swagger(flask_app, template_file=_SWAGGER_FILE)

    flask_app.register_blueprint(buy_api)
    flask_app.register_blueprint(products_api)
    flask_app.register_blueprint(health_api)
    flask_app.register_blueprint(machine_events_api)
    flask_app.register_blueprint(members_api)

    from app.api.admin import admin_bp

    flask_app.register_blueprint(admin_bp)

    @flask_app.route("/")
    def react_index():
        return send_from_directory("web-build", "index.html")

    @flask_app.route("/static/<path:path>")
    def react_static(path):
        return send_from_directory("web-build/static", path)

    @flask_app.route("/health")
    def health():
        return {"status": "server-ok"}

    return flask_app
