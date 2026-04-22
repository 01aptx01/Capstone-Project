# 🤖 Capstone Project: Smart Vending System

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

ระบบจัดการตู้ Vending Machine อัจฉริยะที่ออกแบบมาด้วยสถาปัตยกรรมแบบ **Distributed System** แยกส่วนควบคุม (Agent) และส่วนบริหารจัดการ (Server) ออกจากกันเพื่อความยืดหยุ่นและการขยายตัวในอนาคต

---

## 🌟 Project Vision (วิสัยทัศน์โครงการ)

โปรเจกต์นี้มุ่งเน้นการสร้างระบบตู้ขายสินค้าที่สามารถขยายตัวได้ง่าย (Scalable) โดยใช้หลักการแยกส่วนการทำงาน (Decoupling) ระหว่าง Hardware Control และ Business Logic:

- **Distributed Architecture**: แยก Agent ที่รันบน Edge (Raspberry Pi) ออกจาก Central Server
- **Real-time Synchronization**: จัดการสต็อกและธุรกรรมแบบ Real-time
- **Secure Payments**: รองรับการชำระเงินผ่าน Opn (Omise) พร้อมระบบ Webhook

---

## 🏗️ System Architecture (โครงสร้างระบบ)

ระบบทำงานร่วมกันผ่าน 4 Service หลักบน Docker Container:

1.  **Server (Backend API)**
    - **Stack:** Python (Flask)
    - **Port:** `8000` 
    - **Role:** ศูนย์กลางจัดการ Business Logic, เชื่อมต่อ Database และประสานงานกับส่วนอื่นๆ
2.  **Database (MySQL)**
    - **Stack:** MySQL 8.0
    - **Port:** `3307` (External) / `3306` (Internal)
    - **Role:** เก็บข้อมูลสินค้า, สถานะเครื่อง และบันทึกธุรกรรมทั้งหมด
3.  **Pi-Agent (Edge Control)**
    - **Stack:** Python (Flask)
    - **Port:** `5000`
    - **Role:** รันบน Raspberry Pi เพื่อควบคุม Hardware (GPIO) และรายงานสถานะเครื่อง
4.  **Machine UI (Customer Interface)**
    - **Stack:** Next.js 16, Tailwind CSS 4
    - **Port:** `3000`
    - **Role:** หน้าจอสำหรับลูกค้าเลือกซื้อสินค้า รองรับการแสดงผล QR Code สำหรับชำระเงิน

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS 4, Lucide React |
| **Backend** | Python 3.x, Flask, Flasgger (Swagger) |
| **Database** | MySQL 8.0 |
| **Edge Agent** | Flask, GPIO (Production ready) |
| **Payments** | Opn (Omise) SDK |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Project Structure

```text
Capstone-Project/
├── client/
│   ├── agent/              # Edge Logic (Flask)
│   └── kiosk/              # Legacy or specific kiosk configs
├── server/
│   ├── app/                # Core API Logic
│   ├── main.py             # Entry point
│   └── requirements.txt    # Backend Dependencies
├── database/
│   └── init.sql            # Database Schema & Initial Data
├── web/
│   ├── machine-ui/         # Next.js 16 Frontend (Customer UI)
│   ├── admin-ui/           # Admin Dashboard (WIP)
│   └── web-ui/             # Legacy React UI
├── docker-compose.yml      # Service Orchestration
├── swagger.yaml            # API Documentation
└── .env                    # Environment Config (Required)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker Desktop installed
- Git

### 2. Environment Setup
สร้างไฟล์ `.env` ไว้ที่ Root Directory และกำหนดค่าดังนี้:

```env
# Database Configuration
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=vending

# Omise Payment Keys (Required for Checkout)
OMISE_PUBLIC_KEY=pkey_test_...
OMISE_SECRET_KEY=skey_test_...
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_...

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Running the System
ใช้คำสั่งด้านล่างเพื่อ Build และเริ่มทำงานทุก Service:

```bash
docker compose up --build
```

---

## 🔌 API Reference (Quick Look)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check Server health |
| `POST` | `/api/buy` | Purchase item & update stock |
| `GET` | `/dispense/<slot>` | Trigger physical dispensing (Agent Only) |

> [!TIP]
> สำหรับรายละเอียด API ทั้งหมด สามารถดูได้ที่ [swagger.yaml](./swagger.yaml) หรือเข้าผ่าน `/apidocs` เมื่อรัน Server แล้ว

---

## 📝 Development Guidelines

### Commit Message Guide
เราใช้มาตรฐาน **Conventional Commits**:
- `feat`: เพิ่มฟีเจอร์ใหม่
- `fix`: แก้ไข Bug
- `docs`: แก้ไขเอกสาร
- `style`: ปรับแต่งความสวยงาม/Format (ไม่กระทบ Logic)
- `refactor`: ปรับปรุงโครงสร้างโค้ด
- `chore`: งานจุกจิกทั่วไป

### Workflow (ตัวอย่างการซื้อสินค้า)
1. **Web UI** ส่งคำสั่งซื้อไปที่ **Server**
2. **Server** ตรวจสอบสต็อกใน **DB** และสร้าง Payment Charge
3. เมื่อชำระเงินสำเร็จ **Server** ส่งคำสั่งไปที่ **Pi Agent**
4. **Pi Agent** สั่งจ่ายสินค้าผ่าน GPIO

---

## 🛠️ Troubleshooting

- **Database Connection Error**: ตรวจสอบให้แน่ใจว่าได้สร้างไฟล์ `.env` และรัน `db` container สำเร็จ (Port 3307)
- **Payment Failed**: ตรวจสอบ Omise Keys ในไฟล์ `.env` ว่าถูกต้องและยังไม่หมดอายุ
- **Port Conflict**: หาก Port `3000`, `5000` หรือ `8000` ไม่ว่าง ให้ปรับเปลี่ยนใน `docker-compose.yml`
