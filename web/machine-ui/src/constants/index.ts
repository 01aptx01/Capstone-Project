import React from "react";
import type { TestCardBrand } from "../types";

// ==========================================
// Process Steps (ข้อความสเตปสถานะการอุ่นบนหน้าจอ UI)
// ==========================================
export const PROCESS_STEPS = [
  "กำลังนำเข้าเตาอุ่น",
  "กำลังอุ่น",
  "กำลังเสิร์ฟ",
  "พร้อมทาน",
];

// ==========================================
// Timing Constants (ค่าควบคุมหน่วงเวลา - วินาที)
// ==========================================
export const STEP1_DELAY = 2; // ระยะเวลาหน่วงตอนเริ่มแรกของระบบจ่ายความร้อน (วิ)
export const DISPENSE_WINDOW = 2; // ระยะเวลาในการเปิดประตูกลไกเสิร์ฟของแต่ละชิ้น (วิ)
export const STEP4_HOLD = 3; // เวลาที่หยุดค้างที่สเต็ป 3 (พร้อมเสิร์ฟตัวสุดท้าย) ก่อนสลับไปหน้าจอจบ (วิ)
export const FINAL_STEP_HOLD = 3; // เวลาหน่วงของหน้าจอแสดงความขอบคุณหรือสรุปคิวก่อนปิดหน้าจออุ่นกลับสู่หน้าหลัก (วิ)
export const SECONDS_PER_HEATING_TIME_TYPE = 3; // ตัวแปรคูณระยะเวลารวมในตะกร้า ต่อ 1 ชนิดสินค้าที่อุ่นร้อนเสร็จ (วิ)

// ==========================================
// Cart & Payment Limits (ขีดจำกัดต่างๆ ของโปรแกรมและระบบจ่ายเงิน)
// ==========================================
export const MAX_CART_ITEMS = 4; // จำนวนรวมชิ้นสูงสุดที่อนุญาตให้ใส่ตะกร้าต่อ 1 ออเดอร์
export const PAYMENT_COUNTDOWN_SECONDS = 180; // เวลานับถอยหลังในหน้าชำระเงิน (3 นาที)
export const POINTS_COUNTDOWN_SECONDS = 10; // เวลานับถอยหลังของหน้าสรุปผลสะสมแต้ม (วิ)
export const NUMPAD_COUNTDOWN_SECONDS = 60; // เวลานับถอยหลังของหน้าจอสัมผัสป้อนเบอร์โทรศัพท์ (1 นาที)
export const NFC_BLOCK_DURATION_MS = 5000; // เวลาห้ามแตะบัตรเครดิตซ้ำ (มิลลิวินาที) เพื่อกันความขัดข้องระบบ Omise API
export const PAYMENT_POLL_INTERVAL_MS = 1000; // รอบการยิง API ตรวจเช็คยอดชำระเงินสำเร็จ (1 วิ)
export const PAYMENT_POLL_MAX_ATTEMPTS = 120; // จำนวนรอบสูงสุดที่จะยิงเช็คสถานะยอดชำระ (120 รอบ = 2 นาที)
export const PAYMENT_TIMEOUT_MS = 60000; // ระยะเวลาเชื่อมต่อระบบธนาคารสูงสุดก่อนตัดการทำงาน (60 วิ)
export const HARDWARE_EVENT_WAIT_MS = 60000; // รอ event จาก Pi ก่อนเริ่ม poll สถานะ order
export const ORDER_STATUS_POLL_INTERVAL_MS = 2000; // ช่วง poll หลัง timeout (Pi อาจ offline ชั่วคราว)
export const ORDER_STATUS_POLL_MAX_ATTEMPTS = 60; // 60 × 2s ≈ 2 นาที
export const ACTIVE_ORDER_POLL_INTERVAL_MS = 10000; // เช็คออเดอร์ค้างบนตู้ (หลังรีเฟรช / ซื้อซ้ำ)

// ==========================================
// Machine Config (การกำหนดค่าระบุตัวตู้สินค้า)
// ==========================================
export const DEFAULT_MACHINE_CODE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MACHINE_CODE) || "MP1-001";

/** ใช้สินค้าจำลองใน useCart — ตั้ง NEXT_PUBLIC_USE_MOCK_PRODUCTS=true ใน .env.local */
export function useMockProducts(): boolean {
  const v =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_USE_MOCK_PRODUCTS : "";
  return v === "1" || v === "true" || v === "yes";
}

/** URL REST API ของ Flask (checkout, สินค้า, สมาชิก) */
export function getPublicApiUrl(): string {
  return (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";
}

/** URL Socket.IO — ถ้าไม่ตั้ง ใช้ค่าเดียวกับ API (กรณี server ตัวเดียว) */
export function getPublicSocketUrl(): string {
  const socket =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SERVER_SOCKET_URL?.trim() : "";
  return socket || getPublicApiUrl();
}

/** URL Pi agent สำหรับ poll NFC (รันบน localhost ของตู้) */
export function getPublicAgentBaseUrl(): string {
  const base =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_AGENT_BASE_URL?.trim() : "";
  return (base || "http://localhost:5000").replace(/\/$/, "");
}

/** รหัสลับจอตู้ — ต้องตรง KIOSK_SOCKET_SECRET บน server (ฝังตอน build) */
export function getKioskSocketSecret(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_KIOSK_SOCKET_SECRET?.trim()) || ""
  );
}

// ==========================================
// Test Cards (ข้อมูลบัตรเครดิตทดสอบสำหรับการจำลองแตะ NFC)
// ==========================================
export const TEST_CARDS: Record<TestCardBrand, { name: string; number: string }> = {
  visa: { name: "Test Visa Machine", number: "4242424242424242" },
  mastercard: { name: "Test Mastercard Machine", number: "5555555555554444" },
  unionpay: { name: "Test UnionPay Machine", number: "6250947000000006" },
};

// ==========================================
// Shared Styles อยุ่แค่ตอนจำลอง
// ==========================================
export const testBtnStyle: React.CSSProperties = {
  padding: "10px",
  background: "#22c55e",
  color: "white",
  borderRadius: "12px",
  width: "100%",
  fontWeight: "bold",
  fontSize: "18px",
  border: "none",
  cursor: "pointer",
};

