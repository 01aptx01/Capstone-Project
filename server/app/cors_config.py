"""Shared CORS origin list from CORS_ORIGINS (comma-separated)."""

from __future__ import annotations

import os

_DEFAULT_ORIGINS = (
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:8081",
    "http://localhost:8000",
)


def cors_origins_list() -> list[str]:
    raw = (os.environ.get("CORS_ORIGINS") or "").strip()
    if not raw:
        return list(_DEFAULT_ORIGINS)
    return [o.strip() for o in raw.split(",") if o.strip()]


def normalize_origin(origin: str | None) -> str | None:
    if not origin:
        return None
    o = origin.strip()
    return o or None


def is_allowed_origin(origin: str | None) -> bool:
    o = normalize_origin(origin)
    return bool(o and o in cors_origins_list())


def cors_allow_headers() -> str:
    return "Content-Type,Authorization"


def cors_allow_methods() -> str:
    return "GET,POST,PUT,PATCH,DELETE,OPTIONS"
