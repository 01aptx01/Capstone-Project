// components/layout/FloatingCart.tsx
"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function FloatingCart() {
  const { cartCount, totalPrice, orderStatus, timeLeft } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // 🚨 แสดงตะกร้าลอย "เฉพาะหน้า /home เท่านั้น"
  if (pathname !== "/home") return null;

  // 🚨 ถ้าไม่มีของในตะกร้า และไม่ได้อยู่ในสถานะรอจ่ายเงิน ให้ซ่อน
  if (cartCount === 0 && orderStatus !== "pending") return null;

  // แปลงวินาทีเป็น นาที:วินาที (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 🔴 เลย์เอาต์ตอน "รอการชำระเงิน" (สีแดงตามรูป)
  if (orderStatus === "pending") {
    return (
      <div className="fixed bottom-4 left-0 w-full z-[90] px-4 md:px-0 flex justify-center animate-fade-in pointer-events-none">
        <div 
          onClick={() => router.push("/payment")} // กดแล้วไปหน้าคิวอาร์
          className="w-full max-w-2xl bg-[#EF4444] rounded-2xl p-4 px-5 flex items-center justify-between shadow-[0_8px_30px_rgba(239,68,68,0.4)] cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base">รอการชำระเงิน ({formatTime(timeLeft)})</span>
              <span className="text-[10px] md:text-xs opacity-90 font-medium">กดเพื่อกลับไปหน้าชำระเงิน</span>
            </div>
          </div>
          <svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    );
  }

  // 🟠 เลย์เอาต์ตะกร้าปกติ (สีส้ม)
  return (
    <div className="fixed bottom-4 left-0 w-full z-[90] px-4 md:px-0 flex justify-center animate-fade-in pointer-events-none">
      <div 
        onClick={() => router.push("/checkout")}
        className="w-full max-w-2xl bg-[#FF8A33] rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-[0_8px_30px_rgba(255,138,51,0.4)] cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform"
      >
         <div className="flex items-center gap-4">
            <div className="relative text-white flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="absolute -top-1.5 -right-2.5 bg-white text-[#FF8A33] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FF8A33]">
                {cartCount}
              </span>
            </div>
            <div className="flex flex-col text-white">
              <span className="font-bold text-sm md:text-base">ตะกร้าของคุณ ({cartCount}/3)</span>
              <span className="text-[10px] md:text-xs opacity-90 font-medium mt-0.5">กดเพื่อดูรายละเอียดและชำระเงิน</span>
            </div>
         </div>
         
         <div className="flex items-center gap-1.5 text-white">
           <span className="font-extrabold text-lg md:text-xl">{totalPrice} ฿</span>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
         </div>
      </div>
    </div>
  );
}