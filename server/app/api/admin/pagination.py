"""Shared pagination helpers for admin list endpoints."""

import math

from flask import request


def get_pagination_params(default_per_page: int = 20, max_per_page: int = 100) -> tuple[int, int]:
    page = request.args.get("page", 1, type=int) or 1
    per_page = request.args.get("per_page", default_per_page, type=int) or default_per_page
    page = max(1, page)
    per_page = min(max(1, per_page), max_per_page)
    return page, per_page


def list_envelope(items: list, total: int, page: int, per_page: int) -> dict:
    pages = math.ceil(total / per_page) if per_page else 0
    return {
        "items": items,
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": pages,
    }
