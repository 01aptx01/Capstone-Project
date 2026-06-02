// lib/api/promotions.ts
// ─── PROMOTIONS API WRAPPER ──────────────────────────────────────────────────
// จัดการดึงข้อมูลส่วนลดโปรโมชันที่สามารถแลกรับได้ด้วยแต้มสะสม (Redeemable Coupons)

import { apiFetch } from "./client";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// โครงสร้างคูปองส่วนลดที่สามารถกดแลกรับได้
export interface RedeemableCoupon {
  promotion_id: number;             // รหัสโปรโมชัน
  code: string;                     // รหัสอ้างอิงโปรโมชัน
  title: string;                    // หัวข้อ/ชื่อโปรโมชัน เช่น "ส่วนลด 20 บาทสำหรับเมนูมังสวิรัติ"
  description: string;              // รายละเอียดและเงื่อนไขเพิ่มเติม
  points_cost: number;              // แต้มคะแนนสะสมที่จำเป็นต้องใช้แลก
  discount_amount: number;          // มูลค่าของส่วนลดจริง (บาท)
  type: string;                     // ประเภทส่วนลด (เช่น discount)
  expiry: string | null;            // วันหมดอายุของโปรโมชันนี้ (ถ้ามี)
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * fetchRedeemableCoupons
 * ดึงรายการโปรโมชัน/คูปองส่วนลดทั้งหมดที่ระบบเปิดให้สมาชิกนำแต้มสะสมมากดแลกได้ในปัจจุบัน
 */
export async function fetchRedeemableCoupons(): Promise<RedeemableCoupon[]> {
  const data = await apiFetch<{ coupons: RedeemableCoupon[] }>(
    "/api/promotions/redeemable",
  );
  return data.coupons ?? [];
}

