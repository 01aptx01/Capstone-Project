"use client";

import { usePathname, useRouter } from "next/navigation";
import { IconLogout } from "@/components/icons";
import { NavItem } from "@/components/layout/NavItem";
import { UserPointsBadge } from "@/components/layout/UserPointsBadge";
import { SECONDARY_NAV, isNavActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { clearSession } from "@/lib/auth/session";

interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
}

export function DrawerMenu({ open, onClose }: DrawerMenuProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { profile, displayName, logout } = useUser();
  const points = profile?.points ?? 0;

  const handleLogout = () => {
    clearSession();
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-[calc(var(--z-drawer)-1)] transition-opacity duration-300 md:hidden",
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none",
        )}
        style={{ top: "var(--header-height)" }}
        onClick={onClose}
        aria-hidden={!open}
      />

      <div
        className={cn(
          "fixed left-0 right-0 w-full bg-surface z-[var(--z-drawer)] shadow-lg transform transition-transform duration-300 ease-in-out md:hidden border-b border-border",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none",
        )}
        style={{ top: "var(--header-height)" }}
        role="dialog"
        aria-label="เมนูเพิ่มเติม"
      >
        <div className="p-4 bg-background">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">
                {displayName || "สมาชิก"}
              </p>
              <p className="mt-0.5 text-xs text-muted">บัญชีของคุณ</p>
            </div>
            <UserPointsBadge points={points} />
          </div>

          <nav
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            aria-label="เมนูเพิ่มเติม"
          >
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavItem
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  icon={<Icon size={20} />}
                  active={isNavActive(pathname, item.href)}
                  onClick={onClose}
                />
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border-t border-border bg-red-50/50 py-5 font-bold text-destructive transition-colors hover:bg-red-50 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
            >
              <IconLogout />
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
