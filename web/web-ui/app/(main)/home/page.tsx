"use client";

import { useState } from "react";
import { MenuCard } from "@/components/cards/MenuCard";
import { MENU_ITEMS, CATEGORIES, COLORS } from "@/lib/constants";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "pork" | "veggie" | "sweet">("all");

  const filtered =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((m) => m.category === activeCategory);

  return (
    // 🚨 เปลี่ยนจาก pb-10 เป็น pb-40 เพื่อดันพื้นที่ด้านล่างให้พ้นตะกร้าและป๊อปอัปอย่างจุใจ[cite: 11]
    <div className="pb-40">
      {/* Hero section */}
      <div className="px-5 md:px-10 pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          เลือกไส้ที่ใช่
          <span style={{ color: COLORS.accent }}> สำหรับคุณ</span>
        </h1>
        
        {/* ส่วนคำบรรยาย */}
        <p
          className="text-sm mt-1 flex items-center gap-1.5"
          style={{ color: COLORS.gray }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          จองล่วงหน้าตอนนี้ แล้วไปรับของร้อนๆ ที่ตู้ใกล้บ้าน
        </p>

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

        {/* แสดงข้อความเมื่อไม่พบเมนูในหมวดนั้น */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🥟</p>
            <p>ไม่มีเมนูในหมวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}