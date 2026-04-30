"use client";

import { ModPaoLogo, IconSearch, IconBell, IconCart } from "@/components/icons";
import { COLORS } from "@/lib/constants";

export function DesktopHeader() {
  return (
    <header
      className="hidden md:flex items-center justify-between px-6 h-84px gap-6 border-b border-orange-400"
      style={{ backgroundColor: COLORS.primary }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <ModPaoLogo className="h-8 w-auto" />
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="ค้นหาไส้ซาลาเปา..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: "white" }}>
          <IconBell />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Cart */}
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: "white" }}>
          <IconCart />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/30" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-white text-sm font-semibold leading-none">คุณสมาชิก</p>
            <p className="text-orange-100 text-xs mt-0.5 font-medium">150 POINT</p>
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 bg-orange-300 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="18" fill="#FDDBA0" />
              <circle cx="18" cy="14" r="7" fill="#F5A623" />
              <ellipse cx="18" cy="30" rx="11" ry="8" fill="#F5A623" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}