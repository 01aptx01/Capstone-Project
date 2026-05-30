import type { ComponentType } from "react";
import {
  IconHome,
  IconRedeem,
  IconHistory,
  IconProfile,
  IconCoupons,
  IconHelp,
} from "@/components/icons";

export type NavKey =
  | "home"
  | "redeem"
  | "history"
  | "profile"
  | "coupons"
  | "help";

export interface NavItemConfig {
  key: NavKey;
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

export const PRIMARY_NAV: NavItemConfig[] = [
  { key: "home", href: "/home", label: "หน้าแรก", icon: IconHome },
  { key: "redeem", href: "/redeem", label: "แลกคูปอง", icon: IconRedeem },
  { key: "history", href: "/history", label: "ประวัติการสั่ง", icon: IconHistory },
  { key: "profile", href: "/profile", label: "โปรไฟล์", icon: IconProfile },
];

export const SECONDARY_NAV: NavItemConfig[] = [
  { key: "coupons", href: "/coupons", label: "คูปองของฉัน", icon: IconCoupons },
  { key: "help", href: "/help", label: "ศูนย์ช่วยเหลือ", icon: IconHelp },
];

const PAGE_TITLES: Record<string, string> = {
  "/home": "หน้าแรก",
  "/redeem": "แลกคูปอง",
  "/history": "ประวัติการสั่ง",
  "/profile": "โปรไฟล์",
  "/coupons": "คูปองของฉัน",
  "/help": "ศูนย์ช่วยเหลือ",
  "/checkout": "ชำระเงิน",
  "/payment": "ชำระเงิน",
};

export function matchNavKey(pathname: string): NavKey {
  if (pathname.includes("/coupons")) return "coupons";
  if (pathname.includes("/help")) return "help";
  if (pathname.includes("/redeem")) return "redeem";
  if (pathname.includes("/history")) return "history";
  if (pathname.includes("/profile")) return "profile";
  return "home";
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return title;
    }
  }
  return "MOD PAO";
}
