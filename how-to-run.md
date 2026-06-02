# วิธีรันโปรเจกต์ Smart Vending (ล่าสุด)

คู่มือนี้เป็นจุดอ้างอิงหลักสำหรับ **วิธีรันทุกสถานการณ์** — Docker เต็มสแต็ก, พัฒนาแยกส่วน, ลงทะเบียนตู้, LAN/Raspberry Pi, ทดสอบชำระเงิน และแก้ปัญหา

ภาพรวมสถาปัตยกรรมและรายละเอียดโมดูล: [README2.md](README2.md) · ภาพรวมสั้น: [README.md](README.md)

---

## สารบัญ

1. [สิ่งที่รันในระบบ](#1-สิ่งที่รันในระบบ)
2. [สิ่งที่ต้องมีก่อนเริ่ม](#2-สิ่งที่ต้องมีก่อนเริ่ม)
3. [ตั้งค่า Environment ครั้งแรก](#3-ตั้งค่า-environment-ครั้งแรก)
4. [สถานการณ์ A — Docker เต็มสแต็ก (แนะนำ)](#4-สถานการณ์-a--docker-เต็มสแต็ก-แนะนำ)
5. [URL และพอร์ต](#5-url-และพอร์ต)
6. [ตรวจว่าระบบขึ้นครบ](#6-ตรวจว่าระบบขึ้นครบ)
7. [สถานการณ์ B — ลงทะเบียนตู้ใหม่ (agent + machine-ui)](#7-สถานการณ์-b--ลงทะเบียนตู้ใหม่-agent--machine-ui)
8. [ข้อมูล seed `MP1-001`](#8-ข้อมูล-seed-mp1-001)
9. [สถานการณ์ C — รีเซ็ตฐานข้อมูล](#9-สถานการณ์-c--รีเซ็ตฐานข้อมูล)
10. [สถานการณ์ D — รันเฉพาะบาง service](#10-สถานการณ์-d--รันเฉพาะบาง-service)
11. [สถานการณ์ E — พัฒนา Backend (Flask) แบบ local](#11-สถานการณ์-e--พัฒนา-backend-flask-แบบ-local)
12. [สถานการณ์ F — พัฒนา machine-ui (hot reload)](#12-สถานการณ์-f--พัฒนา-machine-ui-hot-reload)
13. [สถานการณ์ G — พัฒนา admin-ui (hot reload)](#13-สถานการณ์-g--พัฒนา-admin-ui-hot-reload)
14. [สถานการณ์ H — พัฒนา web-ui สมาชิก](#14-สถานการณ์-h--พัฒนา-web-ui-สมาชิก)
15. [สถานการณ์ I — Agent บน Raspberry Pi / LAN](#15-สถานการณ์-i--agent-บน-raspberry-pi--lan)
16. [สถานการณ์ J — ทดสอบ agent ด้วย HTTP](#16-สถานการณ์-j--ทดสอบ-agent-ด้วย-http)
17. [สถานการณ์ K — เปลี่ยนพอร์ต / หลายเครื่อง](#17-สถานการณ์-k--เปลี่ยนพอร์ต--หลายเครื่อง)
18. [ทดสอบการชำระเงิน (Omise)](#18-ทดสอบการชำระเงิน-omise)
19. [เปลี่ยนค่าหลัง build แล้ว](#19-เปลี่ยนค่าหลัง-build-แล้ว)
20. [หยุดและลบข้อมูล](#20-หยุดและลบข้อมูล)
21. [แก้ปัญหา (Troubleshooting)](#21-แก้ปัญหา-troubleshooting)
22. [ไฟล์อ้างอิง](#22-ไฟล์อ้างอิง)

---

## 1. สิ่งที่รันในระบบ

จาก [docker-compose.yml](docker-compose.yml):


| Service          | Container              | บทบาท                                                                                    |
| ---------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `db`             | vending-db             | MySQL 8 — schema/seed จาก [database/init.sql](database/init.sql) ครั้งแรกที่ volume ว่าง |
| `server`         | vending-server         | Flask API + Socket.IO + Flasgger                                                         |
| `client`         | vending-pi             | Hardware agent (จำลอง Pi ใน Docker)                                                      |
| `machine-ui`     | vending-machine-ui     | Next.js หน้าจอลูกค้าที่ตู้                                                               |
| `admin-ui`       | vending-admin-ui       | Next.js แดชบอร์ดแอดมิน                                                                   |
| `web-ui`         | vending-web-ui         | Next.js แอปสมาชิก (OTP, แต้ม, redeem)                                                    |
| `swagger-ui`     | vending-swagger-ui     | Swagger UI จาก [swagger.yaml](swagger.yaml)                                              |
| `compose-banner` | vending-compose-banner | พิมพ์ตาราง URL ตอน start                                                                 |


**รันแยก (hot reload):** `web/web-ui` — ใช้ `npm run dev` ตาม [§14](#14-สถานการณ์-h--พัฒนา-web-ui-สมาชิก) แทน container

---

## 2. สิ่งที่ต้องมีก่อนเริ่ม

- **Docker Desktop** (Windows/macOS) หรือ **Docker Engine + Compose** (Linux)
- **Git**
- **Node.js 22+** และ **npm** — ถ้ารัน frontend แบบ `npm run dev`
- **Python 3.10+** — ถ้ารัน server/agent แบบ local
- **Omise test keys** — ถ้าต้องการทดสอบชำระเงิน ([Omise Dashboard](https://dashboard.omise.co/))
- RAM/ดิสก์พอสำหรับ MySQL + build Next.js ครั้งแรก (อาจใช้เวลาหลายนาที)

---

## 3. ตั้งค่า Environment ครั้งแรก

### 3.1 สร้าง `.env` ที่ root

โฟลเดอร์เดียวกับ [docker-compose.yml](docker-compose.yml):

**Windows (PowerShell / CMD):**

```bat
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Compose อ่าน `${VAR}` จาก **root `.env`** ตอน parse compose; service `server` โหลด `.env` ผ่าน `env_file` ด้วย

> ใน Docker **ไม่ใช้** `client/agent/.env` เป็นหลัก — ใส่ `MACHINE_CODE` / `MACHINE_TOKEN` ที่ **root `.env`**

### 3.2 ค่าขั้นต่ำที่ต้องแก้


| ตัวแปร                         | ใช้กับ                              |
| ------------------------------ | ----------------------------------- |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | build machine-ui + Omise ใน browser |
| `OMISE_SECRET_KEY`             | Flask server                        |


ค่า DB ใน [.env.example](.env.example) ตรงกับ Compose: `DB_HOST=db`, user/pass `root`, `DB_NAME=vending`

### 3.3 ตัวแปรเกี่ยวกับตู้ (หลังสร้างตู้ใน Admin)

| ตัวแปร                          | ใช้โดย               | หมายเหตุ                                                            |
| ------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `MACHINE_CODE`                  | service `client`     | ต้องตรง `machines.machine_code` (compose ส่งเป็น env ให้ agent)     |
| `MACHINE_TOKEN`                 | service `client`     | plaintext จาก Admin ตอนสร้างตู้ (**แสดงครั้งเดียว**)                |
| `NEXT_PUBLIC_MACHINE_CODE`      | **build** machine-ui | เปลี่ยนแล้วต้อง **rebuild** image                                   |
| `KIOSK_SOCKET_SECRET`           | **server**           | บังคับเมื่อเปิด Socket.IO — ล็อก kiosk Socket                      |
| `NEXT_PUBLIC_KIOSK_SOCKET_SECRET` | **build** machine-ui | ต้องตรง `KIOSK_SOCKET_SECRET`                                      |
| `SERVER_SOCKET_URL`             | agent ใน Docker      | ค่าแนะนำ: `http://server:8000`                                      |
| `NEXT_PUBLIC_API_URL`           | build machine-ui     | URL ที่ **browser บน host** เรียก API (มัก `http://localhost:8000`) |
| `NEXT_PUBLIC_SERVER_SOCKET_URL` | machine-ui browser   | มัก `http://localhost:8000`                                         |
| `NEXT_PUBLIC_ADMIN_API_URL`     | build admin-ui       | มัก `http://localhost:8000`                                         |
| `JWT_SECRET`                    | web-ui runtime       | ต้องตรงกับ server — middleware ตรวจ JWT สมาชิก                       |
| `AUTH_DEV_BYPASS`               | server (dev)         | `1` = รับ OTP 6 หลักใดๆ (ห้าม production)                           |

- `SERVER_SOCKET_URL=http://server:8000` — agent → server Socket.IO (ภายใน Docker)
- `NEXT_PUBLIC_API_URL=http://localhost:8000` — REST API จาก browser บน host
- หลังชำระเงิน จ่ายของผ่าน **Socket.IO เท่านั้น** (`job.start`); health ของ agent ใช้ `AGENT_BASE_URL`
- OTP สมาชิก: ไม่ตั้ง SMS provider ภายนอก — รหัส OTP โผล่ที่ **console ของ server** (หรือใช้ `AUTH_DEV_BYPASS=1` ตอนทดสอบ)

### 3.4 ค่าใน `docker-compose.yml` ที่ควรรู้

- `server.environment` ตั้ง `AGENT_BASE_URL`, `KIOSK_SOCKET_SECRET`, `CORS_ORIGINS` (มี default ใน compose)
- `client` อ่าน `MACHINE_CODE` / `MACHINE_TOKEN` จาก root `.env` — **ไม่ใช้** `MACHINE_ID`
- เปลี่ยน `NEXT_PUBLIC_*` ของ machine-ui / web-ui แล้วต้อง **rebuild** image (`docker compose up --build`)

---

## 4. สถานการณ์ A — Docker เต็มสแต็ก (แนะนำ)

ที่ root โปรเจกต์:

```bash
docker compose up --build
```

- ครั้งแรก: MySQL init จาก `init.sql`, พอร์ต host **3307** → container 3306
- รอ healthcheck ของ `db` และ `server` ผ่าน

**รันเบื้องหลัง:**

```bash
docker compose up --build -d
```

**ดู log agent:**

```bash
docker logs -f vending-pi
```

**Log แยกบรรทัด (ไม่รวม prefix):**

```bash
docker compose up --build --no-log-prefix
```

---

## 5. URL และพอร์ต

จาก **เครื่อง host** ที่รัน Docker:


| ทรัพยากร                  | URL                                                            |
| ------------------------- | -------------------------------------------------------------- |
| machine-ui (ลูกค้าที่ตู้) | [http://localhost:3000](http://localhost:3000)                 |
| admin-ui                  | [http://localhost:3001](http://localhost:3001)                 |
| web-ui (สมาชิก)           | [http://localhost:3002](http://localhost:3002)                 |
| API + Socket.IO           | [http://localhost:8000](http://localhost:8000)                 |
| Flasgger                  | [http://localhost:8000/apidocs](http://localhost:8000/apidocs) |
| Hardware agent            | [http://localhost:5000](http://localhost:5000)                 |
| Swagger UI                | [http://localhost:8081](http://localhost:8081)                 |
| MySQL                     | `127.0.0.1:3307` (user `root`, password ตาม compose)           |


ภายใน Docker network: hostname `**server`** (เช่น agent ใช้ `http://server:8000` สำหรับ Socket.IO)

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

## 6. ตรวจว่าระบบขึ้นครบ

1. [http://localhost:8000/health](http://localhost:8000/health) — JSON OK
2. [http://localhost:3000](http://localhost:3000) — machine-ui
3. [http://localhost:3001](http://localhost:3001) — admin-ui
4. [http://localhost:3002](http://localhost:3002) — web-ui (สมาชิก)
5. (ถ้ามี token ตู้) `docker logs vending-pi` — ควรเห็น `✅ [WS] connected` หรือ `[SocketIO] machine connected: <code>` ที่ฝั่ง server

**ตรวจ agent + Socket.IO สำเร็จ:**

- Server log: `✅ [SocketIO] machine connected: DEMO-01 ...`
- ไม่มี loop `Connection refused by server` ซ้ำๆ (ดู [§21](#21-แก้ปัญหา-troubleshooting))

---

## 7. สถานการณ์ B — ลงทะเบียนตู้ใหม่ (agent + machine-ui)

ตู้ = แถวใน `machines` (`machine_code` เป็น PK). Admin สร้างแถว + `**secret_token` แสดงครั้งเดียว**; server เก็บแค่ `secret_token_hash` (bcrypt) — ดู [socketio_gateway.py](server/app/realtime/socketio_gateway.py)

### ขั้นที่ 1 — สตาร์ทสแต็ก

ตาม [§4](#4-สถานการณ์-a--docker-เต็มสแต็ก-แนะนำ) ให้ service พร้อม

### ขั้นที่ 2 — สร้างตู้ใน Admin

1. เปิด [http://localhost:3001](http://localhost:3001)
2. Login: UI ยังเป็น **placeholder** — ส่งฟอร์มเพื่อเข้าแอป
3. ไป **Machines** → **Create / Add machine** (`POST /api/admin/machines`)
4. ใส่ `machine_code` (สูงสุด 20 ตัวอักษร, ห้ามซ้ำ) เช่น `DEMO-01`
5. **คัดลอกทันที:** `machine_code` + `**secret_token` (plaintext)**

### ขั้นที่ 3 — ตั้ง agent

ใน **root `.env`:**

```env
MACHINE_CODE=DEMO-01
MACHINE_TOKEN=<วาง secret_token จาก Admin>
```

รีสตาร์ท agent (โหลด env ใหม่):

```bash
docker compose up -d --build client
```

**สำเร็จ:** log server มี `machine connected: DEMO-01`; log agent มี `[WS] connected`

**ล้มเหลว:** server ส่ง `Connection refused by server` — token ผิด / ตู้ไม่มี hash / ไม่ได้ restart client หลังแก้ `.env`  
ถ้า credentials ผิด agent จะ **retry ทุก 30 วินาที** จนกว่า `MACHINE_TOKEN` จะถูก

### ขั้นที่ 4 — ตั้ง Kiosk secret + machine-ui ให้ตรงตู้

ใน **root `.env`:** (สร้างครั้งเดียว เช่น `openssl rand -hex 32`)

```env
KIOSK_SOCKET_SECRET=<your-secret>
NEXT_PUBLIC_KIOSK_SOCKET_SECRET=<same-value>
NEXT_PUBLIC_MACHINE_CODE=DEMO-01
```

Rebuild (Next ฝัง `NEXT_PUBLIC_*` ตอน build):

```bash
docker compose build --no-cache machine-ui
docker compose up -d machine-ui
```

หรือ `docker compose up --build` ทั้งสแต็ก

### ขั้นที่ 5 — สต็อกช่อง

Seed มีสต็อกเฉพาะ `**MP1-001**` — ตู้ใหม่ต้องเพิ่ม **machine slots** ใน Admin ก่อนซื้อจริง

---

## 8. ข้อมูล seed `MP1-001`

- [database/init.sql](database/init.sql) ใส่ตู้ `MP1-001` พร้อม **bcrypt hash** สำหรับ dev token **`dev-machine-token`** (ตั้ง `MACHINE_TOKEN=dev-machine-token` ใน root `.env` หรือ Pi)
- volume เก่าอาจยังมี hash ไม่ถูกต้อง (เช่น `'001'`) — Socket auth ล้มเหลวจนกว่าจะสร้างตู้ใหม่ใน Admin, `docker compose down -v`, หรืออัปเดต hash เอง
- สร้างตู้ชื่อ `MP1-001` ซ้ำใน Admin ไม่ได้ (409)
- ค่า default ใน compose/Dockerfile: `MACHINE_CODE` / `NEXT_PUBLIC_MACHINE_CODE` = `MP1-001` — เปลี่ยน `KIOSK_SOCKET_SECRET` ใน production

---

## 9. สถานการณ์ C — รีเซ็ตฐานข้อมูล

```bash
docker compose down -v
docker compose up --build
```

`-v` ลบ volume `db_data` — ข้อมูล MySQL หาย, `init.sql` รันใหม่ครั้งถัดไป

---

## 10. สถานการณ์ D — รันเฉพาะบาง service

```bash
# เฉพาะ DB + API
docker compose up -d db server

# Frontend
docker compose up -d machine-ui admin-ui web-ui

# Agent (หลังตั้ง MACHINE_CODE / MACHINE_TOKEN)
docker compose up -d --build client

# Swagger
docker compose up -d swagger-ui
```

แก้ Omise หรือ URL ของ frontend → **rebuild** image ที่เกี่ยวข้อง

---

## 11. สถานการณ์ E — พัฒนา Backend (Flask) แบบ local

### 11.1 MySQL จาก Docker อย่างเดียว

```bash
docker compose up -d db
```

### 11.2 รัน server บน host

```bash
cd server
python -m venv .venv
```

**Windows:** `.venv\Scripts\activate`  
**macOS/Linux:** `source .venv/bin/activate`

```bash
pip install -r requirements.txt
```

ตั้ง env (หรือใช้ root `.env` แต่แก้ host):

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=vending
# ถ้า MySQL จาก compose บน host:
# เชื่อมพอร์ต 3307 — บางโค้ดใช้ DB_HOST+พอร์ตใน URI ผ่าน sqlalchemy_uri
OMISE_SECRET_KEY=skey_test_...
SOCKETIO_ENABLED=1
AGENT_BASE_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

```bash
python main.py
```

API: [http://localhost:8000](http://localhost:8000)

### 11.3 Migration (schema หลัง init.sql)

```bash
cd server
flask db upgrade
```

(ต้องตั้ง `FLASK_APP` ตามที่โปรเจกต์ใช้ — มัก `wsgi.py` หรือ factory)

---

## 12. สถานการณ์ F — พัฒนา machine-ui (hot reload)

```bash
docker compose up -d db server
cd web/machine-ui
npm install
```

สร้าง `web/machine-ui/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SERVER_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_...
NEXT_PUBLIC_MACHINE_CODE=DEMO-01
```

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) — แก้โค้ดแล้ว refresh ได้ **ไม่ต้อง rebuild Docker**

---

## 13. สถานการณ์ G — พัฒนา admin-ui (hot reload)

```bash
docker compose up -d db server
cd web/admin-ui
npm install
```

`.env.local`:

```env
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8000
```

```bash
npx next dev -p 3001
```

เปิด [http://localhost:3001](http://localhost:3001) — ไม่ชน machine-ui ที่พอร์ต 3000

---

## 14. สถานการณ์ H — พัฒนา web-ui สมาชิก

### 14.1 Docker (production build ใน Compose)

รวมใน `docker compose up --build` — เปิด [http://localhost:3002](http://localhost:3002)

- Build args ฝัง `NEXT_PUBLIC_*` ตอน build (เปลี่ยนแล้ว rebuild: `docker compose build --no-cache web-ui`)
- Runtime: `JWT_SECRET` ใน root `.env` ต้องตรงกับ server (middleware ตรวจ JWT)

```bash
docker compose up -d --build web-ui
```

### 14.2 Local dev (hot reload)

```bash
docker compose up -d db server
cd web/web-ui
npm install
```

`.env.local` — ชี้ `NEXT_PUBLIC_API_URL=http://localhost:8000` และ `JWT_SECRET` ให้ตรง server

```bash
npm run dev
```

- OTP: รหัส OTP โผล่ที่ **console ของ server** (Mock SMS)
- Dev: `AUTH_DEV_BYPASS=1` ใน root `.env` (server) รับ OTP 6 หลักใดๆ — **ห้ามใช้ production**

Serve build ผ่าน server (legacy): mount `web/web-ui/build` ใน compose แล้วเปิด [http://localhost:8000/](http://localhost:8000/)

---

## 15. สถานการณ์ I — Agent บน Raspberry Pi / LAN

### 15.1 Server บนเครื่อง/LAN (เช่น `192.168.1.44`)

1. รัน stack หรือ server ให้ API ที่ `:8000` เข้าถึงได้จาก Pi
2. สร้างตู้ใน Admin ตาม [§7](#7-สถานการณ์-b--ลงทะเบียนตู้ใหม่-agent--machine-ui)
3. บน Pi: คัดลอก [client/agent/.env.example](client/agent/.env.example) → `.env`

```env
MACHINE_CODE=DEMO-01
MACHINE_TOKEN=<secret_token>
SERVER_SOCKET_URL=http://192.168.1.44:8000
MACHINE_UI_URL=http://192.168.1.44:3000
NFC_AUTO_APPROVE=false
```

```bash
cd client/agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python agent.py
```

1. **CORS:** เพิ่ม origin ของ machine-ui ใน root `.env`:

```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.44:3000,...
```

แล้ว restart `server`

1. Kiosk: [client/kiosk/chromium.sh](client/kiosk/chromium.sh) + [autostart.service](client/kiosk/autostart.service) (แก้ path ให้ตรง Pi)

### 15.2 machine-ui ให้ Pi เปิด browser ได้

Build/deploy โดย bake URL ที่ Pi เข้าถึงได้:

```env
NEXT_PUBLIC_API_URL=http://<server-ip>:8000
NEXT_PUBLIC_SERVER_SOCKET_URL=http://<server-ip>:8000
NEXT_PUBLIC_MACHINE_CODE=DEMO-01
```

จากนั้น build image หรือ `npm run build && npm start` บนเครื่องที่ Pi เปิดได้

---

## 16. สถานการณ์ J — ทดสอบ agent ด้วย HTTP

ทดสอบมอเตอร์โดยตรงที่ agent (ไม่ผ่าน Omise):

```bash
curl -X POST http://localhost:5000/jobs/start \
  -H "Content-Type: application/json" \
  -d "{\"machine_code\": \"DEMO-01\", \"items\": [{\"product_id\": 1, \"quantity\": 1}]}"
```

ดู `docker logs -f vending-pi`

---

## 17. สถานการณ์ K — เปลี่ยนพอร์ต / หลายเครื่อง

ถ้าพอร์ต `8000`, `3000`, `3001`, `3002`, `5000`, `3307`, `8081` ถูกใช้:

1. แก้ **ซ้าย** ของ mapping ใน [docker-compose.yml](docker-compose.yml) เช่น `"8001:8000"`
2. อัปเดต `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8001
```

1. **Rebuild** `machine-ui`, `admin-ui`, และ `web-ui`

---

## 18. ทดสอบการชำระเงิน (Omise)

1. ใส่ test keys ใน root `.env`
2. machine-ui: ปุ่ม **[Test] Simulate Visa Tap** (บัตรทดสอบ)
3. **PromptPay:** สแกน QR หรือตั้ง webhook → `POST /api/buy/omise-webhook`
4. **Dev bypass สถานะ paid:**

```bash
curl -X POST http://localhost:8000/api/buy/mock-pay \
  -H "Content-Type: application/json" \
  -d "{\"charge_id\": \"<charge_id>\"}"
```

ต้อง `ALLOW_MOCK_PAY=1` ใน `.env`

หลัง `paid` + agent online + มีสต็อก → ควรเห็น job / จ่ายของใน log agent

---

## 19. เปลี่ยนค่าหลัง build แล้ว


| สิ่งที่เปลี่ยน                          | สิ่งที่ต้องทำ                                                        |
| --------------------------------------- | -------------------------------------------------------------------- |
| `MACHINE_CODE` / `MACHINE_TOKEN`          | แก้ root `.env` → `docker compose up -d --build client`              |
| `NEXT_PUBLIC_MACHINE_CODE` / kiosk secrets | แก้ `.env` → **rebuild** `machine-ui`                                |
| Omise keys / `NEXT_PUBLIC_API_URL`      | rebuild `machine-ui`, `admin-ui`, `web-ui` (ถ้าเกี่ยว)             |
| `JWT_SECRET`                            | แก้ root `.env` → restart `web-ui` (runtime, ไม่ต้อง rebuild)      |
| `AGENT_BASE_URL` / `KIOSK_SOCKET_SECRET` | แก้ root `.env` → restart `server` (และ rebuild machine-ui ถ้าเปลี่ยน kiosk secret) |


---

## 20. หยุดและลบข้อมูล

**หยุด เก็บ volume:**

```bash
docker compose down
```

**หยุด + ลบ DB และ agent data:**

```bash
docker compose down -v
```

---

## 21. แก้ปัญหา (Troubleshooting)

### พอร์ตถูกใช้แล้ว

ดู [§17](#17-สถานการณ์-k--เปลี่ยนพอร์ต--หลายเครื่อง)

### Agent: `Connection refused by server` (Socket.IO) ซ้ำๆ

**อาการ (server log):** รับ auth `{"machine_code":"MP1-001","token":"..."}` แล้วส่ง packet `4` + `"Connection refused by server"`

**สาเหตุ:** `_verify_machine_token_auth` ไม่ผ่าน — token ไม่ตรง bcrypt ใน DB, ตู้ไม่มี `secret_token_hash`, หรือ `machine_code` ผิด

**แก้:**

1. ใช้ `MACHINE_TOKEN` **ตัวเดียวกับ** `secret_token` ตอนสร้างตู้ใน Admin (ไม่ใช่ hash)
2. หลังแก้ root `.env`: `docker compose up -d --build client`
3. ถ้าเสีย token แล้ว — สร้างตู้ใหม่ (รหัสใหม่) หรืออัปเดต DB (ขั้นสูง); **ไม่มี** API rotate token ใน repo ปัจจุบัน
4. ตรวจ MySQL: `SELECT machine_code, secret_token_hash IS NOT NULL FROM machines WHERE machine_code='DEMO-01';`

**สำเร็จเมื่อเห็น:** `✅ [SocketIO] machine connected: DEMO-01` ใน log server

### Agent: `websocket disabled`

- ว่าง `MACHINE_CODE` หรือ `MACHINE_TOKEN` — ดู [ws_client.py](client/agent/ws_client.py)
- ใน Docker: `SERVER_SOCKET_URL=http://server:8000`
- บน Pi จริง: ใช้ [`client/agent/.env`](client/agent/.env) — **`SERVER_SOCKET_URL` ต้องไม่เป็น `http://server:8000`** (ใช้ได้แค่ใน Docker) ให้ชี้ IP ของเครื่องที่รัน server เช่น `http://192.168.1.44:8000`

### Kiosk Socket / machine-ui ไม่เชื่อม

- ยืนยัน **`KIOSK_SOCKET_SECRET`** = **`NEXT_PUBLIC_KIOSK_SOCKET_SECRET`** แล้ว **rebuild** `machine-ui`
- ถ้าเห็น overlay “สัญญาณขัดข้องชั่วคราว” = kiosk Socket ล้ม; “ระบบขัดข้องชั่วคราว” = Pi agent offline

### ตรวจ Pi agent (ลำดับแนะนำ)

1. บน Pi: `curl http://127.0.0.1:5000/health` → JSON มี `machine_code` และ `ws.connected`
2. Log agent: `✅ [WS] connected to server` — ไม่ใช่ `Authentication failed` ทุก 30s
3. บนเครื่อง server: `docker logs vending-server 2>&1 | findstr "machine connected"`
4. Admin → Machines → Socket **connected**
5. หลังทดสอบซื้อ: ตาราง `machine_job_events` มีแถวใหม่

### Dev token (DB ใหม่จาก `init.sql`)

สำหรับ dev local เท่านั้น: seed ตู้ `MP1-001` ใช้ plaintext **`dev-machine-token`** — ตั้ง `MACHINE_TOKEN=dev-machine-token` ใน root `.env` / Pi `client/agent/.env`

### ชำระแล้วไม่จ่ายของ

- Agent ไม่ได้ connect Socket (ข้างบน) หรือ `MACHINE_TOKEN` ไม่ตรงตู้
- `AGENT_BASE_URL` ชี้ agent ผิด (ใน Docker มัก `http://client:5000` จาก compose default)
- ตู้ไม่มี slots / สต็อกหมด
- `machine_code` ใน UI ไม่ตรงตู้ที่มีสต็อก

### machine-ui ผิดตู้ / Socket room ผิด

- Rebuild หลังเปลี่ยน `NEXT_PUBLIC_MACHINE_CODE` — [§7 ขั้นที่ 4](#ขั้นที่-4--ตั้ง-machine-ui-ให้ตรงตู้)

### แก้ `init.sql` แล้ว DB ไม่เปลี่ยน

- `init.sql` รันแค่ครั้งแรกของ volume — ใช้ `docker compose down -v` หรือรัน SQL/migration เอง

### Build machine-ui ล้ม

- ตั้ง `NEXT_PUBLIC_OMISE_PUBLIC_KEY` ใน root `.env` ก่อน build

### Admin API error

- `@admin_required` ยังเป็น placeholder — ไม่ต้อง login จริงในปัจจุบัน

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

- Expected when the **Pi agent** is not connected to Socket.IO — start `client` / `vending-pi` in Docker or run `python agent.py` on the Pi ([§15](#15-สถานการณ์-i--agent-บน-raspberry-pi--lan)).
- Confirm server log: `machine connected: <MACHINE_CODE>`.
- `MACHINE_CODE` / `MACHINE_TOKEN` must match Admin; kiosk `NEXT_PUBLIC_MACHINE_CODE` must match after rebuild.
- If only the **internet** variant shows, fix kiosk Socket (`KIOSK_SOCKET_SECRET` + rebuild `machine-ui`).

---

## 22. ไฟล์อ้างอิง


| ไฟล์                                                                               | ความสำคัญ                    |
| ---------------------------------------------------------------------------------- | ---------------------------- |
| [docker-compose.yml](docker-compose.yml)                                           | services, ports, overrides   |
| [.env.example](.env.example)                                                       | ตัวแปรครบ                    |
| [database/init.sql](database/init.sql)                                             | schema + seed                |
| [server/app/realtime/socketio_gateway.py](server/app/realtime/socketio_gateway.py) | Socket auth ตู้ + kiosk      |
| [server/app/api/admin/admin_machines.py](server/app/api/admin/admin_machines.py)   | สร้างตู้ + token             |
| [client/agent/ws_client.py](client/agent/ws_client.py)                             | agent Socket client          |
| [web/machine-ui/Dockerfile](web/machine-ui/Dockerfile)                             | build-time `NEXT_PUBLIC_*`   |
| [web/web-ui/Dockerfile](web/web-ui/Dockerfile)                                     | build-time `NEXT_PUBLIC_*` + runtime `JWT_SECRET` |
| [README2.md](README2.md)                                                           | ภาพรวมโปรเจกต์ + สถาปัตยกรรม |
| [README.md](README.md)                                                             | สรุปสั้น                     |

ถ้าเนื้อหาใน repo เปลี่ยน ให้ยึด [docker-compose.yml](docker-compose.yml) และ [.env.example](.env.example) ใน checkout ของคุณเป็นหลัก
