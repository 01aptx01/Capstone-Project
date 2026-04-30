// app/(main)/coupons/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// 1. นำเข้า MyCouponCard แทน
import { MyCouponCard, MyCoupon } from "@/components/cards/MyCouponCard";

// 2. เปลี่ยน Type เป็น MyCoupon
const INITIAL_COUPONS: MyCoupon[] = [
  {
    id: "c1",
    title: "ส่วนลด 10 บาท",
    description: "เมื่อซื้อซาลาเปาครบ 100 บาท",
    expiry: "หมดอายุ 30 มิ.ย. 2026",
    status: "ready",
    color: "bg-[#EAB308]", 
  },
  {
    id: "c2",
    title: "ซื้อ 2 แถม 1",
    description: "สำหรับไส้หมูสับ",
    expiry: "หมดอายุ 15 พ.ค. 2026",
    status: "active",
    color: "bg-[#FF8A33]", 
  },
  {
    id: "c3",
    title: "ฟรี ชาเย็น 1 แก้ว",
    description: "เมื่อซื้อซาลาเปา 4 ลูกขึ้นไป",
    expiry: "หมดอายุ 10 เม.ย. 2026",
    status: "used",
    color: "bg-gray-300",
  },
  {
    id: "c4",
    title: "เปาหมูแดง ฟรี 1 ลูก",
    description: "แลกรับฟรีทันที ไม่มีขั้นต่ำ",
    expiry: "หมดอายุเมื่อ 1 เม.ย. 2026",
    status: "expired",
    color: "bg-gray-300",
  },
];

export default function CouponsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"available" | "history">("available");
  // 3. เปลี่ยน Type State
  const [coupons, setCoupons] = useState<MyCoupon[]>(INITIAL_COUPONS);

  const handleToggleStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, status: c.status === "ready" ? "active" : "ready" };
        }
        return c;
      })
    );
  };

  const availableCoupons = coupons.filter((c) => c.status === "ready" || c.status === "active");
  const historyCoupons = coupons.filter((c) => c.status === "used" || c.status === "expired");

  const displayCoupons = activeTab === "available" ? availableCoupons : historyCoupons;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 md:pt-8 max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#161D29]">คูปองของฉัน</h1>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-xl mb-6 max-w-[320px]">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "available" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ใช้งานได้ ({availableCoupons.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "history" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ประวัติ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCoupons.map((coupon) => (
            // 4. เรียกใช้ MyCouponCard
            <MyCouponCard 
              key={coupon.id} 
              coupon={coupon} 
              onToggleStatus={handleToggleStatus} 
            />
          ))}
        </div>

        {displayCoupons.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🎫</p>
            <p>ไม่พบคูปองในหมวดหมู่นี้</p>
          </div>
        )}

      </div>
    </div>
  );
}