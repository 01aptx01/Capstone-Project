// lib/config.ts
// ─── CENTRAL CONFIGURATION ──────────────────────────────────────────────────
// รวบรวมการตั้งค่าส่วนกลางของแอปพลิเคชัน (เช่น การเชื่อมต่อ API, ข้อมูลตู้สินค้า และคีย์ Omise)
// โดยดึงค่าจาก Environment Variables เพื่อแยกการทำงานระหว่าง Dev และ Prod

// ที่อยู่ URL ของระบบหลังบ้าน (Backend API)
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// รหัสประจำตู้น้ำอัจฉริยะ (Machine Code)
export const MACHINE_CODE =
  process.env.NEXT_PUBLIC_MACHINE_CODE ?? "MP1-001";

// คีย์สาธารณะของ Omise สำหรับเข้ารหัสข้อมูลบัตรเครดิตฝั่ง Client ป้องกันข้อมูลรั่วไหล
export const OMISE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY ?? "";

