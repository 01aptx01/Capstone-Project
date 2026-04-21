"use client";

import { IconHome, IconRedeem, IconHistory, IconProfile, IconLogout } from "@/components/icons";
import { COLORS } from "@/lib/constants";

interface DesktopSidebarProps {
  active: string;
}

export function DesktopSidebar({ active }: DesktopSidebarProps) {
  const items = [
    { key: "home", label: "หน้าหลัก / สั่งซื้อ", icon: <IconHome /> },
    { key: "redeem", label: "แลกรางวัล", icon: <IconRedeem /> },
    { key: "history", label: "ประวัติการสั่งซื้อ", icon: <IconHistory /> },
    { key: "profile", label: "ข้อมูลโปรไฟล์", icon: <IconProfile /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen pt-6 pb-10 sticky top-0">
      <div className="px-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: COLORS.gray }}>
          เมนูหลัก
        </p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={
                isActive
                  ? { backgroundColor: COLORS.bg, color: COLORS.accent }
                  : { color: COLORS.grayDark }
              }
            >
              <span style={{ color: isActive ? COLORS.accent : COLORS.gray }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-3">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: COLORS.accent }}>
          <IconLogout />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}