"""Admin upload for product catalogue images."""

import logging

from flask import jsonify, request

from app.api.admin import admin_bp
from app.api.admin.decorators import roles_required
from app.services.product_image_storage import save_product_image

logger = logging.getLogger(__name__)


@admin_bp.route("/products/upload-image", methods=["POST"])
@roles_required("admin")
def admin_upload_product_image():
    upload = request.files.get("file")
    if not upload:
        return jsonify({"error": "file is required"}), 400

    try:
        image_url = save_product_image(upload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.exception("admin_upload_product_image failed: %s", exc)
        return jsonify({"error": "failed to save image"}), 500

    return jsonify({"image_url": image_url}), 201
