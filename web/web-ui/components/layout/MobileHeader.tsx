"use client";

import Link from "next/link";
import { IconMenu, CloseIcon } from "@/components/icons";
import { UserPointsBadge } from "@/components/layout/UserPointsBadge";
import { useUser } from "@/context/UserContext";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuOpen, isOpen }: MobileHeaderProps) {
  const { profile } = useUser();
  const points = profile?.points ?? 0;

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

      <div className="flex items-center gap-2 shrink-0">
        <UserPointsBadge points={points} compact variant="inverse" />

        <button
          type="button"
          onClick={onMenuOpen}
          aria-label={isOpen ? "ปิดเมนูเพิ่มเติม" : "เมนูเพิ่มเติม"}
          aria-expanded={isOpen}
          className="touch-target p-2 hover:bg-white/20 rounded-full transition-colors text-white shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {isOpen ? <CloseIcon /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
}
