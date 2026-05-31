"use client";

// components/cards/MenuCard.tsx
// ─── MENU CARD COMPONENT ─────────────────────────────────────────────────────
// คอมโพเนนต์การ์ดแสดงรายการสินค้า (เช่น ซาลาเปาไส้ต่างๆ)
// ทำหน้าที่แสดงรูปภาพ ชื่อสินค้า คำอธิบายย่อ และราคาสินค้า พร้อมเอฟเฟกต์โฮเวอร์ (Hover Box Shadow)

import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";

export function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="bg-surface rounded-card overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
      {/* 1. ส่วนแสดงรูปภาพสินค้า โดยเรียกใช้ BaoImage เพื่อประมวลผลรูปภาพ/สีดีฟอลต์ */}
      <div className="h-44 w-full overflow-hidden bg-brand-muted">
        <BaoImage item={item} />
      </div>
      
      {/* 2. รายละเอียดสินค้า (ชื่อ, รายละเอียดไส้, ราคา) */}
      <div className="p-4">
        {/* ชื่อเมนูสินค้า */}
        <h3 className="font-semibold text-foreground text-base">{item.name}</h3>
        
        {/* รายละเอียดสินค้าแบบย่อ (จำกัดแสดงผลไม่เกิน 2 บรรทัดด้วย tailwind line-clamp-2) */}
        <p className="text-sm mt-0.5 text-muted line-clamp-2">
          {item.description}
        </p>
        
        {/* ราคาสินค้า */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="font-bold text-lg text-brand shrink-0">
            {item.price} ฿
          </span>
        </div>
      </div>
    </article>
  );
}

