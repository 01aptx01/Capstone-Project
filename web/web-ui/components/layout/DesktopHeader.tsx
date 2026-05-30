"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

export function DesktopHeader() {
  const { cartCount } = useCart();
  const { profile, displayName } = useUser();
  const points = profile?.points ?? 0;

  return (
    <header className="hidden md:flex sticky top-0 z-50 bg-brand-light px-8 lg:px-12 py-3 justify-between items-center shadow-sm h-[72px]">
      <div className="flex items-center gap-8 w-full max-w-2xl">
        <Link href="/home" className="flex items-center gap-3 shrink-0">
          <div className="bg-surface text-brand rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-inner">
            🥟
          </div>
          <span className="font-display text-2xl font-bold text-white uppercase tracking-wide">
            MOD PAO
          </span>
        </Link>

        <div className="relative w-full max-w-md hidden lg:block">
          <input
            type="search"
            placeholder="ค้นหาไส้ซาลาเปา..."
            className="w-full py-2.5 pl-12 pr-4 rounded-full text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner bg-surface"
          />
          <svg
            className="absolute left-4 top-2.5 text-muted"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        {cartCount > 0 && (
          <Link
            href="/checkout"
            className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
          >
            ตะกร้า ({cartCount})
          </Link>
        )}

        <div className="flex items-center gap-4 pl-6 border-l border-white/30">
          <div className="text-right hidden xl:block">
            <div className="text-white font-bold text-sm truncate max-w-[8rem]">
              {displayName || "สมาชิก"}
            </div>
            <div className="text-orange-100 text-xs font-bold mt-0.5">
              {points} POINT
            </div>
          </div>
          <Link
            href="/profile"
            className="w-11 h-11 bg-brand-muted rounded-full border-2 border-surface overflow-hidden shadow-sm flex items-center justify-center text-2xl"
          >
            🧑
          </Link>
        </div>
      </div>
    </header>
  );
}
