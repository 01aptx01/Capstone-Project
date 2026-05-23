// app/(main)/coupons/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { COUPONS, Coupon } from "@/lib/constants";
import { useCart } from "@/context/CartContext";

export default function MyCouponsPage() {
  const router = useRouter();
  const { appliedCoupon, setAppliedCoupon } = useCart();

  // 🚨 ฟังก์ชันจัดการการคลิก: ถ้ากดอันที่เลือกอยู่ = ยกเลิก, ถ้ากดอันใหม่ = เลือกอันใหม่
  const handleToggleCoupon = (coupon: Coupon) => {
    if (appliedCoupon?.id === coupon.id) {
      setAppliedCoupon(null); // ยกเลิกการเลือก
    } else {
      setAppliedCoupon(coupon); // เลือกใช้งาน
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-700 border border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-2xl font-extrabold text-[#161D29]">คูปองของฉัน</h1>
        </div>

        {/* รายการคูปอง */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COUPONS.map((coupon) => {
            const isCurrentlyApplied = appliedCoupon?.id === coupon.id;

            return (
              <div 
                key={coupon.id} 
                className={`bg-white rounded-2xl p-4 md:p-5 shadow-sm border-2 transition-all ${isCurrentlyApplied ? "border-[#FF8A33] bg-orange-50/20" : "border-gray-100"}`}
              >
                <div className="flex items-start gap-4 h-full">
                  
                  {/* รูปแบบคูปอง */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${coupon.colorBg}`}>
                    <span className="text-2xl font-bold">%</span>
                  </div>

                  {/* ข้อมูลคูปอง & ปุ่ม */}
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{coupon.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{coupon.description}</p>
                    </div>
                    
                    {/* 🚨 ปุ่มย้ายมาอยู่ขวาล่าง ขนาดเล็กลง และจัดเลย์เอาต์ใหม่ */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[11px] font-medium text-gray-400">{coupon.expiry}</p>
                      
                      <button 
                        onClick={() => handleToggleCoupon(coupon)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                          isCurrentlyApplied 
                            ? "border-[#FF8A33] text-[#FF8A33] bg-white hover:bg-orange-50" // สไตล์ตอนกดใช้งานอยู่
                            : "border-[#FF8A33] bg-[#FF8A33] text-white hover:bg-orange-500 shadow-sm" // สไตล์ตอนยังไม่ได้กด
                        }`}
                      >
                        {isCurrentlyApplied ? "ยกเลิกการใช้" : "เลือกใช้งาน"}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}