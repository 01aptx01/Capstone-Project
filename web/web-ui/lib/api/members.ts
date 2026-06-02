// lib/api/members.ts
// ─── MEMBERS API WRAPPER ─────────────────────────────────────────────────────
// คอลเลกชันฟังก์ชันเรียกใช้งาน API สำหรับระบบสมาชิก
// เช่น การดึงโปรไฟล์, การลงทะเบียน, การแก้ไขโปรไฟล์, การสะสมคะแนน และการแลกคูปองส่วนลด

import { apiFetch, ApiError } from "./client";

// ─── Interfaces (โครงสร้างประเภทข้อมูลสมาชิก) ──────────────────────────────────

// โปรไฟล์ของสมาชิกในระบบ
export interface MemberProfile {
  found: boolean;                   // บ่งบอกว่าพบประวัติสมาชิกในฐานข้อมูลหรือไม่
  user_id?: number;                 // ไอดีสมาชิก
  phone_number?: string;            // เบอร์โทรศัพท์
  display_name?: string | null;     // ชื่อที่ใช้แสดงผล
  points?: number;                  // คะแนนสะสมคงเหลือ
  registered_at?: string;           // วันเวลาที่ลงทะเบียน
  last_use?: string | null;         // วันเวลาที่ทำรายการล่าสุด
  message?: string;                 // ข้อความส่งกลับจากเซิร์ฟเวอร์
}

// ผลลัพธ์จากการสะสมแต้ม
export interface EarnPointsResponse {
  status: string;
  is_new_member?: boolean;
  phone_number?: string;
  points_earned?: number;           // แต้มที่ได้รับเพิ่มจากการสั่งซื้อครั้งนี้
  total_points?: number;            // แต้มสะสมสุทธิหลังบวกแต้มใหม่
  message?: string;
}

// ผลลัพธ์จากการกดแลกคูปองด้วยแต้มสะสม
export interface RedeemResponse {
  status: string;
  message: string;
  code?: string;                    // รหัสคูปองส่วนลดที่ได้
  points_remaining?: number;        // แต้มสะสมคงเหลือหลังหักแต้มออกแล้ว
}

// ─── API Functions (ฟังก์ชันเชื่อมต่อ API) ────────────────────────────────────

/**
 * getMember
 * ดึงข้อมูลโปรไฟล์สมาชิกล่าสุดตามเบอร์โทรศัพท์
 * รองรับการจัดการข้อผิดพลาด 404 (ไม่พบข้อมูลสมาชิก) เพื่อส่งต่อการทำงานไปหน้าสมัครสมาชิกใหม่
 */
export async function getMember(phone: string): Promise<MemberProfile> {
  try {
    return await apiFetch<MemberProfile>(
      `/api/members/${encodeURIComponent(phone)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return { found: false, message: "ไม่พบสมาชิก" };
    }
    throw e;
  }
}

/**
 * registerMember
 * ลงทะเบียนสมัครสมาชิกใหม่ด้วยชื่อแสดงผล
 */
export async function registerMember(displayName: string, token?: string): Promise<MemberProfile> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return apiFetch("/api/members/register", {
    method: "POST",
    headers,
    body: JSON.stringify({ display_name: displayName }),
  });
}

/**
 * updateMemberProfile
 * ปรับปรุง/แก้ไขโปรไฟล์สมาชิก (เช่น เปลี่ยนชื่อแสดงผล)
 */
export async function updateMemberProfile(
  phone: string,
  displayName: string,
): Promise<void> {
  await apiFetch(`/api/members/${encodeURIComponent(phone)}`, {
    method: "PATCH",
    body: JSON.stringify({ display_name: displayName }),
  });
}

/**
 * earnPoints
 * ฟังก์ชันส่งคำขอสะสมคะแนนจากการสั่งซื้อสินค้าผ่านยอดรวมและ Charge ID ของ Omise
 */
export async function earnPoints(payload: {
  phone_number: string;
  total_price: number;
  charge_id?: string;
}): Promise<EarnPointsResponse> {
  return apiFetch("/api/members/earn", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * redeemCoupon
 * ใช้คะแนนสะสมที่ระบุเพื่อแลกรับรหัสคูปองส่วนลดจากโปรโมชัน
 */
export async function redeemCoupon(
  phone: string,
  promotionId: number,
): Promise<RedeemResponse> {
  return apiFetch(`/api/members/${encodeURIComponent(phone)}/redeem`, {
    method: "POST",
    body: JSON.stringify({ promotion_id: promotionId }),
  });
}

