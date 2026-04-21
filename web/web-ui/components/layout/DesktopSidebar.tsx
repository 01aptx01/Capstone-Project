"use client";

import Link from "next/link"; // นำเข้า Link จาก Next.js
import { IconHome, IconRedeem, IconHistory, IconProfile, IconLogout } from "@/components/icons";
import { COLORS } from "@/lib/constants";

interface DesktopSidebarProps {
  active: string;
}

export function DesktopSidebar({ active }: DesktopSidebarProps) {
  // เพิ่ม href สำหรับกำหนด path ที่จะไปเมื่อกดเมนู
  const items = [
    { key: "home", href: "/home", label: "หน้าแรก", icon: <IconHome /> },
    { key: "redeem", href: "/redeem", label: "แลกรางวัล", icon: <IconRedeem /> },
    { key: "history", href: "/history", label: "ประวัติการสั่งซื้อ", icon: <IconHistory /> },
    { key: "profile", href: "/profile", label: "ข้อมูลโปรไฟล์", icon: <IconProfile /> },
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
            // เปลี่ยนจาก button เป็น Link และใส่ href
            <Link
              key={item.key}
              href={item.href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={
                isActive
                  ? { backgroundColor: COLORS.bg, color: COLORS.accent }
                  : { color: COLORS.grayDark }
              }
            >
              <span style={{ color: isActive ? COLORS.accent : COLORS.gray }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3">
        {/* ปุ่มออกจากระบบยังคงเป็น button เพราะมักจะใช้ผูกกับฟังก์ชัน onClick เพื่อลบ session */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors" style={{ color: "#FF5A5A" }}>
          <IconLogout />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}