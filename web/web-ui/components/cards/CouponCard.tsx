// components/cards/CouponCard.tsx
import React from "react";
import { Coupon } from "@/lib/constants";

interface CouponCardProps {
  coupon: Coupon;
}

export function CouponCard({ coupon }: CouponCardProps) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-transform hover:scale-[1.02]">
      {/* ส่วนหัวสีๆ พร้อมรอยแหว่ง */}
      <div className={`relative h-32 ${coupon.colorBg} flex items-center justify-center`}>
        {/* รอยแหว่งซ้าย-ขวา */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
        
        {/* SVG Ticket Icon */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z"/>
          <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* รายละเอียดคูปอง */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{coupon.title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{coupon.description}</p>
        
        <div className="mt-auto flex justify-between items-center border-t border-gray-50 pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#FF8A33]">{coupon.points}</span>
            <span className="text-xs font-bold text-[#FF8A33] uppercase">Points</span>
          </div>
          <button className="bg-[#FF8A33] text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-orange-500 transition-colors">
            แลกรับ
          </button>
        </div>
      </div>
    </div>
  );
}