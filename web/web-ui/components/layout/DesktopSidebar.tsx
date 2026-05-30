"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconRedeem,
  IconHistory,
  IconProfile,
  IconLogout,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { clearSession } from "@/lib/auth/session";
import { useUser } from "@/context/UserContext";

interface DesktopSidebarProps {
  active: string;
}

export function DesktopSidebar({ active }: DesktopSidebarProps) {
  const router = useRouter();
  const { logout } = useUser();

  const items = [
    { key: "home", href: "/home", label: "หน้าแรก", icon: <IconHome /> },
    { key: "redeem", href: "/redeem", label: "แลกรางวัล", icon: <IconRedeem /> },
    { key: "history", href: "/history", label: "ประวัติการสั่งซื้อ", icon: <IconHistory /> },
    { key: "profile", href: "/profile", label: "ข้อมูลโปรไฟล์", icon: <IconProfile /> },
  ];

  const handleLogout = () => {
    clearSession();
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-border min-h-screen pt-6 pb-10 sticky top-0">
      <div className="px-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          เมนูหลัก
        </p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-muted text-brand"
                  : "text-muted hover:bg-background",
              )}
            >
              <span className={isActive ? "text-brand" : "text-muted"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-colors touch-target"
        >
          <IconLogout />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
