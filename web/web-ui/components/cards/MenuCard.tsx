// components/cards/MenuCard.tsx
"use client";

import { useState } from "react";
import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";
import { COLORS } from "@/lib/constants";
import { useCart } from "@/context/CartContext"; // ดึงฟังก์ชันเพิ่มลงตะกร้า

export function MenuCard({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart(); // เรียกใช้ฟังก์ชัน

  // รับ Event (e) เข้ามาเพื่อคำนวณจุดลอยของอนิเมชัน
  const handleBook = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(e); // ส่ง event เข้าไปทำงาน
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="h-44 w-full overflow-hidden">
        <BaoImage item={item} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
        <p className="text-sm mt-0.5" style={{ color: COLORS.gray }}>
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg" style={{ color: COLORS.accent }}>
            {item.price} ฿
          </span>
          <button
            onClick={handleBook} // เรียกใช้งานฟังก์ชันที่รับ e ไว้
            className="px-5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200"
            style={
              added
                ? {
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    color: "white",
                  }
                : {
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    color: "white",
                  }
            }
          >
            {added ? "✓ จองแล้ว" : "จอง"}
          </button>
        </div>
      </div>
    </div>
  );
}