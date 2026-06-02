"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MenuCard } from "@/components/cards/MenuCard";
import { CATEGORIES, type MenuItem } from "@/lib/constants";
import { fetchProducts } from "@/lib/api/products";
import { MACHINE_CODE } from "@/lib/config";
import { Chip, EmptyState, Skeleton } from "@/components/Ui";

function mapCategory(raw: string): MenuItem["category"] {
  const c = (raw || "").toLowerCase();
  if (c.includes("sweet")) return "sweet";
  if (c.includes("vegetarian")) return "veggie";
  return "pork";
}

function MenuSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-card border border-border overflow-hidden">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/2 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageFallback() {
  return (
    <div className="pb-8 md:pb-10">
      <div className="page-container pt-6 pb-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="page-container">
        <MenuSkeletonGrid />
      </div>
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams?.get("q") ?? "").trim().toLowerCase();

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

  const filtered = useMemo(() => {
    let items =
      activeCategory === "all"
        ? menuItems
        : menuItems.filter((m) => m.category === activeCategory);

    if (searchQuery) {
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery) ||
          m.description.toLowerCase().includes(searchQuery),
      );
    }

    return items;
  }, [activeCategory, menuItems, searchQuery]);

  return (
    <div className="pb-8 md:pb-10">
      <div className="page-container pt-6 pb-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-snug">
          เลือกไส้ที่ใช่
          <span className="text-brand"> สำหรับคุณ</span>
        </h1>

        <p className="text-sm mt-1 text-muted">
          เลือกเมนู · สะสมแต้ม · แลกคูปองส่วนลด
        </p>
      </div>

      <div className="sticky top-(--header-height) md:top-(--topbar-height) z-30 bg-background/95 backdrop-blur-sm border-b border-border/80 md:border-0 md:bg-transparent md:backdrop-blur-none">
        <div className="page-container py-3">
          <div className="chip-scroll flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.key}
                active={activeCategory === cat.key}
                onClick={() =>
                  setActiveCategory(cat.key as typeof activeCategory)
                }
              >
                {cat.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container">
        {isLoading && <MenuSkeletonGrid />}
        {loadError && (
          <EmptyState
            title="โหลดเมนูไม่สำเร็จ"
            description={loadError}
            icon={<span className="text-4xl">⚠️</span>}
          />
        )}
        {!isLoading && !loadError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
        {!isLoading && !loadError && filtered.length === 0 && (
          <EmptyState
            title={
              searchQuery
                ? "ไม่พบเมนูที่ค้นหา"
                : "ไม่มีเมนูในหมวดนี้"
            }
            description={
              searchQuery
                ? `ไม่พบผลลัพธ์สำหรับ "${searchParams?.get("q") ?? ""}"`
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
