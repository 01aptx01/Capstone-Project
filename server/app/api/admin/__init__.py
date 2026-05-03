"""Admin API blueprint — isolated under /api/admin."""

from flask import Blueprint

admin_bp = Blueprint("admin_api", __name__, url_prefix="/api/admin")

from app.api.admin import users  # noqa: E402, F401
from app.api.admin import admin_products  # noqa: E402, F401
from app.api.admin import admin_machines  # noqa: E402, F401
from app.api.admin import admin_customers  # noqa: E402, F401
from app.api.admin import admin_orders  # noqa: E402, F401
from app.api.admin import admin_coupons  # noqa: E402, F401
