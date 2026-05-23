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
        <img src="/logo.svg" alt="Logo" className="w-40" />
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