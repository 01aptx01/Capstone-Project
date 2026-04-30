// components/layout/MobileHeader.tsx
import React from "react";
import Link from "next/link";
import { IconMenu, CloseIcon } from "@/components/icons";
import { useCart } from "@/context/CartContext"; // ดึงข้อมูลตะกร้า

interface MobileHeaderProps {
  onMenuOpen: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuOpen, isOpen }: MobileHeaderProps) {
  const { cartCount } = useCart(); // เรียกใช้จำนวนตะกร้า

  return (
    <header className="md:hidden sticky top-0 z-[80] bg-[#FF8A33] px-5 py-4 flex justify-between items-center shadow-sm">
      <Link href="/home" className="flex items-center gap-2">
        <div className="bg-white text-[#FF8A33] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-inner">
          🥟
        </div>
        <span className="text-xl font-bold text-white uppercase tracking-wider">MOD PAO</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <Link 
          href="/checkout" 
          className="relative p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {/* แสดงตัวเลขเมื่อมีของในตะกร้า */}
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#FF8A33] flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <button 
          onClick={onMenuOpen}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          {isOpen ? <CloseIcon /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
}