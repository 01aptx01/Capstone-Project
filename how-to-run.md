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
11. [Troubleshooting](#11-troubleshooting)
12. [Reference files](#12-reference-files)

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
| `MACHINE_ID` | `client` service | Must equal `machines.machine_code` in MySQL |
| `MACHINE_TOKEN` | `client` service | Plaintext token returned once from Admin “Create machine”; server stores bcrypt hash |
| `MACHINE_CODE` | Optional alias for agent | Compose passes it; agent prefers `MACHINE_ID` then `MACHINE_CODE` ([client/agent/ws_client.py](client/agent/ws_client.py)) |
| `NEXT_PUBLIC_MACHINE_CODE` | **machine-ui image build** | Which Socket.IO room / machine the browser UI uses; baked in at **build** time ([web/machine-ui/Dockerfile](web/machine-ui/Dockerfile)) |

Other useful entries (see [.env.example](.env.example)):

- `SERVER_SOCKET_URL=http://server:8000` — correct **inside** Docker for the agent.
- `NEXT_PUBLIC_API_URL=http://localhost:8000` — URL the **host browser** uses to reach the API from machine-ui.
- `NEXT_PUBLIC_SERVER_SOCKET_URL` — Socket.IO URL for the browser (often `http://localhost:8000`).

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
MACHINE_ID=DEMO-01
MACHINE_TOKEN=<paste secret_token from Admin>
```

Optional: `MACHINE_CODE=` can stay empty if `MACHINE_ID` is set.

Apply changes by rebuilding/restarting the agent:

```bash
docker compose up -d --build client
```

Or restart the full stack.

**Expected behavior:**

- On success, agent logs should indicate a WebSocket / Socket.IO connection to the server.
- On bad credentials, [client/agent/ws_client.py](client/agent/ws_client.py) logs  
  `Authentication failed: Invalid Machine ID or Token`  
  and **stops retrying** (thread exits that loop).

### Step 4 — Point machine-ui at the same `machine_code`

In the **root** `.env`:

```env
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

- `init.sql` inserts `MP1-001` into `machines` **without** `secret_token_hash`.
- You **cannot** create another machine with the same `machine_code` via Admin (duplicate / 409).
- Therefore, for **Socket.IO token auth**, the practical paths are:
  - **Create a new machine** with a **different** `machine_code` (e.g. `DEMO-01`) and use that machine’s token; **or**
  - Manually update the database (advanced, not documented here).

Default Compose / Dockerfile defaults use **`MP1-001`** for `NEXT_PUBLIC_MACHINE_CODE` and `MACHINE_ID` so URLs and seed data align **except** the seeded row still has **no token** until you align policy (new machine vs DB update).

---

## 9. Changing machine code after the first build

| Change | Action |
|--------|--------|
| `MACHINE_ID` / `MACHINE_TOKEN` | Edit root `.env`, then `docker compose up -d --build client` |
| `NEXT_PUBLIC_MACHINE_CODE` | Edit root `.env`, then **rebuild** `machine-ui` (Section 7 Step 4) |
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

## 11. Troubleshooting

### Port already in use

If `8000`, `3000`, `3001`, `5000`, `3307`, or `8081` is taken, either stop the conflicting process or change the **left** side of port mappings in [docker-compose.yml](docker-compose.yml) (e.g. `"8001:8000"`) and update `.env` URLs accordingly.

### Agent never connects / “websocket disabled”

- Confirm root `.env` has **`MACHINE_ID` (or `MACHINE_CODE`) and `MACHINE_TOKEN`** both non-empty ([client/agent/ws_client.py](client/agent/ws_client.py)).
- Confirm `SERVER_SOCKET_URL` for the agent inside Docker is **`http://server:8000`** (already set in [docker-compose.yml](docker-compose.yml)).

### Admin API returns errors

- `@admin_required` is currently a **no-op placeholder** ([server/app/api/admin/decorators.py](server/app/api/admin/decorators.py)); if you add real auth later, you must log in for real before creating machines.

### machine-ui shows wrong machine / wrong Socket room

- Re-read Section 7 Step 4: **`NEXT_PUBLIC_MACHINE_CODE` requires rebuilding `machine-ui`**.

### MySQL data looks stale after editing `init.sql`

- `init.sql` runs only on **first initialization** of the `db_data` volume. To re-apply seed, use `docker compose down -v` (destructive) or run migrations / SQL manually.

### Build failures on machine-ui

- Ensure `NEXT_PUBLIC_OMISE_PUBLIC_KEY` is set at build time (passed as build arg in Compose). Empty key can break or warn depending on app code.

---

## 12. Reference files

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
