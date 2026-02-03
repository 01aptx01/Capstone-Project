# 🤖 Capstone Project: Smart Vending System

ระบบจัดการตู้ Vending Machine อัจฉริยะที่ออกแบบมาด้วยสถาปัตยกรรมแบบ **Distributed System** แยกส่วนควบคุม (Agent) และส่วนบริหารจัดการ (Server) ออกจากกันเพื่อความยืดหยุ่นและการขยายตัวในอนาคต

## 🏗️ System Architecture (โครงสร้างระบบ)

โปรเจกต์นี้ทำงานร่วมกันผ่าน 3 Service หลักบน Docker:

1.  **Server (Backend API)**
    
    -   **Stack:** Python (Flask)
        
    -   **Port:** `8000` 
        
    -   **Role:** ตัวแม่คอยจัดการ Business Logic ทั้งหมด เชื่อมต่อ Database และประสานงานกับส่วนอื่นๆ
        
2.  **Database (MySQL)**
    
    -   **Stack:** MySQL 8.0
        
    -   **Role:** คลังเก็บข้อมูลสินค้า และสถานะต่างๆ ของระบบ
        
3.  **Pi-Agent (Edge Control)**
    
    -   **Stack:** Python (Flask)
        
    -   **Network:** `host` mode (เพื่อการเชื่อมต่อฮาร์ดแวร์ที่รวดเร็ว)
        
    -   **Port:** `5000`
        
    -   **Role:** รันบนตัวตู้จริงเพื่อรับคำสั่งจ่ายของ (Dispense) และคอยรายงานสถานะเครื่อง

4.  **Web-UI**
    
    -   **Stack:** React.js, Node.js, Bootstrap
    
    -   **Port:** `3000`

    -   **Role:** ส่วนติดต่อผู้ใช้งาน (User Interface) สำหรับให้ลูกค้าเลือกซื้อสินค้าบนหน้าจอpi และแอดมินสามารถดูสถานะของตู้สินค้าได้บนเว็ป


## 📂 Project Structure

Plaintext

```
Capstone-Project-main/
├── client/
│   └── agent/
│       ├── agent.py        # โค้ดควบคุมการจ่ายของ (Edge Logic)
│       └── Dockerfile      # สภาพแวดล้อมสำหรับรัน Agent
|
├── server/
│   ├── main.py             # ศูนย์กลาง API Gateway
│   ├── requirements.txt    # Library ที่ต้องใช้
│   └── Dockerfile          # สภาพแวดล้อมสำหรับรัน Server
|
├── database/
│   └── init.sql            # ไฟล์ Setup Database เริ่มต้น
|
├── web/
│   └── web-ui/             # โค้ดส่วนหน้าจอ UI (React.js)
│       ├── src/            # ไฟล์ Source Code หลัก
│       │   ├── api/        # ส่วนเชื่อมต่อ API กับ Server
│       │   └── pages/      # หน้าแสดงผลต่างๆ เช่น หน้าตู้ขายสินค้า
│       └── Dockerfile      # สภาพแวดล้อมสำหรับรัน Web UI
|
├── docker-compose.yml      # ไฟล์บงการทุก Service ให้ทำงานร่วมกัน
├── swagger.yaml            # เอกสารอธิบาย API (API Documentation)
├── .gitignore              # ป้องกันไฟล์ขยะหลุดขึ้น Repo
└── .env                    # ไฟล์เก็บ Config สำคัญ (ต้องสร้างเอง)

```

## 🚀 Getting Started (เริ่มลุยกันเลย)

### 1. สิ่งที่ต้องมีในเครื่อง

-   **Docker & Docker Compose**
    

### 2. การเตรียมตัวก่อนรัน (สำคัญมาก!) 🆕

**ก. สร้างไฟล์ `.env`:** เนื่องจากระบบดึงค่าจาก Environment Variable ให้สร้างไฟล์ชื่อ `.env` ไว้ที่ Root Folder แล้วใส่ค่าดังนี้:

ข้อมูลโค้ด

```
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=vending

```

**ข. ตรวจสอบ Docker Build Path:** ในไฟล์ `docker-compose.yml` ตรวจสอบว่า `pi-agent` ชี้ไปที่ Folder ที่ถูกต้อง:

-   **ต้องเป็น:** `build: ./client/agent`
    

### 3. คำสั่งรันระบบ

เปิด Terminal ในโฟลเดอร์หลักแล้วจัดไป:

Bash

```
docker-compose up --build

```

_ระบบจะทำการ Build Image และดึงฐานข้อมูลขึ้นมาให้อัตโนมัติ_

## 🔌 API Documentation & Testing 🆕

#### 🖥️ Server API (`localhost:8000`)

-   **System Health**
    
    -   **Method:** `GET`
        
    -   **Endpoint:** `/health`
        
    -   **Description:** เช็คสถานะการออนไลน์ของ Server
        
-   **Purchase (ซื้อสินค้า)**
    
    -   **Method:** `POST`
        
    -   **Endpoint:** `/api/buy`
        
    -   **Description:** สั่งซื้อสินค้า ตัดสต็อก และบันทึก Transaction
        
    -   **Body (JSON):** `{ "machine_id": 1, "product_id": 1 }`
        

#### 🤖 Agent API (`localhost:5000`)

-   **Dispense Item**
    
    -   **Method:** `GET`
        
    -   **Endpoint:** `/dispense/<slot>`
        
    -   **Example:** `curl http://localhost:5000/dispense/1`
        
-   **Agent Health**
    
    -   **Method:** `GET`
        
    -   **Endpoint:** `/health`
        

## 🛠️ Troubleshooting (แก้ปัญหาแบบตัวตึง)

-   **MySQL เชื่อมต่อไม่ได้:** ตรวจสอบไฟล์ `.env` และดูว่า Container `db` รันสมบูรณ์หรือยัง
    
-   **Port ชน:** ถ้าเครื่องคุณใช้พอร์ต `8000`, `5000` หรือ `3306` อยู่ ให้ไปเปลี่ยนที่ `ports` ใน `docker-compose.yml`


## 📝 Commit Message Guide

ใช้หลักการ **Conventional Commits** เพื่อความเป็นระเบียบและเป็นมาตรฐานสากล

**Format:** `type(scope): subject`

**หัวข้อ (Type) ที่ควรใช้:**

-   **feat:** เพิ่มฟีเจอร์ใหม่ (New Feature)
    
-   **fix:** แก้บั๊ก (Bug Fix)
    
-   **docs:** แก้ไขเอกสาร เช่น README (Documentation)
    
-   **style:** จัด format โค้ด, เติม semicolon (ไม่กระทบ logic)
    
-   **refactor:** รื้อโค้ด เขียนใหม่ให้ดีขึ้น แต่ผลลัพธ์เหมือนเดิม
    
-   **chore:** งานจุกจิก เช่น อัปเดต version, แก้ .gitignore

# การทำงานของทั้งหมดแบบย่อ
เราแบ่งออก 3 ส่วนหลัก คือ
## web(html+css+javaScript)
ส่วนนี้เราใช้ react เป็นหลัก ซึ่งเอาไว้เป็นเพียง UI ในการสั่งงาน
- ไม่แตะ DB เอง
- ไม่สั่ง GPIO(สั่งงาน pi) โดยตรง
แค่บอกว่าผู้ใช้กดคำสั้งอะไร เช่น “มีคนกดซื้อแล้วนะ”
มันจะสั่งงานไปให้ตัว Server ทำงานอีกที
## Server(py)
ส่วนนี้เราใช้เป็นสมองหลักในการทำงานเลยเพราะทุกส่วนต้องมาติดต่อตรงนี้ก่อนเป็นตัวจัดการ business logic
Server ทำหน้าที่:
- ตัดสินใจ
- ตรวจสอบ
- คุม flow
- บังคับกฎ (business logic)
เช่น เมื่อ Server ได้ request จาก Web:

``` text
รับคำสั่งจาก Web
→ เช็ค DB
→ ตัด stock
→ log transaction
→ ตัดสินใจว่าจะสั่ง Pi หรือไม่
```

Server เป็นคนเดียวที่:
- คุยกับ DB
- คุยกับ Pi
- รู้สถานะทั้งหมดของระบบ

## DB (MySQL)
เก็บข้อมูลทั้งหมด ทุกตู้

## Raspberry Pi(py) (Agent)
ส่วนที่ติดต่อกับ Hardware

Pi:
- ไม่รู้ราคา
- ไม่รู้ stock
- ไม่รู้ user

Pi แค่ทำตามคำสั่ง:
``` text
Server (หรือ Web หลัง Server อนุญาต)
→ /dispense/1
→ GPIO ทำงาน
```

Flow ที่ “ถูกต้องตามสถาปัตยกรรม”

กรณีซื้อของ 1 ครั้ง:
``` pgsql
1. User กดปุ่ม (Web)
2. Web → Server : buy
3. Server → DB : check & update stock
4. DB → Server : OK
5. Server → Web : success + slot
6. Web → Pi Agent : dispense
```

# การคุยกันข้ามภาษา
- Web (React) → เขียนด้วย JavaScript
- Server → เขียนด้วย Python (Flask)
- Pi Agent → Python
- DB → MySQL (SQL)
เราจะคุยกันด้วย __HTTP + JSON__ ผ่าน __HTTP Request / Response__

เช่น การกดซื้อสินค้า

Web -> server -> DB
``` json
{
  "machine_id": 1,
  "product_id": 1
}
```
server ก็ไปทำ Logic ต่างๆ แล้วส่งให้ DB ไปตัดของใน Database แล้ว server ส่ง respon กลับมา เช่น ``` json { status: "OK", slot: 1 } ```

