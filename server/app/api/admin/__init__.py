"""Admin API blueprint — isolated under /api/admin."""

from flask import Blueprint

admin_bp = Blueprint("admin_api", __name__, url_prefix="/api/admin")

from app.api.admin import users  # noqa: E402, F401
