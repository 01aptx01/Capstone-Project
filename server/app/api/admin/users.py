"""Boilerplate admin user routes."""

from flask import jsonify

from app.api.admin import admin_bp


@admin_bp.route("/users", methods=["GET"])
def list_admin_users():
    """Placeholder until auth and CRUD are wired to AdminUser."""
    return jsonify({"users": []}), 200
