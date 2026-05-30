"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconRedeem,
  IconHistory,
  IconProfile,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "home", href: "/home", label: "หน้าแรก", icon: IconHome },
  { key: "redeem", href: "/redeem", label: "แลกคูปอง", icon: IconRedeem },
  { key: "history", href: "/history", label: "ประวัติ", icon: IconHistory },
  { key: "profile", href: "/profile", label: "โปรไฟล์", icon: IconProfile },
] as const;

function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const HIDE_NAV_PATHS = ["/checkout", "/payment"];

export function MobileBottomNav() {
  const pathname = usePathname() || "";

  if (HIDE_NAV_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-header)] bg-surface border-t border-border shadow-[0_-4px_20px_rgba(28,25,23,0.06)]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="เมนูหลัก"
    >
      <ul className="flex items-stretch justify-around h-[var(--bottom-nav-height)] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-semibold transition-colors touch-target",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <Icon size={22} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
