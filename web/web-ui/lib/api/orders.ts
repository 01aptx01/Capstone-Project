// lib/api/orders.ts
// ─── ORDERS & COUPONS API WRAPPER ────────────────────────────────────────────
// จัดการดึงประวัติการซื้อ (Orders) และคูปองที่ผู้ใช้เป็นเจ้าของ (User Coupons) จาก Flask Backend

import { apiFetch } from "./client";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// รายการประวัติการสั่งซื้อของสมาชิก
export interface MemberOrder {
  id: string;                       // ไอดีอ้างอิงของออเดอร์
  machine_code: string;             // รหัสตู้น้ำอัจฉริยะที่ทำรายการ
  orderNumber: string;              // หมายเลขออเดอร์สำหรับแสดงผล
  charge_id: string;                // รหัสอ้างอิงการชำระเงิน Omise
  datetime: string;                 // วันที่สั่งซื้อ
  items: string;                    // รายชื่อสินค้าทั้งหมดแบบสรุปย่อ
  total: number;                    // ยอดเงินรวมสุทธิ
  status: string;                   // สถานะรายการสั่งซื้อ (e.g. ready_to_scan, completed)
}

// ข้อมูลคูปองสะสมคะแนนที่สมาชิกกดแลกมาแล้ว
export interface UserCoupon {
  id: string;                       // รหัสจำเพาะคูปองของผู้ใช้คนนี้
  promotion_id: number;             // รหัสโปรโมชันดั้งเดิม
  code: string;                     // รหัสลับคูปองสำหรับนำไปกรอกหรือสแกนที่ตู้
  title: string;                    // ชื่อคูปองส่วนลด
  description: string;              // คำอธิบายเงื่อนไขส่วนลด
  discount_amount: number;          // มูลค่าของส่วนลด (บาท)
  type: string;                     // ประเภทส่วนลด (เช่น discount)
  status: "active" | "used" | "expired"; // สถานะการใช้งาน (ใช้ได้, ใช้แล้ว, หมดอายุ)
  expiry: string | null;            // วันหมดอายุของคูปอง (ถ้ามี)
  redeemed_at: string;              // วันเวลาที่แลกรับคูปองนี้มา
  quantity?: number;                // จำนวนที่มี (เผื่อใช้งานในภายหลัง)
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * fetchMemberOrders
 * ดึงรายการประวัติการสั่งซื้อสินค้าทั้งหมดจากเบอร์โทรศัพท์ของสมาชิก
 */
export async function fetchMemberOrders(
  phone: string,
): Promise<MemberOrder[]> {
  const data = await apiFetch<{ orders: MemberOrder[] }>(
    `/api/members/${encodeURIComponent(phone)}/orders`,
  );
  return data.orders ?? [];
}

/**
 * fetchMemberCoupons
 * ดึงรายการคูปองส่วนลดทั้งหมดที่สมาชิกครอบครองอยู่ (รวมคูปองที่ใช้แล้วและหมดอายุ)
 */
export async function fetchMemberCoupons(
  phone: string,
): Promise<UserCoupon[]> {
  const data = await apiFetch<{ coupons: UserCoupon[] }>(
    `/api/members/${encodeURIComponent(phone)}/coupons`,
  );
  return data.coupons ?? [];
}

