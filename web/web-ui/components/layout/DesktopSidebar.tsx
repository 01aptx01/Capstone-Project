"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconLogout } from "@/components/icons";
import { NavItem } from "@/components/layout/NavItem";
import { UserPointsBadge } from "@/components/layout/UserPointsBadge";
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  isNavActive,
  type NavKey,
} from "@/lib/navigation";
import { clearSession } from "@/lib/auth/session";
import { useUser } from "@/context/UserContext";

interface DesktopSidebarProps {
  active: NavKey;
}

export function DesktopSidebar({ active }: DesktopSidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { profile, displayName, logout } = useUser();
  const points = profile?.points ?? 0;

  const handleLogout = () => {
    clearSession();
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] bg-surface border-r border-border sticky top-0 h-screen shrink-0">
      <div className="px-5 pt-6 pb-4">
        <Link
          href="/home"
          className="flex items-center gap-2.5 min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <img
            src="/MODPAO.svg"
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-contain"
            aria-hidden
          />
          <span className="font-display text-lg font-bold text-foreground uppercase tracking-wide leading-none">
            MOD PAO
          </span>
        </Link>
      </div>

      <Link
        href="/profile"
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-brand-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-brand-muted text-xl">
          🧑
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">
            {displayName || "สมาชิก"}
          </p>
          <UserPointsBadge points={points} compact className="mt-1" />
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="เมนูหลัก">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.key}
              href={item.href}
              label={item.label}
              icon={<Icon size={20} />}
              active={item.key === active || isNavActive(pathname, item.href)}
            />
          );
        })}

        <div className="pt-4 pb-1">
          <p className="px-4 text-xs font-semibold uppercase tracking-widest text-muted">
            อื่นๆ
          </p>
        </div>

        {SECONDARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.key}
              href={item.href}
              label={item.label}
              icon={<Icon size={20} />}
              active={item.key === active || isNavActive(pathname, item.href)}
            />
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-red-50 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
        >
          <IconLogout />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
