// lib/constants.ts

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "all" | "pork" | "veggie";
  image: string; // placeholder color
}

export interface Category {
  key: "all" | "pork" | "veggie" | "sweet";
  label: string;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  primary: "#FF8235",     // Orange header
  accent: "#F97316",      // Orange accent
  bg: "#FFF3E8",          // Light orange bg
  gray: "rgba(71,71,71,0.62)",
  grayDark: "rgba(71,71,71,0.7)",
};

// ─── Menu Items ───────────────────────────────────────────────────────────────
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "เปามดแดง",
    description: "ไส้หมูแดงเข้มข้น หวานกำลังดี",
    price: 25,
    category: "pork",
    image: "#D4A574",
  },
  {
    id: 2,
    name: "เปาหมูสับ",
    description: "ไส้หมูสับนุ่มละมุน รสชาติกลมกล่อม",
    price: 25,
    category: "pork",
    image: "#C4956A",
  },
  {
    id: 3,
    name: "เปาบัวแดง",
    description: "ไส้บัวแดงหอมหวาน ทำจากถั่วแท้",
    price: 22,
    category: "veggie",
    image: "#E8C4A0",
  },
  {
    id: 4,
    name: "เปาเต้าหู้",
    description: "ไส้เต้าหู้ผัดซอส ทางเลือกเพื่อสุขภาพ",
    price: 22,
    category: "veggie",
    image: "#F0D9B5",
  },
  {
    id: 5,
    name: "เปาไก่เห็ด",
    description: "ไส้ไก่ผัดเห็ดหอม กลมกล่อมอร่อย",
    price: 25,
    category: "pork",
    image: "#BFA080",
  },
  {
    id: 6,
    name: "เปามันแกว",
    description: "ไส้มันแกวกรุบกรอบ สดชื่น",
    price: 20,
    category: "veggie",
    image: "#E5D4C0",
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pork", label: "หมูสับ/หมูแดง" },
  { key: "veggie", label: "มังสวิรัติ" },
  { key: "sweet", label: "ไส้หวาน" },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────
// 🚨 ใช้ interface แบบสมบูรณ์ที่มีครบทุก properties 
export interface Coupon {
  id: number;
  title: string;
  description: string;
  points: number;
  colorBg: string; // คลาสสีของ Tailwind
  discountValue: number; // มูลค่าส่วนลด (เพื่อให้ตะกร้ารู้ว่าลดกี่บาท)
  expiry: string; // วันหมดอายุ
}

export const COUPONS: Coupon[] = [
  {
    id: 1,
    title: "ส่วนลด 5 บาท",
    description: "คูปองส่วนลด 5 บาท สำหรับการสั่งซื้อซาลาเปา",
    points: 100,
    colorBg: "bg-[#F5B041]", // สีเหลืองส้ม
    discountValue: 5,
    expiry: "หมดอายุ 4 พ.ค. 2026",
  },
  {
    id: 2,
    title: "ส่วนลด 10 บาท",
    description: "คูปองส่วนลด 10 บาท สำหรับการสั่งซื้อซาลาเปา",
    points: 180,
    colorBg: "bg-[#FF8A33]", // สีส้ม
    discountValue: 10,
    expiry: "หมดอายุ 4 พ.ค. 2026",
  },
];

// ─── Order History ────────────────────────────────────────────────────────────
export interface OrderHistory {
  id: string;
  orderNumber: string;
  datetime: string;
  items: string;
  total: number;
  status: "pending" | "completed" | "cancelled";
}

export const ORDER_HISTORY: OrderHistory[] = [
  {
    id: "1",
    orderNumber: "1112", // 🚨 รายการรอล่าสุด
    datetime: "2026-05-01 20:00", // อัปเดตเวลาให้ใกล้เคียงปัจจุบัน
    items: "เปามันแกว x1, เปาหมูสับ x1",
    total: 45,
    status: "pending",
  },
  {
    id: "2",
    orderNumber: "1111",
    datetime: "2026-04-15 14:30",
    items: "เปามดแดง x2",
    total: 50,
    status: "completed",
  },
  {
    id: "3",
    orderNumber: "1110",
    datetime: "2026-04-14 12:15",
    items: "เปาไก่เห็ด x1",
    total: 25,
    status: "cancelled",
  },
];