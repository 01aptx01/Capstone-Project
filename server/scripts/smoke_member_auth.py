#!/usr/bin/env python3
"""Smoke test: OTP send/verify + member orders auth."""

import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("SMOKE_API_URL", "http://localhost:8000").rstrip("/")
PHONE = os.environ.get("SMOKE_PHONE", "0631723422")


def req(method: str, path: str, body: dict | None = None, token: str | None = None):
    data = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE}{path}", data=data, headers=headers, method=method
    )
    with urllib.request.urlopen(request, timeout=15) as resp:
        return resp.status, json.loads(resp.read().decode())


def main() -> int:
    print(f"API: {BASE} phone: {PHONE}")

    status, send = req("POST", "/api/auth/otp/send", {"phone_number": PHONE})
    print("send", status, send)
    if status != 200:
        return 1

    code = os.environ.get("SMOKE_OTP", "123456")
    status, verified = req(
        "POST", "/api/auth/otp/verify", {"phone_number": PHONE, "code": code}
    )
    print("verify", status, {k: verified.get(k) for k in ("status", "phone_number")})
    if status != 200:
        return 1

    token = verified["access_token"]

    try:
        status, _ = req("GET", f"/api/members/{PHONE}/orders", token=None)
        print("orders without token", status, "(expect 401)")
        if status != 401:
            return 1
    except urllib.error.HTTPError as e:
        print("orders without token", e.code, "(expect 401)")
        if e.code != 401:
            return 1

    status, orders = req("GET", f"/api/members/{PHONE}/orders", token=token)
    print("orders with token", status, "count", len(orders.get("orders", [])))

    status, member = req("GET", f"/api/members/{PHONE}")
    print("member", status, "found", member.get("found"), "points", member.get("points"))

    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
