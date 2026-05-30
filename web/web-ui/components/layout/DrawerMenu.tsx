"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome,
  IconRedeem,
  IconHistory,
  IconProfile,
  IconLogout,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { clearSession } from "@/lib/auth/session";

interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
}

export function DrawerMenu({ open, onClose }: DrawerMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useUser();

  const isActive = (path: string) => pathname === path;
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
      >
        <div className="p-4 bg-background">
          <nav className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
            <MenuLink
              href="/home"
              icon={<IconHome size={20} />}
              label="หน้าแรก"
              active={isActive("/home")}
              onClick={onClose}
            />
            <MenuLink
              href="/redeem"
              icon={<IconRedeem size={20} />}
              label="แลกคูปอง"
              active={isActive("/redeem")}
              onClick={onClose}
            />
            <MenuLink
              href="/history"
              icon={<IconHistory size={20} />}
              label="ประวัติการสั่งซื้อ"
              active={isActive("/history")}
              onClick={onClose}
            />
            <MenuLink
              href="/profile"
              icon={<IconProfile size={20} />}
              label="โปรไฟล์"
              active={isActive("/profile")}
              onClick={onClose}
            />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-destructive font-bold py-5 bg-red-50/50 border-t border-border hover:bg-red-50 transition-colors touch-target"
            >
              <IconLogout />
              ออกจากระบบ
            </button>
          </nav>

          <div className="mt-4 px-4 flex justify-between items-center text-sm">
            <span className="text-muted">แต้มสะสมปัจจุบัน</span>
            <span className="font-bold text-brand">{points} Points</span>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex justify-between items-center px-6 py-5 transition-all border-b border-border last:border-0 touch-target",
        active
          ? "bg-brand-muted text-brand"
          : "text-foreground hover:bg-background",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-brand" : "text-muted"}>{icon}</span>
        <span className={cn("font-bold", active ? "text-brand" : "text-foreground")}>
          {label}
        </span>
      </div>
    </Link>
  );
}
