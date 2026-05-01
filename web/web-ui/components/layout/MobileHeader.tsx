// components/layout/MobileHeader.tsx
import React from "react";
import Link from "next/link";
import { IconMenu, CloseIcon } from "@/components/icons";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuOpen, isOpen }: MobileHeaderProps) {

  return (
    <header className="md:hidden sticky top-0 z-[80] bg-[#FF8A33] px-5 py-4 flex justify-between items-center shadow-sm">
      <Link href="/home" className="flex items-center gap-2">
        <div className="bg-white text-[#FF8A33] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-inner">
          🥟
        </div>
        <span className="text-xl font-bold text-white uppercase tracking-wider">MOD PAO</span>
      </Link>
      
      <div className="flex items-center gap-3">

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