// app/(main)/redeem/page.tsx
"use client";

import React from "react";
import Link from "next/link"; // 1. นำเข้า Link จาก Next.js เพิ่มตรงนี้
import { CouponCard } from "@/components/cards/CouponCard";
import { COUPONS } from "@/lib/constants";

export default function RedeemPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 max-w-5xl mx-auto">
        
        {/* Section ด้านบน: คะแนนและคูปองที่มี (Responsive) */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Card: คะแนนสะสม */}
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              {/* Info Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
            <span className="text-gray-600 font-bold mb-1">คะแนนของคุณ</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold text-[#FF8A33]">150</span>
              <span className="text-sm font-bold text-gray-400 uppercase">Points</span>
            </div>
          </div>

          {/* Card/Button: คูปองที่สามารถใช้ได้ -> 2. เปลี่ยน div ตรงนี้เป็น Link */}
          <Link href="/coupons" className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex md:flex-col items-center justify-between md:justify-center cursor-pointer hover:bg-orange-50 transition-colors group">
            <span className="text-gray-800 font-bold md:mb-1 group-hover:text-[#FF8A33] transition-colors">
              คูปองที่สามารถใช้ได้
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-5xl font-extrabold text-[#FF8A33]">2</span>
              <span className="text-sm font-bold text-gray-500">คูปอง</span>
              {/* Arrow Icon สำหรับ Mobile */}
              <svg className="md:hidden ml-2 text-[#FF8A33]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </Link>
        </div>

        {/* Section: เลือกคูปอง */}
        <div className="text-center md:text-left mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">เลือกคูปองที่ต้องการแลก</h2>
        </div>

        {/* Grid แสดงคูปอง (มือถือ 1 แถว, จอใหญ่ 2 แถว) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COUPONS.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>

      </div>
    </div>
  );
}