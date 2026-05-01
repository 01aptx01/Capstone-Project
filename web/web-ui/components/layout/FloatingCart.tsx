// components/layout/FloatingCart.tsx
"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function FloatingCart() {
  // 🚨 ดึง showCartFullToast มาใช้งานจาก Context
  const { cartCount, totalPrice, orderStatus, timeLeft, showCartFullToast } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname !== "/home") return null;
  if (cartCount === 0 && orderStatus !== "pending") return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (orderStatus === "pending") {
    return (
      <div className="fixed bottom-4 left-0 w-full z-[90] px-4 md:px-0 flex justify-center animate-fade-in pointer-events-none">
        <div 
          onClick={() => router.push("/payment")} 
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

  // 🟠 เลย์เอาต์ตะกร้าปกติ (พร้อม Toast แจ้งเตือนด้านบน)
  return (
    <>
      {/* 🚨 ใส่ CSS แอนิเมชันสั่น (Shake) ไว้ที่นี่ */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* เปลี่ยนมาใช้ flex-col เพื่อเรียงป๊อปอัปแจ้งเตือนไว้ด้านบนของตะกร้า */}
      <div className="fixed bottom-4 left-0 w-full z-[90] px-4 md:px-0 flex flex-col items-center gap-3 animate-fade-in pointer-events-none">
        
        {/* 🚨 Toast ป๊อปอัปสีแดง สั่นเตือนเมื่อตะกร้าเต็ม */}
        {showCartFullToast && (
          <div className="bg-[#EF4444] text-white text-sm md:text-base font-bold px-7 py-4 rounded-full shadow-xl flex items-center gap-2 animate-shake pointer-events-auto border border-red-500/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            ตะกร้าเต็มแล้ว! สั่งได้สูงสุด 3 ชิ้น/ออเดอร์
          </div>
        )}

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
    </>
  );
}