// lib/navigation.ts
// ─── NAVIGATION CONFIGURATION ────────────────────────────────────────────────
// กำหนดโครงสร้างเมนูนำทาง (Navigation Menus) และฟังก์ชันคำนวณชื่อหัวข้อหน้าเพจ
// โดยดึงเอาไอคอน SVG มาผูกเข้ากับเส้นทาง (Routes) เพื่อใช้สร้าง Sidebar และ Bottom Navigation

import type { ComponentType } from "react";
import {
  IconHome,
  IconRedeem,
  IconHistory,
  IconProfile,
  IconCoupons,
  IconHelp,
} from "@/components/icons";

// กำหนดประเภทของคีย์เมนูนำทางในแอป
export type NavKey =
  | "home"
  | "redeem"
  | "history"
  | "profile"
  | "coupons"
  | "help";

// โครงสร้างค่าคอนฟิกเมนู (Interface for Nav Item)
export interface NavItemConfig {
  key: NavKey;
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

// รายการเมนูหลัก (ปรากฏบน Bottom Navigation หรือแถบหลักของเดสก์ท็อป)
export const PRIMARY_NAV: NavItemConfig[] = [
  { key: "home", href: "/home", label: "หน้าแรก", icon: IconHome },
  { key: "redeem", href: "/redeem", label: "แลกคูปอง", icon: IconRedeem },
  { key: "history", href: "/history", label: "ประวัติการสั่ง", icon: IconHistory },
  { key: "profile", href: "/profile", label: "โปรไฟล์", icon: IconProfile },
];

// รายการเมนูรอง (ปรากฏใน Drawer เพิ่มเติมหรือแถบข้าง)
export const SECONDARY_NAV: NavItemConfig[] = [
  { key: "coupons", href: "/coupons", label: "คูปองของฉัน", icon: IconCoupons },
  { key: "help", href: "/help", label: "ศูนย์ช่วยเหลือ", icon: IconHelp },
];

// รายการแมปที่อยู่ URL ไปเป็นชื่อหัวข้อภาษาไทยเพื่อแสดงบน Header
const PAGE_TITLES: Record<string, string> = {
  "/home": "หน้าแรก",
  "/redeem": "แลกคูปอง",
  "/history": "ประวัติการสั่ง",
  "/profile": "โปรไฟล์",
  "/coupons": "คูปองของฉัน",
  "/help": "ศูนย์ช่วยเหลือ",
};

// ฟังก์ชันสำหรับหา NavKey จากที่อยู่ URL ปัจจุบัน เพื่อใช้เช็กว่าเมนูใดกำลังเปิดอยู่ (Active State)
export function matchNavKey(pathname: string): NavKey {
  if (pathname.includes("/coupons")) return "coupons";
  if (pathname.includes("/help")) return "help";
  if (pathname.includes("/redeem")) return "redeem";
  if (pathname.includes("/history")) return "history";
  if (pathname.includes("/profile")) return "profile";
  return "home";
}

// ฟังก์ชันตรวจสอบว่า URL ปัจจุบันตรงกับเมนูใดเมนูหนึ่งหรือไม่ (รวมถึงหน้าลูกย่อย)
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ฟังก์ชันดึงชื่อหัวข้อหน้าเว็บจากที่อยู่ URL ปัจจุบัน เพื่อแสดงในแถบเมนูด้านบนสุด (Header Title)
export function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return title;
    }
  }
  return "MOD PAO";
}

