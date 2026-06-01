"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, isNavActive } from "@/lib/navigation";

export function MobileBottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-header)] bg-surface border-t border-border shadow-[0_-4px_20px_rgba(28,25,23,0.06)]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="เมนูหลัก"
    >
      <ul className="flex items-stretch justify-around h-[var(--bottom-nav-height)] max-w-lg mx-auto">
        {PRIMARY_NAV.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-semibold transition-colors touch-target",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-colors",
                  active && "bg-brand-muted",
                )}>
                  <Icon size={22} />
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
