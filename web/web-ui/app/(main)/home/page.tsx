"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DrawerMenu } from "@/components/layout/DrawerMenu";
import { MenuCard } from "@/components/cards/MenuCard";
import { MENU_ITEMS, CATEGORIES, COLORS } from "@/lib/constants";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "pork" | "veggie" | "sweet">("all");

  const filtered =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. ส่วน Header - แยกขาดระหว่าง Desktop และ Mobile */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      <MobileHeader 
        onMenuOpen={() => setDrawerOpen(!drawerOpen)} 
        isOpen={drawerOpen} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Sidebar - แสดงเฉพาะ Desktop */}
        <div className="hidden md:block">
          <DesktopSidebar active="home" />
        </div>

        {/* 3. Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto pb-10">
            {/* Hero section */}
            <div className="px-5 md:px-10 pt-6 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                เลือกไส้ที่ใช่
                <span style={{ color: COLORS.accent }}> สำหรับคุณ</span>
              </h1>
              {/* ... ส่วนคำบรรยาย ... */}
              
              {/* Category filter */}
              <div className="flex gap-2 mt-5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key as any)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={
                      activeCategory === cat.key
                        ? { backgroundColor: COLORS.accent, color: "white" }
                        : { backgroundColor: "white", color: COLORS.grayDark, border: "1px solid #F3F4F6" }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu grid */}
            <div className="px-5 md:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 4. Drawer Menu - จะแสดงเฉพาะเมื่อ drawerOpen เป็น true และจะอยู่ใต้ Mobile Header */}
      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}