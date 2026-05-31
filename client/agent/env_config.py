"""อ่านค่า environment ของ Pi agent จากจุดเดียว."""
from __future__ import annotations

import os


def machine_code() -> str:
    """รหัสตู้ — ตรงกับ machines.machine_code ใน DB"""
    return (os.environ.get("MACHINE_CODE") or "MP1-001").strip()


def machine_token() -> str:
    """โทเคนจาก Admin สร้างตู้ (ส่งใน Socket.IO auth)"""
    return (os.environ.get("MACHINE_TOKEN") or "").strip()


def server_socket_url() -> str | None:
    """URL Flask + Socket.IO ที่ agent จะเชื่อม"""
    url = (os.environ.get("SERVER_SOCKET_URL") or "").strip()
    return url or None
