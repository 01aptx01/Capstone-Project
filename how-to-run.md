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
8. [ข้อมูล seed `MP1-001](#8-ข้อมูล-seed-mp1-001)`
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

> ใน Docker **ไม่ใช้** `client/agent/.env` เป็นหลัก — ใส่ `MACHINE_ID` / `MACHINE_TOKEN` ที่ **root `.env`**

### 3.2 ค่าขั้นต่ำที่ต้องแก้


| ตัวแปร                         | ใช้กับ                              |
| ------------------------------ | ----------------------------------- |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | build machine-ui + Omise ใน browser |
| `OMISE_SECRET_KEY`             | Flask server                        |


ค่า DB ใน [.env.example](.env.example) ตรงกับ Compose: `DB_HOST=db`, user/pass `root`, `DB_NAME=vending`

### 3.3 ตัวแปรเกี่ยวกับตู้ (หลังสร้างตู้ใน Admin)


| ตัวแปร                          | ใช้โดย               | หมายเหตุ                                                            |
| ------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `MACHINE_ID`                    | service `client`     | ต้องตรง `machines.machine_code`                                     |
| `MACHINE_TOKEN`                 | service `client`     | plaintext จาก Admin ตอนสร้างตู้ (**แสดงครั้งเดียว**)                |
| `MACHINE_CODE`                  | agent (สำรอง)        | ใช้เมื่อไม่มี `MACHINE_ID`                                          |
| `NEXT_PUBLIC_MACHINE_CODE`      | **build** machine-ui | เปลี่ยนแล้วต้อง **rebuild** image                                   |
| `SERVER_SOCKET_URL`             | agent ใน Docker      | ค่าแนะนำ: `http://server:8000`                                      |
| `NEXT_PUBLIC_API_URL`           | build machine-ui     | URL ที่ **browser บน host** เรียก API (มัก `http://localhost:8000`) |
| `NEXT_PUBLIC_SERVER_SOCKET_URL` | machine-ui browser   | มัก `http://localhost:8000`                                         |
| `NEXT_PUBLIC_ADMIN_API_URL`     | build admin-ui       | มัก `http://localhost:8000`                                         |
| `JWT_SECRET`                    | web-ui runtime       | ต้องตรงกับ server — middleware ตรวจ JWT สมาชิก                       |
| `NEXT_PUBLIC_FULFILLMENT_MODE`  | build web-ui         | `immediate` (default) หรือ `pickup`                                 |


### 3.4 ค่าใน `.env` vs ค่าบังคับใน `docker-compose.yml`

ใน [docker-compose.yml](docker-compose.yml) ส่วน `server.environment` **เขียนทับ** บางค่าจาก `.env`:


| ค่าใน compose                                  | ผลต่อการรัน                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DISPATCH_MODE=http`                           | server ส่งงานไป agent ผ่าน **HTTP** (`AGENT_URL`) ไม่ใช่ Socket `job.start`                                          |
| `AGENT_URL=http://192.168.1.172:5000/dispense` | ชี้ IP LAN — บนเครื่อง dev เดียวอาจต้องแก้เป็น `http://client:5000/dispense` หรือ `http://host.docker.internal:5000` |


ค่าใน `.env.example`: `DISPATCH_MODE=socket` — **จะไม่มีผลกับ server ใน Docker** จนกว่าจะเอา override ออกจาก compose หรือเปลี่ยนเป็น `${DISPATCH_MODE:-socket}`

แนะนำสำหรับ dev บนเครื่องเดียว (agent ใน Docker):

- ตั้ง root `.env`: `DISPATCH_MODE=socket`, `AGENT_URL=http://client:5000/dispense`
- แก้ `docker-compose.yml` ให้ใช้ตัวแปรจาก `.env` แทน hardcode (ถ้าต้องการให้ socket dispatch ทำงานจริง)

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
MACHINE_ID=DEMO-01
MACHINE_TOKEN=<วาง secret_token จาก Admin>
```

รีสตาร์ท agent (โหลด env ใหม่):

```bash
docker compose up -d --build client
```

**สำเร็จ:** log server มี `machine connected: DEMO-01`; log agent มี `[WS] connected`

**ล้มเหลว:** server ส่ง `Connection refused by server` — token ผิด / ตู้ไม่มี hash / ไม่ได้ restart client หลังแก้ `.env`

### ขั้นที่ 4 — ตั้ง machine-ui ให้ตรงตู้

ใน **root `.env`:**

```env
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

- [database/init.sql](database/init.sql) ใส่ตู้ `MP1-001` **โดยไม่มี** `secret_token_hash`
- สร้างตู้ชื่อ `MP1-001` ซ้ำใน Admin ไม่ได้ (409)
- ค่า default ใน compose/Dockerfile: `MACHINE_ID` / `NEXT_PUBLIC_MACHINE_CODE` = `MP1-001` → **agent Socket auth จะล้มเหลว** จนกว่าจะ:
  - สร้างตู้ใหม่ (เช่น `DEMO-01`) + token ตาม [§7](#7-สถานการณ์-b--ลงทะเบียนตู้ใหม่-agent--machine-ui), **หรือ**
  - อัปเดต hash ใน DB เอง (ขั้นสูง)

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

# Agent (หลังตั้ง MACHINE_ID / MACHINE_TOKEN)
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
DISPATCH_MODE=socket
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
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

- OTP: ไม่ตั้ง Twilio → OTP โผล่ที่ **console ของ server**
- Dev: `AUTH_DEV_BYPASS=1` ใน root `.env` (server) รับ OTP 6 หลักใดๆ — **ห้ามใช้ production**

Serve build ผ่าน server (legacy): mount `web/web-ui/build` ใน compose แล้วเปิด [http://localhost:8000/](http://localhost:8000/)

---

## 15. สถานการณ์ I — Agent บน Raspberry Pi / LAN

### 15.1 Server บนเครื่อง/LAN (เช่น `192.168.1.44`)

1. รัน stack หรือ server ให้ API ที่ `:8000` เข้าถึงได้จาก Pi
2. สร้างตู้ใน Admin ตาม [§7](#7-สถานการณ์-b--ลงทะเบียนตู้ใหม่-agent--machine-ui)
3. บน Pi: คัดลอก [client/agent/.env.example](client/agent/.env.example) → `.env`

```env
MACHINE_ID=DEMO-01
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

เมื่อ `DISPATCH_MODE=http` หรือทดสอบมอเตอร์โดยตรง:

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
| `MACHINE_ID` / `MACHINE_TOKEN`          | แก้ root `.env` → `docker compose up -d --build client`              |
| `NEXT_PUBLIC_MACHINE_CODE`              | แก้ `.env` → **rebuild** `machine-ui`                                |
| Omise keys / `NEXT_PUBLIC_API_URL`      | rebuild `machine-ui`, `admin-ui`, `web-ui` (ถ้าเกี่ยว)             |
| `JWT_SECRET`                            | แก้ root `.env` → restart `web-ui` (runtime, ไม่ต้อง rebuild)      |
| `NEXT_PUBLIC_FULFILLMENT_MODE`          | rebuild `web-ui`                                                     |
| `DISPATCH_MODE` / `AGENT_URL` ใน Docker | แก้ compose หรือ override ใน `server.environment` → restart `server` |


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

**อาการ (server log):** รับ auth `{"machine_id":"DEMO-01","token":"..."}` แล้วส่ง packet `4` + `"Connection refused by server"`

**สาเหตุ:** `_verify_machine_token_auth` ไม่ผ่าน — token ไม่ตรง bcrypt ใน DB, ตู้ไม่มี `secret_token_hash`, หรือ `machine_code` ผิด

**แก้:**

1. ใช้ `MACHINE_TOKEN` **ตัวเดียวกับ** `secret_token` ตอนสร้างตู้ใน Admin (ไม่ใช่ hash)
2. หลังแก้ root `.env`: `docker compose up -d --build client`
3. ถ้าเสีย token แล้ว — สร้างตู้ใหม่ (รหัสใหม่) หรืออัปเดต DB (ขั้นสูง); **ไม่มี** API rotate token ใน repo ปัจจุบัน
4. ตรวจ MySQL: `SELECT machine_code, secret_token_hash IS NOT NULL FROM machines WHERE machine_code='DEMO-01';`

**สำเร็จเมื่อเห็น:** `✅ [SocketIO] machine connected: DEMO-01` ใน log server

### Agent: `websocket disabled`

- ว่าง `MACHINE_ID` หรือ `MACHINE_TOKEN` — ดู [ws_client.py](client/agent/ws_client.py)
- ใน Docker: `SERVER_SOCKET_URL=http://server:8000`

### ชำระแล้วไม่จ่ายของ

- Agent ไม่ได้ connect Socket (ข้างบน)
- `DISPATCH_MODE=http` แต่ `AGENT_URL` ชี้ IP ผิด (compose hardcode `192.168.1.172`) — แก้ URL หรือใช้ `socket` + token ถูกต้อง
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

---

## 22. ไฟล์อ้างอิง


| ไฟล์                                                                               | ความสำคัญ                    |
| ---------------------------------------------------------------------------------- | ---------------------------- |
| [docker-compose.yml](docker-compose.yml)                                           | services, ports, overrides   |
| [.env.example](.env.example)                                                       | ตัวแปรครบ                    |
| [database/init.sql](database/init.sql)                                             | schema + seed                |
| [server/app/realtime/socketio_gateway.py](server/app/realtime/socketio_gateway.py) | Socket auth ตู้              |
| [server/app/api/admin/admin_machines.py](server/app/api/admin/admin_machines.py)   | สร้างตู้ + token             |
| [client/agent/ws_client.py](client/agent/ws_client.py)                             | agent Socket client          |
| [web/machine-ui/Dockerfile](web/machine-ui/Dockerfile)                             | build-time `NEXT_PUBLIC_`*   |
| [web/web-ui/Dockerfile](web/web-ui/Dockerfile)                                     | build-time `NEXT_PUBLIC_*` + runtime `JWT_SECRET` |
| [README2.md](README2.md)                                                           | ภาพรวมโปรเจกต์ + สถาปัตยกรรม |
| [README.md](README.md)                                                             | สรุปสั้น                     |


---

ถ้าเนื้อหาใน repo เปลี่ยน ให้ยึด [docker-compose.yml](docker-compose.yml) และ [.env.example](.env.example) ใน checkout ของคุณเป็นหลัก