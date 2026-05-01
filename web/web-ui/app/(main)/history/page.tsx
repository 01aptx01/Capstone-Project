// app/(main)/history/page.tsx
"use client";

import React from "react";
import { ORDER_HISTORY } from "@/lib/constants";
import { HistoryCard } from "@/components/cards/HistoryCard";

export default function HistoryPage() {
  return (
    // 🚨 1. เอา min-h-screen ออก เพื่อไม่ให้ความสูงหน้าเพจไปกวน Layout หลัก
    // 🚨 2. ใส่ pb-32 เพื่อดันเนื้อหาให้พ้นระยะของเมนูด้านล่าง (BottomNav)
    <div className="flex flex-col pb-32">
      
      {/* 🚨 3. เอา sticky และ z-10 ออกเด็ดขาด เพื่อไม่ให้ไปบังเมนูด้านบน */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
          ประวัติการสั่งซื้อ
        </h1>
      </div>

      {/* รายการออเดอร์ */}
      <div className="p-5 flex flex-col gap-4 max-w-md mx-auto w-full">
        {ORDER_HISTORY.length > 0 ? (
          ORDER_HISTORY.map((order) => (
            <HistoryCard key={order.id} order={order} />
          ))
        ) : (
          /* กรณีไม่มีประวัติการสั่งซื้อเลย */
          <div className="flex flex-col items-center justify-center text-gray-400 mt-20 opacity-60">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p className="font-bold text-lg text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        )}
      </div>

    </div>
  );
}