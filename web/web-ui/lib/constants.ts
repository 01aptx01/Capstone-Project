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