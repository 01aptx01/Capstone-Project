// components/layout/DesktopHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext"; // ดึงข้อมูลตะกร้า

export function DesktopHeader() {
  const { cartCount } = useCart(); // เรียกใช้จำนวนตะกร้า

  return (
    <header className="hidden md:flex sticky top-0 z-50 bg-[#FF8A33] px-8 lg:px-12 py-3 justify-between items-center shadow-sm h-[72px]">
      
      {/* ฝั่งซ้าย: โลโก้ และ ช่องค้นหา */}
      <div className="flex items-center gap-8 w-full max-w-2xl">
        <Link href="/home" className="flex items-center gap-3 shrink-0">
          <div className="bg-white text-[#FF8A33] rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-inner">
            🥟
          </div>
          <span className="text-2xl font-extrabold text-white uppercase tracking-widest">MOD PAO</span>
        </Link>
        
        {/* ช่องค้นหา */}
        <div className="relative w-full max-w-md hidden lg:block">
          <input 
            type="text" 
            placeholder="ค้นหาไส้ซาลาเปา..." 
            className="w-full py-2.5 pl-12 pr-4 rounded-full text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner" 
          />
          <svg className="absolute left-4 top-2.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>
      
      {/* ฝั่งขวา: โปรไฟล์ และ ตะกร้า (ลบกระดิ่งแจ้งเตือนออกแล้ว) */}
      <div className="flex items-center gap-6 shrink-0">
        
        {/* ปุ่มตะกร้า */}
        <Link 
          href="/checkout" 
          className="relative p-2.5 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {/* แสดงตัวเลขตะกร้า */}
          {cartCount > 0 && (
            <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-[#FF8A33] flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>

        {/* ข้อมูลโปรไฟล์ */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/30">
          <div className="text-right hidden xl:block">
            <div className="text-white font-bold text-sm">คุณสมาชิก</div>
            <div className="text-orange-100 text-xs font-bold mt-0.5">150 POINT</div>
          </div>
          <Link href="/profile" className="w-11 h-11 bg-[#FFD1A6] rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-2xl">
            🧑
          </Link>
        </div>

      </div>
    </header>
  );
}