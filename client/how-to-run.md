# วิธีการรันระบบฝั่ง Client (ตู้จำหน่ายสินค้า) โดยไม่ใช้ Docker

เอกสารนี้อธิบายวิธีการรันส่วนประกอบฝั่ง Client ได้แก่ **Hardware Agent** และ **Vending UI (Machine UI)** โดยตรงบนเครื่อง (เช่น รันบนบอร์ด Raspberry Pi หรือทดสอบจำลองบนคอมพิวเตอร์ Windows) โดยไม่ต้องพึ่งพา Docker

---

## 1. การรันแบบอัตโนมัติ (Auto-run)

### 1.1 สำหรับรันบน Raspberry Pi / Linux (`start-machine.sh`)
เรามีสคริปต์ `start-machine.sh` ที่ช่วยในการเตรียม Virtual Environment, ติดตั้ง Dependencies, และรัน Agent ให้อัตโนมัติ

**วิธีใช้งาน:**
1. เปิด Terminal และเข้าไปที่โฟลเดอร์ `client/agent`
   ```bash
   cd client/agent
   ```
2. กำหนดสิทธิ์ให้รันได้ (ทำแค่ครั้งแรก)
   ```bash
   chmod +x start-machine.sh
   ```
3. สั่งรันสคริปต์
   ```bash
   ./start-machine.sh
   ```
> **หมายเหตุ:** 
> - ในการรันครั้งแรก สคริปต์จะถามข้อมูลตู้ (`MACHINE_ID`, `MACHINE_TOKEN`, `SERVER_IP`) เพื่อนำไปสร้างไฟล์ `.env` อัตโนมัติ
> - สคริปต์นี้จะ **สุ่มหาพอร์ตที่ว่างให้ Agent อัตโนมัติ** (เริ่มต้นที่ 5000) ไม่ต้องใส่ใน `.env` เอง
> - **สำหรับหน้าจอ UI:** สคริปต์นี้จะสั่งให้ Agent เปิดเบราว์เซอร์ Chromium ขึ้นมาเป็นโหมด Kiosk และดึงหน้า UI จากเครื่อง Server กลางมาแสดงผลให้อัตโนมัติ **(ดังนั้นบน Raspberry Pi จึงไม่ต้องติดตั้ง Node.js หรือรันคำสั่ง npm ใดๆ ทั้งสิ้น)**

### 1.2 สำหรับการจำลองบนคอมพิวเตอร์ Windows (`run-machine.ps1`)
หากคุณเป็นนักพัฒนาและต้องการจำลองตู้ (Simulation) บน Windows ทางเรามีสคริปต์ PowerShell ที่รวมการตั้งค่าและรันทั้ง Agent และ UI ไว้ในสคริปต์เดียว

**วิธีใช้งาน:**
1. เปิด PowerShell (หรือ Terminal ใน VS Code) ไปที่โฟลเดอร์ `client`
   ```powershell
   cd client
   ```
2. สั่งรันสคริปต์และระบุหมายเลขตู้ที่ต้องการ (เช่น Index 1)
   ```powershell
   ./run-machine.ps1 -Index 1
   ```
> **หมายเหตุ:** สคริปต์นี้จะหาหมายเลขพอร์ตที่ว่างให้อัตโนมัติ (ป้องกันพอร์ตชนเมื่อต้องการเปิดจำลองหลายตู้พร้อมกัน) จากนั้นจะเด้งหน้าต่าง Terminal ใหม่ขึ้นมา 2 หน้าต่าง เพื่อรัน **Agent** (ทำงานในโหมด Simulation ไม่เรียกหาอุปกรณ์ GPIO) และรัน **Machine UI** (Next.js) ให้พร้อมใช้งานทันที

---

## 2. การรันแยกทีละส่วน (Manual Step-by-Step)

หากคุณไม่ต้องการใช้ Auto Script หรือต้องการแยกเปิดทีละโปรแกรมเพื่อความสะดวกในการดู Log เช็ค Error หรือเพื่อ Debug งาน ให้ทำตามขั้นตอนต่อไปนี้

### 2.1 การรัน Hardware Agent (Python)
ส่วนของ Agent ทำหน้าที่เชื่อมต่อกับฮาร์ดแวร์ (ตัวอ่านบัตร NFC, ไฟ LED) และสื่อสารข้อมูลกับส่วนกลาง (Server)

1. เข้าไปที่โฟลเดอร์ `client/agent`
   ```bash
   cd client/agent
   ```
2. สร้างและเปิดใช้งาน Virtual Environment
   * **Linux / Mac:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   * **Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
3. ติดตั้ง Dependencies
   * **กรณีรันบน Raspberry Pi (เครื่องจริงมี GPIO):**
     ```bash
     pip install -r requirements.txt
     ```
   * **กรณีรันบน Windows / PC (โหมดจำลอง ไม่มี GPIO):**
     ```powershell
     pip install -r requirements-sim.txt
     ```
4. เตรียมไฟล์ Environment
   * คัดลอกไฟล์ `.env.example` แล้วเปลี่ยนชื่อเป็น `.env`
   * เปิดไฟล์ `.env` และแก้ไขค่าที่สำคัญ:
     * `MACHINE_ID` และ `MACHINE_TOKEN` (ได้มาจากการกดปุ่มสร้างตู้ใหม่ที่หน้า Admin UI)
     * `SERVER_SOCKET_URL` (ชี้ไปยัง IP ของ Server ตัวหลัก เช่น `http://192.168.1.44:8000`)
5. เริ่มการทำงานของ Agent
   ```bash
   python3 agent.py  # หรือ python agent.py บน Windows
   ```

### 2.2 การรัน Vending UI / Machine UI (Next.js) **[เฉพาะบนคอมพิวเตอร์ / PC]**
บน Raspberry Pi ของจริง **ไม่ต้องรันส่วนนี้** (เพราะตัว Agent จะดึงหน้าเว็บจาก Server กลางมาแสดงผลเอง) แต่ถ้าคุณกำลังทดสอบบนคอมพิวเตอร์แบบรันแยก และอยากรัน UI ด้วยตัวเอง ให้ทำตามนี้ครับ:

1. เปิด Terminal แถบใหม่ แล้วเข้าไปที่โฟลเดอร์ `web/machine-ui` (ย้ำว่าอยู่ข้างนอกโฟลเดอร์ client)
   ```bash
   cd web/machine-ui
   ```
2. ติดตั้งแพ็กเกจ Node.js
   ```bash
   npm install
   ```
3. เริ่มต้น Vending UI
   ```bash
   npm run dev
   ```
> **หมายเหตุ:** Vending UI จะรันที่พอร์ต 3000 (`http://localhost:3000`) คุณจะต้องระบุหมายเลขตู้ และตั้งค่า `NEXT_PUBLIC_AGENT_BASE_URL` ชี้ไปหาพอร์ตที่ Agent ของคุณกำลังรันอยู่ (เช่น 5000) ในไฟล์ `.env.local` เพื่อให้ UI คุยกับ Agent รู้เรื่อง

---

## 3. สิ่งสำคัญที่ต้องรันร่วมด้วยบนส่วนกลาง (Server)

แม้ว่าคุณจะรันโปรแกรมฝั่ง Client (Agent + Vending UI) แบบไม่ใช้ Docker ได้สำเร็จ แต่ฝั่ง Client ไม่สามารถทำงานโดดเดี่ยวได้ 

**เซิร์ฟเวอร์ส่วนกลาง (Server API และ Database) จะต้องถูกรันอยู่เสมอ** บนเครื่องหลักหรือเครื่องแม่ข่าย (เช่น การรันผ่าน `docker compose up -d db server` บนคอมพิวเตอร์ของคุณ) เพื่อให้ Agent สามารถโหลดข้อมูลสินค้า, ตรวจสอบการทำรายการชำระเงิน, และส่งสถานะกลับไปอัปเดตที่ส่วนกลางได้อย่างถูกต้องครับ
