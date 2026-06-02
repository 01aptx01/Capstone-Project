"""Save product catalogue images and resolve storage directory."""

from __future__ import annotations

import os
import uuid
from pathlib import Path

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_BYTES = 2 * 1024 * 1024


def product_images_dir() -> Path:
    raw = os.environ.get("PRODUCT_IMAGES_DIR", "").strip()
    if raw:
        return Path(raw)
    return Path(__file__).resolve().parents[2] / "static" / "product" / "img"


def save_product_image(file_storage: FileStorage) -> str:
    """Persist upload; return public path e.g. /product/img/<name>.png."""
    if not file_storage or not file_storage.filename:
        raise ValueError("file is required")

    original = secure_filename(file_storage.filename)
    ext = Path(original).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("unsupported file type (use PNG, JPG, WEBP, or GIF)")

    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    if size > MAX_BYTES:
        raise ValueError("file too large (max 2 MB)")

    directory = product_images_dir()
    directory.mkdir(parents=True, exist_ok=True)

    name = f"{uuid.uuid4().hex}{ext}"
    dest = directory / name
    file_storage.save(dest)

    return f"/product/img/{name}"
