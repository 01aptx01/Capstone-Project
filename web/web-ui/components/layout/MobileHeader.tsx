import React from "react";
import Link from "next/link";
import { IconMenu, CloseIcon } from "@/components/icons";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuOpen, isOpen }: MobileHeaderProps) {
  return (
    <header
      className="md:hidden sticky top-0 z-[var(--z-header)] bg-brand-light px-5 flex justify-between items-center shadow-sm"
      style={{
        height: "var(--header-height)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <Link href="/home" className="flex items-center gap-2 min-w-0">
        <img
          src="/logo.svg"
          alt="MOD PAO"
          className="h-8 w-auto max-w-[9rem] object-contain"
        />
      </Link>

      <button
        type="button"
        onClick={onMenuOpen}
        aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
        aria-expanded={isOpen}
        className="touch-target p-2 hover:bg-white/20 rounded-full transition-colors text-white shrink-0"
      >
        {isOpen ? <CloseIcon /> : <IconMenu />}
      </button>
    </header>
  );
}
