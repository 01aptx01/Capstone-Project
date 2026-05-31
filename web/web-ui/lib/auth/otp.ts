// lib/auth/otp.ts
// ─── OTP AUTHENTICATION WRAPPER ──────────────────────────────────────────────
// ชุดฟังก์ชันอ้างอิง API ในการจัดการรหัสผ่านชั่วคราว (One-Time Password - OTP)
// สำหรับระบุตัวตนและลงชื่อเข้าใช้งานของสมาชิกผู้ใช้งานตู้น้ำ MOD PAO

import { apiFetch } from "@/lib/api/client";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// ผลลัพธ์การร้องขอให้ระบบส่งรหัส OTP
export interface SendOtpResponse {
  status: string;                   // สถานะคำขอ (เช่น "success")
  expires_in: number;               // ระยะเวลาที่รหัสใช้งานได้ (วินาที)
  delivery?: string;                // ช่องทางส่ง เช่น "sms"
}

// ผลลัพธ์การส่งรหัส OTP ไปยืนยันความถูกต้อง
export interface VerifyOtpResponse {
  status: string;                   // สถานะการยืนยัน
  access_token: string;             // JWT Access Token ที่ใช้สำหรับการเรียก API ที่มีการยืนยันสิทธิ์
  token_type: string;               // ชนิดของ Token เช่น "bearer"
  phone_number: string;             // หมายเลขโทรศัพท์ที่ผ่านการยืนยันแล้ว
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * sendOtp
 * ร้องขอให้ระบบส่งรหัส OTP ไปยังเบอร์โทรศัพท์ที่กำหนดผ่านระบบ SMS
 */
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  return apiFetch<SendOtpResponse>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone }),
  });
}

/**
 * verifyOtp
 * ตรวจสอบความถูกต้องของรหัส OTP ที่ผู้ใช้กรอก เข้ามา 
 * หากถูกต้องจะคืนค่า JWT Token กลับมาเพื่อบันทึกเซสชัน
 */
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResponse> {
  return apiFetch<VerifyOtpResponse>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone, code }),
  });
}

