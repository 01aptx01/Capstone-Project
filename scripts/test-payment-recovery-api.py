#!/usr/bin/env python3
"""รันจาก host: docker exec vending-server python /app/scripts/test-payment-recovery-api.py
หรือ copy ไปใน container แล้วรันกับ base URL ภายใน compose
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

BASE = "http://localhost:8000"
MACHINE = "MP1-001"


def call(method: str, path: str, body: dict | None = None) -> tuple[int, dict]:
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if body else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as res:
            return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}
        return e.code, payload


def ok(name: str, cond: bool, detail: str = "") -> bool:
    mark = "PASS" if cond else "FAIL"
    print(f"  [{mark}] {name}" + (f" — {detail}" if detail else ""))
    return cond


def main() -> int:
    print("=== Payment recovery API smoke test ===\n")
    passed = 0
    total = 0

    _, health = call("GET", "/health")
    total += 1
    if ok("health", health.get("status") == "server-ok", str(health)):
        passed += 1

    _, ao0 = call("GET", f"/api/buy/active-order?machine_code={MACHINE}")
    total += 1
    if ok("active-order idle", ao0.get("busy") is False, str(ao0)):
        passed += 1

    code, draft = call(
        "POST",
        "/api/buy/create-draft",
        {
            "machine_code": MACHINE,
            "cart": [{"product_id": 1, "quantity": 1}],
            "payment_method": "credit_card",
        },
    )
    cid = draft.get("charge_id", "")
    total += 1
    if ok("create-draft", code == 200 and cid.startswith("draft_"), str(draft)):
        passed += 1
    else:
        print("\nAbort: cannot continue without draft")
        return 1

    _, st = call("GET", f"/api/buy/status/{cid}")
    total += 1
    if ok(
        "status pending (no qr on draft)",
        st.get("status") == "pending_payment" and not st.get("qr_code"),
        str(st),
    ):
        passed += 1

    _, ao_busy = call("GET", f"/api/buy/active-order?machine_code={MACHINE}")
    total += 1
    if ok("active-order busy", ao_busy.get("busy") is True, str(ao_busy)):
        passed += 1

    _, ao_ex = call(
        "GET",
        f"/api/buy/active-order?machine_code={MACHINE}&exclude_charge_id={cid}",
    )
    total += 1
    if ok("active-order exclude self", ao_ex.get("busy") is False, str(ao_ex)):
        passed += 1

    code, cancel = call("POST", "/api/buy/cancel", {"charge_id": cid})
    total += 1
    if ok("cancel draft", code == 200 and cancel.get("status") == "cancelled", str(cancel)):
        passed += 1

    _, ao1 = call("GET", f"/api/buy/active-order?machine_code={MACHINE}")
    total += 1
    if ok("active-order after cancel", ao1.get("busy") is False, str(ao1)):
        passed += 1

    print(f"\n=== Result: {passed}/{total} passed ===")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
