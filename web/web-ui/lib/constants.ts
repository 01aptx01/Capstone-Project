// lib/constants.ts

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "all" | "pork" | "veggie" | "sweet";
  image: string; // placeholder color or image_url
}

export interface Category {
  key: "all" | "pork" | "veggie" | "sweet";
  label: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pork", label: "หมูสับ/หมูแดง" },
  { key: "veggie", label: "มังสวิรัติ" },
  { key: "sweet", label: "ไส้หวาน" },
];

// ─── Coupon type (used by CouponCard component) ───────────────────────────────
export interface Coupon {
  id: number;
  title: string;
  description: string;
  points: number;
  colorBg: string;
  discountValue: number;
  expiry: string;
}

// ─── Order History type ───────────────────────────────────────────────────────
export interface OrderHistory {
  id: string;
  orderNumber: string;
  datetime: string;
  items: string;
  total: number;
  status: "ready_to_scan" | "completed";
}