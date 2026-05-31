// lib/constants.ts
// ─── SHARED TYPES & CONSTANTS ────────────────────────────────────────────────
// กำหนดโครงสร้างข้อมูล (Interfaces) และค่าคงที่ระบบ (Constants)
// สำหรับเมนูสินค้า, คูปองส่วนลด, และประวัติการสั่งซื้อที่ใช้ร่วมกันในระบบ UI

// ─── Types (โครงสร้างข้อมูลของระบบ) ───────────────────────────────────────────

// รายการเมนูสินค้าตู้น้ำ/ซาลาเปา
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "all" | "pork" | "veggie" | "sweet"; // ประเภทของสินค้า
  image: string; // URL หรือสี Placeholder ของภาพสินค้า
}

// โครงสร้างประเภทสินค้าสำหรับกรอง (Filter Categories)
export interface Category {
  key: "all" | "pork" | "veggie" | "sweet";
  label: string;
}

// ─── Categories (หมวดหมู่สินค้าสำหรับการกรองข้อมูลในหน้ารายการสินค้า) ───────────
export const CATEGORIES: Category[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pork", label: "หมูสับ/หมูแดง" },
  { key: "veggie", label: "มังสวิรัติ" },
  { key: "sweet", label: "ไส้หวาน" },
];

// ─── Coupon (โครงสร้างข้อมูลคูปองส่วนลด) ──────────────────────────────────────────
export interface Coupon {
  id: number;
  title: string;
  description: string;
  points: number;       // จำนวนคะแนนที่ใช้ในการแลก
  colorBg: string;      // สีของธีมการ์ดคูปอง
  discountValue: number;// มูลค่าส่วนลด (บาท)
  expiry: string;       // วันหมดอายุของคูปอง
}

// ─── Order History (โครงสร้างข้อมูลประวัติการสั่งซื้อสินค้า) ──────────────────────────
export interface OrderHistory {
  id: string;
  orderNumber: string;  // รหัสอ้างอิงออเดอร์
  datetime: string;     // วันและเวลาที่สั่งซื้อ
  items: string;        // สรุปรายการสินค้าที่ซื้อ (เช่น "หมูสับ x 1, ครีม x 2")
  total: number;        // ราคารวมสุทธิ
  status: "ready_to_scan" | "completed"; // สถานะการรับสินค้า
}