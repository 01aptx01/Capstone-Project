# How to run (Docker) — Smart Vending Capstone

This guide walks you through running the full stack with **Docker Compose**, configuring **environment variables**, **registering a vending machine** in the admin UI, and aligning the **hardware agent** and **machine UI** with that machine. It is written for developers on Windows, macOS, or Linux.

---

## Table of contents

1. [What runs in Docker](#1-what-runs-in-docker)
2. [Prerequisites](#2-prerequisites)
3. [One-time environment setup](#3-one-time-environment-setup)
4. [Start the stack](#4-start-the-stack)
5. [Published URLs and ports](#5-published-urls-and-ports)
6. [Verify the stack](#6-verify-the-stack)
7. [Adding a new machine (“ตู้”) end-to-end](#7-adding-a-new-machine-ตู้-end-to-end)
8. [Important notes about seeded data `MP1-001`](#8-important-notes-about-seeded-data-mp1-001)
9. [Changing machine code after the first build](#9-changing-machine-code-after-the-first-build)
10. [Stopping and cleaning up](#10-stopping-and-cleaning-up)
11. [Raspberry Pi agent only](#11-raspberry-pi-agent-only-hardware-on-the-board)
12. [Troubleshooting](#12-troubleshooting)
13. [Reference files](#13-reference-files)

---

## 1. What runs in Docker

From [docker-compose.yml](docker-compose.yml), the default stack includes:

| Service       | Role |
|---------------|------|
| `db`          | MySQL 8, schema + seed from [database/init.sql](database/init.sql) on **first** volume init |
| `server`      | Flask API, Socket.IO gateway, Swagger; reads root [.env](.env) via `env_file` |
| `client`      | Python hardware **agent** (simulated Pi in Docker); connects to `server` over the internal network |
| `machine-ui`  | Next.js customer touchscreen UI (built with `NEXT_PUBLIC_*` inlined at **image build** time) |
| `admin-ui`    | Next.js admin dashboard |
| `swagger-ui`  | Swagger UI container pointing at [swagger.yaml](swagger.yaml) |

---

## 2. Prerequisites

- **Docker Desktop** (Windows/macOS) or **Docker Engine + Compose plugin** (Linux).
- **Git** (to clone the repository).
- **Omise test keys** if you want payments to work in test mode ([Omise dashboard](https://dashboard.omise.co/)).
- Enough free RAM/disk for MySQL + Node builds (first `docker compose up --build` can take several minutes).

---

## 3. One-time environment setup

### 3.1 Create the root `.env`

At the **repository root** (same folder as [docker-compose.yml](docker-compose.yml)):

**Windows (PowerShell or CMD):**

```bat
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Compose substitutes `${VARIABLE}` values from this **root** `.env` when parsing [docker-compose.yml](docker-compose.yml). The agent container does **not** automatically load `client/agent/.env` for Compose overrides unless you wire that yourself; for Docker, **prefer the root `.env`**.

### 3.2 Minimum variables to edit

Open `.env` in an editor and set at least:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | Omise public key (browser / Next.js builds) |
| `OMISE_SECRET_KEY` | Omise secret key (Flask server) |

Database defaults in [.env.example](.env.example) match Compose (`DB_HOST=db`, `DB_USER=root`, `DB_PASSWORD=root`, `DB_NAME=vending`). Change them only if you change MySQL in [docker-compose.yml](docker-compose.yml).

### 3.3 Machine-related variables (after you create a machine in Admin)

You will set these in **Section 7**. Summary:

| Variable | Used by | Purpose |
|----------|---------|---------|
| `MACHINE_CODE` | `client` service | Must equal `machines.machine_code` in MySQL |
| `MACHINE_TOKEN` | `client` service | Plaintext token returned once from Admin “Create machine”; server stores bcrypt hash |
| `NEXT_PUBLIC_MACHINE_CODE` | **machine-ui image build** | Socket.IO room for the kiosk UI; baked at **build** time |
| `KIOSK_SOCKET_SECRET` | **server** | Required — locks kiosk Socket.IO connections |
| `NEXT_PUBLIC_KIOSK_SOCKET_SECRET` | **machine-ui build** | Must match `KIOSK_SOCKET_SECRET` exactly |

Other useful entries (see [.env.example](.env.example)):

- `SERVER_SOCKET_URL=http://server:8000` — agent → server Socket.IO (inside Docker).
- `NEXT_PUBLIC_API_URL=http://localhost:8000` — REST API from the host browser.
- `NEXT_PUBLIC_SERVER_SOCKET_URL` — optional; defaults to `NEXT_PUBLIC_API_URL`.
- Dispense after payment uses **Socket.IO only** (`job.start`); manual test: `POST http://localhost:5000/jobs/start`.

---

## 4. Start the stack

From the repository root:

```bash
docker compose up --build
```

- First run: MySQL initializes from [database/init.sql](database/init.sql); the `db` service exposes **host port `3307`** → container `3306`.
- Wait until logs show the database healthy and the server responding (Compose defines healthchecks for `db` and `server`).

**Detached mode** (background):

```bash
docker compose up --build -d
```

**Follow agent logs:**

```bash
docker logs -f vending-pi
```

---

## 5. Published URLs and ports

These are the **host** URLs (from your machine running Docker):

| Resource | URL |
|----------|-----|
| Customer UI (machine-ui) | [http://localhost:3000](http://localhost:3000) |
| Admin UI | [http://localhost:3001](http://localhost:3001) |
| API + Socket.IO | [http://localhost:8000](http://localhost:8000) |
| API docs (Flasgger) | [http://localhost:8000/apidocs](http://localhost:8000/apidocs) |
| Hardware agent (Docker) | [http://localhost:5000](http://localhost:5000) |
| Swagger UI (static OpenAPI) | [http://localhost:8081](http://localhost:8081) |
| MySQL (from host) | `localhost:3307` (user `root`, password from compose / `.env`) |

Internal-only hostname **`server`** is reachable from other containers (e.g. agent uses `http://server:8000` for Socket.IO).

---

## 6. Verify the stack

1. **API health:** open [http://localhost:8000/health](http://localhost:8000/health) — expect a small JSON OK payload.
2. **Customer UI:** open [http://localhost:3000](http://localhost:3000).
3. **Admin UI:** open [http://localhost:3001](http://localhost:3001).
4. **Database:** optional — connect with any MySQL client to `127.0.0.1:3307` using credentials from `.env` / compose.

### 6.1 End-to-end purchase checklist (Socket-only flow)

Use this after [.env](.env) matches [.env.example](.env.example) and you completed Section 7:

| Step | Check |
|------|--------|
| 1 | Admin → create machine → copy `machine_code` + `secret_token` into root `.env` (`MACHINE_CODE`, `MACHINE_TOKEN`) |
| 2 | `KIOSK_SOCKET_SECRET` = `NEXT_PUBLIC_KIOSK_SOCKET_SECRET`; `NEXT_PUBLIC_MACHINE_CODE` matches `MACHINE_CODE` |
| 3 | `docker compose up --build` — server starts (non-empty `KIOSK_SOCKET_SECRET`) |
| 4 | `docker logs vending-pi` (or `client` service) shows WebSocket connected (not auth retry loop) — **required before purchase** |
| 5 | Browser [machine-ui](http://localhost:3000) — no full-screen “ระบบขัดข้องชั่วคราว” overlay; devtools: no kiosk secret / Socket auth errors |
| 6 | Add slot inventory for your `machine_code` in Admin if not using seeded `MP1-001` slots |
| 7 | Purchase (card or mock-pay) — server log: `job.start` emitted; if Pi was offline, warning then replay on reconnect |
| 8 | UI advances via **`job_event_broadcast`** (not only 60s fallback countdown) |
| 9 | Pi agent: Section 11 checklist — Admin Socket online + `machine_job_events` after purchase |
| 10 | Card + NFC: agent log `POST /nfc/arm` 200 + `[NFC] armed` in browser console before tap |
| 11 | Pi offline during dispense: UI shows blue “still processing” banner, then succeeds when Pi reconnects (order poll) |

### 6.2 Edge cases (NFC, Pi offline, agent DB)

**Pre-payment hardware gate:** Before any successful payment, Machine UI blocks the whole screen until the **Pi agent** is online (`machine_presence` / `isAgentOnline`). If the kiosk Socket is down, the overlay says “สัญญาณขัดข้องชั่วคราว”; if the kiosk is up but Pi is not, it says “ระบบขัดข้องชั่วคราว — กำลังพยายามเชื่อมต่อตู้”. After payment (numpad / processing), the UI does **not** use this full-page blocker — it keeps the existing processing banners and order-status poll.

**Docker dev:** You must run the **`client`** service (container `vending-pi`) or a real Pi agent with matching `MACHINE_CODE` / `MACHINE_TOKEN`. Without it, checkout is intentionally blocked on the main screen.

**Active order lock (หลังรีเฟรช / ซื้อซ้ำ):** Kiosk polls `GET /api/buy/active-order?machine_code=…` (optional `exclude_charge_id` for the current payment draft) and blocks the main screen while the machine has `paid` / `dispensing`, or `pending_payment` **younger than 5 minutes** (สอดคล้อง Omise QR). ก่อนตัดสิน `busy` server จะ **reconcile กับ Omise** ทุก `pending_payment` บนตู้ — ถ้าจ่ายแล้วจะอัปเดตเป็น `paid` และสั่ง dispense. Draft/รายการเก่ากว่า 5 นาทีจะถูก cancel (หลังเช็ค Omise) โดย sweeper และทุกครั้งที่เรียก `active-order`. Machine UI เก็บ `charge_id` ใน `sessionStorage` หลังรีโหลดเพื่อแสดงปุ่ม **ดำเนินการต่อ** / **ยกเลิกรายการ**. `checkout` / `create-draft` return **409 `MACHINE_BUSY`** if blocked.

**Stale paid/dispensing:** A second sweeper (every 5 minutes) marks orders stuck in `paid` / `dispensing` for more than **45 minutes** as `dispense_failed` and queues Omise refund — so the kiosk is not locked forever if the Pi never finishes.

| Scenario | Expected behavior |
|----------|-------------------|
| รีเฟรชกลางจ่ายของ แต่ order ยัง `paid`/`dispensing` | หน้าหลัก overlay “ตู้กำลังดำเนินการออเดอร์ก่อนหน้า”; สั่งซื้อใหม่ไม่ได้จน order จบ |
| ชำระเงินอยู่ (มี draft ของ session) | `exclude_charge_id` — ไม่โดน overlay ทับ payment modal |
| `pending_payment` เกิน 5 นาที | Reconcile Omise ก่อน → cancel ถ้าไม่จ่าย → ซื้อใหม่ได้ |
| `paid`/`dispensing` ค้าง > 45 นาที | Sweeper → `dispense_failed` + refund queue → ซื้อใหม่ได้ |
| Pi agent offline **before** pay | Full-screen overlay; checkout / payment handlers no-op |
| Pi agent offline **after** pay | No full-page overlay; orange/blue processing banners + order poll (~2 min) |
| Tap NFC before payment step 2 / before draft | Agent log `ignored (not armed)` — no charge |
| Tap after `create-draft` + arm | Checkout proceeds (`[NFC] tapped` in console) |
| `create-draft` fails | Payment modal shows red error, returns to step 1 |
| Pi agent offline after pay | Server keeps order `paid`, replays `job.start` on reconnect; UI polls order status up to ~2 min |
| Duplicate `job.start` | Server skips orders that already have rows in `machine_job_events`; Pi skips if job already in memory |
| Pi `AGENT_DB_PATH` wrong | Use writable path e.g. `./data/agent.db` on Pi (not `/data`) — see [`client/agent/.env.example`](client/agent/.env.example) |
| Production Omise webhooks | Set `OMISE_WEBHOOK_SECRET` in root `.env` (see [.env.example](.env.example)) |

---

## 7. Adding a new machine (“ตู้”) end-to-end

A **machine** is a row in the `machines` table (`machine_code` primary key). The admin API creates the row and a **one-time `secret_token`**; the server stores **only** `secret_token_hash` (bcrypt). Socket.IO machine auth is implemented in [server/app/realtime/socketio_gateway.py](server/app/realtime/socketio_gateway.py).

### Step 1 — Start the stack

Ensure `docker compose up --build` is running and services are healthy (Section 4–6).

### Step 2 — Open Admin and create a machine

1. Go to [http://localhost:3001](http://localhost:3001).
2. **Login:** the current admin login UI is a **placeholder** (see [web/admin-ui/components/auth/LoginCard.tsx](web/admin-ui/components/auth/LoginCard.tsx)); submit the form to enter the app.
3. Navigate to **Machines**.
4. Use **Create / Add machine** (calls `POST /api/admin/machines` — see [server/app/api/admin/admin_machines.py](server/app/api/admin/admin_machines.py)).
5. Enter a **`machine_code`** (max 20 characters, must **not** already exist). Example: `DEMO-01`.
6. After success, the UI shows:
   - `machine_code`
   - **`secret_token`** (plaintext, **shown once**)

**Copy both values to a safe place immediately.**

### Step 3 — Configure the Docker agent (`client` / `vending-pi`)

In the **root** `.env` set:

```env
MACHINE_CODE=DEMO-01
MACHINE_TOKEN=<paste secret_token from Admin>
```

Apply changes by rebuilding/restarting the agent:

```bash
docker compose up -d --build client
```

Or restart the full stack.

**Expected behavior:**

- On success, agent logs should indicate a WebSocket / Socket.IO connection to the server.
- On bad credentials, agent logs authentication failure and **retries every 30s** until `MACHINE_TOKEN` is fixed.

### Step 4 — Kiosk secret + machine-ui `machine_code`

In the **root** `.env` (generate once: `openssl rand -hex 32`):

```env
KIOSK_SOCKET_SECRET=<your-secret>
NEXT_PUBLIC_KIOSK_SOCKET_SECRET=<same-value>
NEXT_PUBLIC_MACHINE_CODE=DEMO-01
```

Because Next.js inlines `NEXT_PUBLIC_*` at **build** time, you must **rebuild** the machine-ui image after changing this value:

```bash
docker compose build --no-cache machine-ui
docker compose up -d machine-ui
```

Or:

```bash
docker compose up --build
```

(which rebuilds services whose build context changed).

### Step 5 — Inventory (slots)

The seed in [database/init.sql](database/init.sql) only pre-fills slots for **`MP1-001`**. A **new** `machine_code` has **no slots** until you add them in Admin (inventory / machine slots, depending on your UI). Add products to slots before expecting a full purchase flow.

---

## 8. Important notes about seeded data `MP1-001`

- Fresh DB from [database/init.sql](database/init.sql) stores a **bcrypt** hash for dev plaintext token **`dev-machine-token`** (set `MACHINE_TOKEN=dev-machine-token` on Pi or Docker `client`).
- Older volumes may still have invalid hash `'001'` — Pi Socket auth will fail until you **recreate the machine in Admin**, run `docker compose down -v` for a fresh DB, or update `secret_token_hash` manually.
- You **cannot** create another machine with the same `machine_code` via Admin (duplicate / 409).
- Default Compose uses **`MP1-001`** for `MACHINE_CODE` / `NEXT_PUBLIC_MACHINE_CODE` and a dev `KIOSK_SOCKET_SECRET` default — change both secrets in production.

---

## 9. Changing machine code after the first build

| Change | Action |
|--------|--------|
| `MACHINE_CODE` / `MACHINE_TOKEN` | Edit root `.env`, then `docker compose up -d --build client` |
| `NEXT_PUBLIC_MACHINE_CODE` / kiosk secrets | Edit root `.env`, then **rebuild** `machine-ui` (Section 7 Step 4) |
| Omise or API URL build args | Rebuild affected frontend images |

---

## 10. Stopping and cleaning up

**Stop containers (keep volumes):**

```bash
docker compose down
```

**Stop and remove named volumes** (this **deletes MySQL data** including all machines and orders):

```bash
docker compose down -v
```

Use `-v` only when you intentionally want a fresh database; the next `up` will re-run `init.sql` on a new volume.

---

## 11. Raspberry Pi agent only (hardware on the board)

Use this when the **browser** opens Machine UI on the Pi (or another PC) but **`python agent.py` runs on the Pi** — not the Docker `client` service.

### 11.1 Which `.env` file?

| File | Used by |
|------|---------|
| Root [`.env`](.env) | Docker Compose (`server`, optional `client` container) |
| [`client/agent/.env`](client/agent/.env) | Pi when you run `python agent.py` locally |

Compose does **not** load `client/agent/.env` for the Pi process. Copy from [`client/agent/.env.example`](client/agent/.env.example).

### 11.2 Required variables on the Pi

```env
MACHINE_CODE=MP1-001
MACHINE_TOKEN=<plaintext secret from Admin — once>
SERVER_SOCKET_URL=http://<IP-of-PC-running-docker-server>:8000
```

- **`SERVER_SOCKET_URL` must not be `http://server:8000`** on the Pi (that hostname only works inside Docker).
- **`MACHINE_TOKEN`** must match the bcrypt hash stored in MySQL (`machines.secret_token_hash`). The seed value `001` in old databases is **invalid** — create the machine in Admin or use dev token below.

### 11.3 Admin “Socket connected” vs kiosk UI

| Indicator | Meaning |
|-----------|---------|
| Admin `machines.is_online` | **Pi agent** authenticated to Socket.IO (`machine_code` + `token`) |
| Machine UI full-screen gate (main screen) | **Pi agent** must be online (`machine_presence`) — blocks entire UI **before** payment only |
| Machine UI “internet reconnect” banner | **Kiosk** Socket to server (`KIOSK_SOCKET_SECRET`) — processing modal only |
| Machine UI “connecting to hardware…” banner | Pi agent presence during **processing** modal — post-payment flow |

No rows in `machine_job_events` until the Pi receives `job.start` and sends `machine_event`.

### 11.4 Verify Pi agent (in order)

1. On the Pi: `curl http://127.0.0.1:5000/health` → JSON with `machine_code` and `ws.connected`.
2. Agent logs: `✅ [WS] connected to server` — not `Authentication failed` every 30s.
3. On the PC: `docker logs vending-server 2>&1 | findstr "machine connected"` → `machine connected: MP1-001`.
4. Admin → Machines → Socket shows **connected**.
5. After a test purchase: MySQL table `machine_job_events` has new rows.

### 11.5 Dev token (fresh DB from fixed `init.sql`)

For local dev only, seed machine `MP1-001` can use plaintext token **`dev-machine-token`** (see [database/init.sql](database/init.sql)). Set the same value in root `.env` / Pi `client/agent/.env` as `MACHINE_TOKEN=dev-machine-token`.

---

## 12. Troubleshooting

### Port already in use

If `8000`, `3000`, `3001`, `5000`, `3307`, or `8081` is taken, either stop the conflicting process or change the **left** side of port mappings in [docker-compose.yml](docker-compose.yml) (e.g. `"8001:8000"`) and update `.env` URLs accordingly.

### Agent never connects / “websocket disabled”

- **Docker `client` container:** root `.env` needs **`MACHINE_CODE` and `MACHINE_TOKEN`**; `SERVER_SOCKET_URL=http://server:8000`.
- **Pi `python agent.py`:** use [`client/agent/.env`](client/agent/.env) with **`SERVER_SOCKET_URL=http://<PC-LAN-IP>:8000`** and token from Admin (see Section 11).
- If logs show **Authentication failed**: token does not match `secret_token_hash` in DB (re-create machine in Admin or use dev token from Section 11.5).
- Confirm **`KIOSK_SOCKET_SECRET`** and **`NEXT_PUBLIC_KIOSK_SOCKET_SECRET`** match, then rebuild `machine-ui`.

### Admin API returns errors

- `@admin_required` is currently a **no-op placeholder** ([server/app/api/admin/decorators.py](server/app/api/admin/decorators.py)); if you add real auth later, you must log in for real before creating machines.

### machine-ui shows wrong machine / wrong Socket room

- Re-read Section 7 Step 4: **`NEXT_PUBLIC_MACHINE_CODE` requires rebuilding `machine-ui`**.

### MySQL data looks stale after editing `init.sql`

- `init.sql` runs only on **first initialization** of the `db_data` volume. To re-apply seed, use `docker compose down -v` (destructive) or run migrations / SQL manually.

### Build failures on machine-ui

- Ensure `NEXT_PUBLIC_OMISE_PUBLIC_KEY` is set at build time (passed as build arg in Compose). Empty key can break or warn depending on app code.

### NFC tap does not start payment

- Confirm `POST /nfc/arm` appears in agent logs when entering card tap screen (after draft is created).
- Pi: `AGENT_DB_PATH` writable; UI on Pi uses `NEXT_PUBLIC_AGENT_BASE_URL=http://127.0.0.1:5000` (rebuild machine-ui if needed).
- Do not tap before arm — logs should not stay on `ignored (not armed)` during an active payment attempt.

### Paid but UI shows hardware error immediately

- After ~60s without Socket events, UI switches to **order status polling** (blue banner) instead of failing instantly.
- If Pi reconnects within ~2 minutes, order may move to `dispensing` / `completed` and UI shows success.

### Machine UI stuck on “ตู้กำลังดำเนินการออเดอร์ก่อนหน้า”

- Another kiosk session or a **page refresh** left an order in `paid` / `dispensing` (or recent `pending_payment`) in MySQL.
- Wait until dispense completes, or fix the order status in Admin / DB.
- Stale `pending_payment` (>5 min) is reconciled with Omise then cancelled on the next `active-order` check or sweeper run.
- After reload during payment, use **ดำเนินการต่อ** on the recovery overlay or wait for reconcile on poll.

### Machine UI stuck on “ระบบขัดข้องชั่วคราว” (cannot buy)

- Expected when the **Pi agent** is not connected to Socket.IO — start `client` / `vending-pi` in Docker or run `python agent.py` on the Pi (Section 11).
- Confirm server log: `machine connected: <MACHINE_CODE>`.
- `MACHINE_CODE` / `MACHINE_TOKEN` must match Admin; kiosk `NEXT_PUBLIC_MACHINE_CODE` must match after rebuild.
- If only the **internet** variant shows, fix kiosk Socket (`KIOSK_SOCKET_SECRET` + rebuild `machine-ui`).

---

## 13. Reference files

| File | Why it matters |
|------|----------------|
| [docker-compose.yml](docker-compose.yml) | Services, ports, build args, agent env |
| [.env.example](.env.example) | Full list of variables and comments |
| [database/init.sql](database/init.sql) | Schema + seed `MP1-001` and products |
| [server/app/realtime/socketio_gateway.py](server/app/realtime/socketio_gateway.py) | Socket.IO connect auth (`machine_id` + `token`) |
| [client/agent/ws_client.py](client/agent/ws_client.py) | Agent Socket.IO client and env |
| [web/machine-ui/Dockerfile](web/machine-ui/Dockerfile) | `NEXT_PUBLIC_*` build-time embedding |
| [README.md](README.md) | High-level overview and badges |

---

## Optional: run without Docker

Local development (Node `npm run dev`, Flask `flask run`, MySQL elsewhere) varies by machine; use this document for the **Docker** path. The main [README.md](README.md) still points to `docker compose up --build` as the primary way to run the system.

If anything in this guide drifts from the repo, prefer the actual [docker-compose.yml](docker-compose.yml) and [.env.example](.env.example) in your checkout.
