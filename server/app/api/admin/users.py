"""Boilerplate admin user routes."""

from flask import jsonify

from app.api.admin import admin_bp
from app.api.admin.decorators import admin_required


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_admin_users():
    """Placeholder until auth and CRUD are wired to AdminUser."""
    return jsonify({"users": []}), 200
