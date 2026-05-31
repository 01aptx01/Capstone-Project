// lib/api/client.ts
// ─── API FETCH CLIENT ────────────────────────────────────────────────────────
// โมดูลสำหรับจัดการการดึงข้อมูลจากหลังบ้าน (Backend API Wrapper)
// มีหน้าที่ครอบคลุมการเพิ่ม JWT Token ใน Header อัตโนมัติ และตรวจจับ Error จากเซิร์ฟเวอร์

import { API_URL } from "@/lib/config";
import { getTokenFromCookie } from "@/lib/auth/session";

// คลาสจัดการข้อผิดพลาดจากการดึงข้อมูล API (Custom API Error)
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,   // รหัสสถานะ HTTP (e.g., 400, 401, 500)
    public body?: unknown,   // เนื้อความของ Error ที่หลังบ้านส่งกลับมา
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * apiFetch
 * ฟังก์ชันกลางสำหรับเรียกใช้งาน API ด้วย fetch API ของเว็บบราวเซอร์
 * รองรับการใส่ Token อัตโนมัติ และการแปลงผลลัพธ์เป็น JSON
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // 1. ประกอบ URL: หากส่งมาเป็น URL เต็มให้ใช้ทันที ถ้าไม่ ให้ต่อหน้าด้วย API_URL ส่วนกลาง
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  
  // 2. ดึง JWT Token จาก Cookie (เฉพาะเมื่อทำงานบน Browser/Client-side เท่านั้น)
  const token = typeof document !== "undefined" ? getTokenFromCookie() : null;
  
  // 3. กำหนดค่าเริ่มต้นของ Headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  
  // 4. หากมี JWT Token ให้เพิ่ม Authorization Header ในรูปแบบ Bearer Token
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 5. ส่งคำขอไปยังเซิร์ฟเวอร์หลังบ้าน
  const res = await fetch(url, {
    ...init,
    headers,
  });

  // 6. อ่านเนื้อหาของผลลัพธ์ที่ได้รับ
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text); // พยายามแปลงเป็น JSON ออบเจกต์
    } catch {
      data = text;             // หากแปลงไม่ได้ให้เก็บเป็น Text ธรรมดา
    }
  }

  // 7. จัดการกรณีที่เกิด Error (HTTP Status code >= 400 หรือ != 2xx)
  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    
    // โยน Custom Error ออกไปเพื่อให้ฝั่ง UI นำไปแสดงแจ้งเตือนผู้ใช้งาน
    throw new ApiError(msg, res.status, data);
  }

  // 8. ส่งข้อมูลที่แปลงเรียบร้อยแล้วกลับไปในรูปแบบ Generic Type T
  return data as T;
}

