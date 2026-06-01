# Machine UI — แผนทดสอบเคสทั้งหมด (Kiosk / Edge Cases)

เอกสารนี้ใช้สำหรับทดสอบ **Machine UI** + flow ที่เกี่ยวกับ Pi agent, Socket, active-order lock และ post-payment — โดยเฉพาะก่อนปรับ UI/UX รอบถัดไป

อ้างอิงการรัน stack: [how-to-run.md](../how-to-run.md)

---

## 1. สิ่งที่ต้องเตรียมก่อนเทส

### 1.1 บริการที่ต้องรัน

| บริการ | URL / คำสั่ง | หมายเหตุ |
|--------|----------------|----------|
| Stack ทั้งหมด | `docker compose up --build` | จาก root repo |
| Machine UI | http://localhost:3000 | rebuild หลังแก้ `NEXT_PUBLIC_*` |
| Server API | http://localhost:8000 | health: `/health` |
| Pi agent (Docker) | container `client` / `vending-pi` | `docker logs vending-pi -f` |
| Admin | http://localhost:3001 | ดูสถานะตู้ / order |

### 1.2 ตัวแปรสำคัญใน `.env`

- `MACHINE_CODE` = `NEXT_PUBLIC_MACHINE_CODE` (เช่น `MP1-001`)
- `MACHINE_TOKEN` ตรงกับ Admin / seed
- `KIOSK_SOCKET_SECRET` = `NEXT_PUBLIC_KIOSK_SOCKET_SECRET` (ไม่ว่าง)
- `NEXT_PUBLIC_API_URL` ชี้ server (Docker มักเป็น `http://localhost:8000`)

### 1.3 เครื่องมือที่เปิดคู่กับทุกเคส

1. **Browser DevTools** (Machine UI): Console + Network (กรอง `active-order`, `checkout`, `create-draft`, `socket.io`)
2. **Server log:** `docker logs vending-server -f` (หา `machine connected`, `job.start`, `MACHINE_BUSY`)
3. **Pi log:** `docker logs vending-pi -f` (หา `[WS] connected`, `POST /nfc/arm`, `job.start`)
4. **(ถ้าต้องการ)** MySQL `localhost:3307` — ตาราง `orders`, `machine_job_events`

### 1.4 สัญลักษณ์ในตารางเคส

| คอลัมน์ | ความหมาย |
|--------|----------|
| **P0** | ต้องผ่านก่อนปล่อยใช้งานจริง |
| **P1** | สำคัญ แต่ยอมรับชั่วคราวได้ถ้ามี workaround |
| **P2** | regression / polish / เคสหายาก |

| สถานะ UI ที่คาด | รายละเอียด |
|-----------------|------------|
| Overlay **hardware** | เต็มจอ: "ระบบขัดข้องชั่วคราว" + "กำลังพยายามเชื่อมต่อตู้..." |
| Overlay **internet** | เต็มจอ: "สัญญาณขัดข้องชั่วคราว" + "กำลังพยายามเชื่อมต่อเซิร์ฟเวอร์..." |
| Overlay **order_busy** | เต็มจอ: "ตู้กำลังดำเนินการออเดอร์ก่อนหน้า" |
| **ไม่ overlay** | หน้าหลักหรือ modal ใช้งานได้ตาม flow |
| แบนเนอร์ **ส้ม** (processing) | Pi offline แต่ kiosk Socket ยังอยู่ |
| แบนเนอร์ **แดง** (processing) | kiosk Socket หลุด |
| แบนเนอร์ **ฟ้า** (processing) | รอ event / poll order (~60s แล้ว poll 2s) |

---

## 2. Smoke — ระบบพร้อมเทส

| ID | P | ขั้นตอน | ผลที่คาดหวัง |
|----|---|---------|----------------|
| S-01 | P0 | เปิด http://localhost:8000/health | JSON OK |
| S-02 | P0 | เปิด http://localhost:3000 | โหลดสินค้าได้ ไม่มี error secret ใน console |
| S-03 | P0 | `docker logs vending-pi` | `[WS] connected` ไม่วนซ้ำ Authentication failed |
| S-04 | P0 | `docker logs vending-server` | `machine connected: <MACHINE_CODE>` |
| S-05 | P0 | Admin → Machines | Socket / online แสดงเชื่อมต่อ (ถ้ามี UI) |
| S-06 | P1 | `GET /api/buy/active-order?machine_code=MP1-001` | `{"busy":false}` เมื่อไม่มี order ค้าง |

**วิธีเทส S-06 (PowerShell / curl):**

```powershell
curl "http://localhost:8000/api/buy/active-order?machine_code=MP1-001"
```

---

## 3. Pre-pay — Pi gate (ก่อนจ่ายเงิน)

เป้าหมาย: ก่อนชำระสำเร็จ ต้อง **Pi online** (`isAgentOnline`) ถึงจะซื้อได้; kiosk Socket หลุดแสดงข้อความต่างจาก Pi หลุด

| ID | P | วิธีจำลอง | ขั้นตอน | UI / พฤติกรรมที่คาด |
|----|---|-----------|---------|---------------------|
| G-01 | P0 | หยุด Pi ตั้งแต่ต้น | `docker stop vending-pi` → เปิด Machine UI | Overlay **hardware**; จุด status สีส้ม; กดเพิ่มสินค้า/ชำระไม่ได้ |
| G-02 | P0 | จาก G-01 | `docker start vending-pi` รอ ~5–10s | Overlay หาย; ซื้อได้ |
| G-03 | P0 | Pi หลุดกลางหน้าหลัก | ซื้อได้ → `docker stop vending-pi` | Overlay **hardware** กลับ; checkout ไม่ทำงาน |
| G-04 | P1 | หยุด server หรือผิด `KIOSK_SOCKET_SECRET` | rebuild UI ถ้าแก้ secret; ตัด network ไป server | Overlay **internet** (kiosk Socket หลุด) |
| G-05 | P0 | Pi online ปกติ | เลือกของ → ชำระเงิน → เปิด payment modal | **ไม่** overlay ทับ modal |
| G-06 | P1 | DevTools | ดู Socket connect + event `machine_presence` | `isAgentOnline` สอดคล้องกับ Admin/Pi log |

**หมายเหตุ:** ระหว่าง **numpad / processing** (หลังจ่ายแล้ว) **ไม่** ใช้ full-page overlay แม้ Pi หลุด — ดูหมวด 5–6

---

## 4. Active order lock (`order_busy`)

เป้าหมาย: ห้ามสั่งซื้อใหม่เมื่อตู้มี order ค้าง; ยกเว้น draft ของ session ชำระเงิน; draft เกิน 15 นาทีถูก cancel

| ID | P | วิธีจำลอง | ขั้นตอน | UI / API ที่คาด |
|----|---|-----------|---------|-----------------|
| B-01 | P0 | จ่ายสำเร็จแล้วรีเฟรชกลางทาง | ซื้อจนถึง numpad/processing → **F5** | หน้าหลัก Overlay **order_busy**; ซื้อใหม่ไม่ได้ |
| B-02 | P0 | จาก B-01 | รอจนจ่ายของจบ (`orders.status` = `completed`) หรือแก้ใน DB | Overlay หายภายใน ~10s (poll active-order) |
| B-03 | P0 | Payment + NFC draft | เลือกบัตร → step 2 → create-draft → **รอ >15s** บน modal | **ไม่** overlay ทับ payment modal (exclude_charge_id) |
| B-04 | P0 | สอง session / สอง draft | Tab A: create-draft ค้าง; Tab B: เปิดหน้าหลัก | Tab B: overlay **order_busy** หรือ create-draft ได้ 409 |
| B-05 | P1 | API ตรง | `curl active-order` ขณะมี `paid` | `"busy":true`, มี `charge_id`, `status` |
| B-06 | P1 | API + exclude | ขณะชำระ draft `draft_xxx` | `active-order?exclude_charge_id=draft_xxx` → `busy:false` (ถ้าไม่มี order อื่น) |
| B-07 | P0 | 409 ใน modal | Tab B พยายาม checkout ขณะ Tab A `paid` | Payment modal แสดงข้อความแดง "ตู้กำลังดำเนินการออเดอร์ก่อนหน้า..." |
| B-08 | P2 | DB manual | `UPDATE orders SET status='paid'` ค้าง | Overlay order_busy จน sweeper/แก้ status |

**วิธีเทส B-05 / B-06:**

```powershell
# มี order ค้าง
curl "http://localhost:8000/api/buy/active-order?machine_code=MP1-001"

# ยกเว้น draft ปัจจุบัน
curl "http://localhost:8000/api/buy/active-order?machine_code=MP1-001&exclude_charge_id=draft_XXXXX"
```

**วิธีเทส B-01 ตรวจ DB:**

```sql
SELECT charge_id, status, created_at, updated_at
FROM orders
WHERE machine_code = 'MP1-001'
ORDER BY created_at DESC
LIMIT 5;
```

### 4.1 Sweeper — `pending_payment` > 15 นาที

| ID | P | วิธีจำลอง | ผลที่คาด |
|----|---|-----------|----------|
| B-S1 | P1 | สร้าง draft แล้วทิ้ง >15 นาที (หรือแก้ `created_at` ใน DB ย้อนหลัง) | เรียก active-order → cancel stale → `busy:false`; ซื้อใหม่ได้ |
| B-S2 | P2 | จ่าย Omise หลัง DB cancel แล้ว | **out of scope** — อาจต้อง support manual; บันทึกผลถ้าเจอ |

### 4.2 Sweeper — `paid` / `dispensing` > 45 นาที

| ID | P | วิธีจำลอง | ผลที่คาด |
|----|---|-----------|----------|
| B-S3 | P1 | ตั้ง `orders.status='paid'` และ `updated_at` ย้อน >45 นาที; รอ sweeper ≤5 นาที | status → `dispense_failed`; server log refund queued; kiosk ซื้อใหม่ได้ |
| B-S4 | P1 | หลัง B-S3 | `active-order` → `busy:false` |

**SQL จำลอง B-S3 (dev only):**

```sql
UPDATE orders
SET status = 'paid', updated_at = DATE_SUB(NOW(), INTERVAL 50 MINUTE)
WHERE charge_id = 'chrg_xxxx';
```

---

## 5. Payment flow (ก่อน post-payment)

| ID | P | ช่องทาง | ขั้นตอน | ผลที่คาด |
|----|---|---------|---------|----------|
| P-01 | P0 | PromptPay / QR | เลือกของ → QR → mock-pay (dev) | ไป numpad; server `job.start` |
| P-02 | P0 | บัตร + NFC | ชำระ → step 2 → create-draft → arm → แตะ/ simulate | Console `[NFC] armed`; agent `POST /nfc/arm` 200 |
| P-03 | P0 | NFC ก่อน arm | แตะก่อน step 2 | Agent `ignored (not armed)`; ไม่จ่าย |
| P-04 | P0 | create-draft fail | หยุด server ชั่วคราวก่อน draft | ข้อความแดงใน modal; กลับ step 1 |
| P-05 | P1 | Pi offline ก่อน checkout | G-01 แล้วกดชำระ | ไม่เปิด flow / guard ไม่ทำงาน |
| P-06 | P1 | Timeout payment | เปิด payment รอ countdown = 0 | modal ปิด; cancel API; active-order refresh |
| P-07 | P1 | mock-pay ซ้อน order | order A `paid` ค้าง; mock-pay order B | 409 MACHINE_BUSY หรือไม่ dispense ซ้อน |

**วิธีเทส P-02 (Docker):** ดู `docker logs vending-pi` หลังเข้า step แตะบัตร

---

## 6. Post-payment — numpad, processing, Socket, poll

หลังจ่ายสำเร็จ: `isPostPaymentFlow` = true → **ไม่** full-page gate; ใช้ modal + แบนเนอร์

| ID | P | วิธีจำลอง | ขั้นตอน | UI ที่คาด |
|----|---|-----------|---------|-----------|
| A-01 | P0 | Happy path | จ่ายครบ → numpad (ข้าม/ใส่เบอร์) → processing | Stepper ตาม `job_event_broadcast`; ไม่ countdown ปลอมตลอด |
| A-02 | P0 | Pi หลุดหลังจ่าย | ระหว่าง processing: `docker stop vending-pi` | **ไม่** overlay เต็มจอ; แบนเนอร์ **ส้ม** หรือ **ฟ้า** หลัง ~60s |
| A-03 | P0 | Pi กลับ | จาก A-02: `docker start vending-pi` | job replay; UI ควรก้าวต่อหรือ poll เห็น `dispensing`/`completed` |
| A-04 | P1 | Kiosk Socket หลุด | ตัด network ระหว่าง processing | แบนเนอร์ **แดง** ใน ProcessingModal |
| A-05 | P0 | Pi offline ตลอด ~2 นาที | ไม่มี event 60s+ | แบนเนอร์ **ฟ้า**; poll `/api/buy/status/{charge_id}` ทุก 2s |
| A-06 | P1 | Poll recovery | Pi offline แต่ server อัป status เป็น `dispensing` | UI `orderRecoveredSuccess` / แสดงสำเร็จตาม logic |
| A-07 | P1 | Poll timeout | Pi offline >~2 นาที poll ครบ | ข้อความ give-up / ติดต่อเจ้าหน้าที่ |
| A-08 | P0 | รีเฟรชกลาง processing | F5 ระหว่าง processing | กลับหน้าหลัก; **ไม่** resume UI; B-01 บล็อกซื้อใหม่ถ้า order ยังไม่จบ |

**วิธีเทส A-05 (Network tab):** หลัง 60s บน processing ควรเห็น request ซ้ำไปที่ `/api/buy/status/<charge_id>` ทุก ~2s

---

## 7. Socket / การเชื่อมต่อ

| ID | P | ขั้นตอน | ผลที่คาด |
|----|---|---------|----------|
| K-01 | P0 | โหลดหน้าใหม่ | Socket reconnect; `machine_presence` ส่งสถานะ Pi ปัจจุบัน |
| K-02 | P1 | Pi connect หลัง kiosk | Overlay hardware หายโดยไม่ต้อง F5 |
| K-03 | P1 | `activeJobId` หลังจ่าย | มี `charge_id` ใน post-payment → filter event ตาม job |
| K-04 | P2 | Event หลุดช่วง disconnect | หลัง reconnect อาจไม่ replay event เก่า — พึ่ง poll (A-05) |

---

## 8. End-to-end regression (ซื้อจบ 1 รอบ)

ใช้เป็น checklist หลังแก้ UI ทุกครั้ง

| ลำดับ | การกระทำ | ผ่าน? |
|-------|----------|-------|
| 1 | Pi + server online, ไม่มี overlay | ☐ |
| 2 | เพิ่มสินค้า 1–2 ชิ้น → ชำระ (วิธีที่ใช้บ่อย) | ☐ |
| 3 | numpad → processing → ปิดจอจบ | ☐ |
| 4 | สต๊อกลด / `machine_job_events` มีแถวใหม่ | ☐ |
| 5 | หน้าหลักซื้อรอบ 2 ได้ทันที (ไม่ order_busy) | ☐ |
| 6 | Admin เห็น order `completed` | ☐ |

---

## 9. เคสที่ยังไม่ครอบ (บันทึกผลเมื่อเทส)

ใช้คอลัมน์ "ผลจริง" สำหรับรอบปรับ UI ถัดไป

| ID | เคส | ทำไมยังไม่บังคับ | สิ่งที่ควรสังเกตเมื่อเทส |
|----|-----|------------------|-------------------------|
| X-01 | กู้คืน UI หลัง F5 (processing) | ตั้งใจไม่ทำ | ลูกค้าเห็นหน้าหลัก + order_busy |
| X-02 | จ่ายสำเร็จหลัง draft cancel (>15 นาที) | หายาก | เงินหักแต่ไม่จ่ายของ — support |
| X-03 | ซื้อได้ภายใน ~10s หลัง `completed` | poll interval | อาจกดซื้อซ้ำเร็วเกินไป |
| X-04 | Admin auth / NFC arm secret | P1 ข้าม | security review แยก |
| X-05 | Cart +/- ตอน order_busy | overlay บัง | ควรกดไม่ได้ทั้งหมด |

---

## 10. ชีตบันทึกผล (คัดลอกไปใช้ใน PR / Notion)

```markdown
| ID | วันที่ | ผู้เทส | ผล (PASS/FAIL) | สกรีน / หมายเหตุ | UI issue # |
|----|--------|--------|----------------|------------------|------------|
| G-01 | | | | | |
| B-03 | | | | | |
| A-02 | | | | | |
```

---

## 11. แนวทางแก้ UI หลังเทส (placeholder)

เมื่อ FAIL ให้จดว่าเป็นหมวดไหน:

1. **Overlay / z-index** — ทับ modal ผิด, ข้อความผิด variant (internet vs hardware vs order_busy)
2. **Typography / spacing** — อ่านยากระยะไกล, ภาษาไทยยาว
3. **ProcessingModal** — สีแบนเนอร์, ลำดับแสดงเมื่อมีหลายแบนเนอร์พร้อมกัน
4. **Payment modal** — error 409 ไม่เด่น, step กลับไม่ชัด
5. **Loading / empty** — ช่วง poll 60s ลูกค้าไม่รู้ว่าระบบยังทำงาน
6. **Status dot** — สีส้มบน header ไม่สื่อความหมาย

---

## 12. ลำดับแนะนำสำหรับรอบทดสอบ UI

1. รัน **Smoke (§2)** ให้ครบ
2. **G-01 → G-02 → G-05** (Pi gate)
3. **P-02** (NFC happy path)
4. **A-01** (จบ 1 รอบ)
5. **B-01, B-03, B-07** (order lock + exclude draft)
6. **A-02 → A-03 → A-05** (post-pay Pi offline + poll)
7. เคส **P1/P2** และ sweeper ตามเวลาว่าง

---

## 13. อ้างอิงไฟล์หลัก

| หัวข้อ | ไฟล์ |
|--------|------|
| Overlay + gate logic | `web/machine-ui/src/app/page.tsx` |
| ข้อความ overlay | `web/machine-ui/src/components/HardwareGateOverlay.tsx` |
| Payment + 409 | `web/machine-ui/src/hooks/usePayment.ts` |
| Poll active-order | `web/machine-ui/src/hooks/useMachineBusy.ts` |
| Poll order หลัง 60s | `web/machine-ui/src/hooks/useHeatingProcess.ts` |
| Processing banners | `web/machine-ui/src/components/modals/ProcessingModal.tsx` |
| API busy / active-order | `server/app/api/buy.py` |
| Blocking query + sweepers | `server/app/services/buy_service.py`, `server/main.py` |

---

*อัปเดตตาม stack ณ วันที่สร้างเอกสาร — ถ้า behavior ใน repo เปลี่ยน ให้ sync กับ `how-to-run.md` §6.2*
