"use client";

import { useState, useEffect, useMemo } from "react";
import { MenuCard } from "@/components/cards/MenuCard";
import { CATEGORIES, COLORS, type MenuItem } from "@/lib/constants";
import { fetchProducts } from "@/lib/api/products";
import { MACHINE_CODE } from "@/lib/config";

function mapCategory(raw: string): MenuItem["category"] {
  const c = (raw || "").toLowerCase();
  if (c.includes("sweet") || c.includes("dessert")) return "sweet";
  if (c.includes("vegg") || c.includes("tofu") || c.includes("bean")) return "veggie";
  if (c.includes("pork") || c.includes("meat") || c.includes("chicken")) return "pork";
  return "pork";
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "pork" | "veggie" | "sweet"
  >("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchProducts(MACHINE_CODE);
        if (cancelled) return;
        setMenuItems(
          data
            .filter((p) => p.stock > 0)
            .map((p) => ({
              id: p.product_id,
              name: p.name,
              description: p.description || "",
              price: p.price,
              category: mapCategory(p.category),
              image: p.image_url || "#D4A574",
            })),
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "โหลดเมนูไม่สำเร็จ",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? menuItems
        : menuItems.filter((m) => m.category === activeCategory),
    [activeCategory, menuItems],
  );

  return (
    <div className="pb-40">
      <div className="px-5 md:px-10 pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          เลือกไส้ที่ใช่
          <span style={{ color: COLORS.accent }}> สำหรับคุณ</span>
        </h1>

        <p
          className="text-sm mt-1 flex items-center gap-1.5"
          style={{ color: COLORS.gray }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          จองล่วงหน้าตอนนี้ แล้วไปรับของร้อนๆ ที่ตู้ใกล้บ้าน
        </p>

        <div className="flex gap-2 mt-5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as typeof activeCategory)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeCategory === cat.key
                  ? { backgroundColor: COLORS.accent, color: "white" }
                  : {
                      backgroundColor: "white",
                      color: COLORS.grayDark,
                      border: "1px solid #F3F4F6",
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-10">
        {isLoading && (
          <div className="text-center py-20 text-gray-400">กำลังโหลดเมนู...</div>
        )}
        {loadError && (
          <div className="text-center py-20 text-red-500">{loadError}</div>
        )}
        {!isLoading && !loadError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {!isLoading && !loadError && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🥟</p>
            <p>ไม่มีเมนูในหมวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
