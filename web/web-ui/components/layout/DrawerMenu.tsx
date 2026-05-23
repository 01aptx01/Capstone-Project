// components/layout/DrawerMenu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconHome, IconRedeem, IconHistory, IconProfile, IconLogout } from "@/components/icons";

interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
}

export function DrawerMenu({ open, onClose }: DrawerMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isActive = (path: string) => pathname === path;

  // 🚨 ฟังก์ชันออกจากระบบ (ปิดเมนู แล้วเปลี่ยนหน้า)
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    onClose(); 
    router.push("/login"); 
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 top-[64px] bg-black/40 z-[60] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* แผงเมนู */}
      <div className={`fixed top-[64px] left-0 right-0 w-full bg-white z-[70] shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="p-4 bg-gray-50/50">
          <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-5 bg-red-50/30 border-t border-gray-50 hover:bg-red-50 transition-colors"
            >
              <IconLogout />
              ออกจากระบบ
            </button>
          </nav>

          <div className="mt-4 px-4 flex justify-between items-center text-sm">
             <span className="text-gray-500">แต้มสะสมปัจจุบัน</span>
             <span className="font-bold text-[#FF8A33]">150 Points</span>
          </div>
        </div>
      </div>
    </>
  );
}

// MenuLink component
function MenuLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex justify-between items-center px-6 py-5 transition-all border-b border-gray-50 last:border-0 ${
        active 
          ? "bg-orange-50 text-[#FF8A33]" 
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-[#FF8A33]" : "text-gray-400"}>
          {icon}
        </span>
        <span className={`font-bold ${active ? "text-[#FF8A33]" : "text-gray-800"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}