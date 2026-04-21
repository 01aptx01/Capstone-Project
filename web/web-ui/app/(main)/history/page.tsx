// app/(main)/history/page.tsx
"use client";

import React from "react";
import { HistoryCard } from "@/components/cards/HistoryCard";
import { ORDER_HISTORY } from "@/lib/constants";

export default function HistoryPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-8 max-w-4xl mx-auto">
        
        {/* หัวข้อหน้า */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
          ประวัติการสั่งซื้อ
        </h1>

        {/* รายการคำสั่งซื้อ */}
        <div className="flex flex-col gap-4">
          {ORDER_HISTORY.map((order) => (
            <HistoryCard key={order.id} order={order} />
          ))}
        </div>

        {/* กรณีไม่มีประวัติ */}
        {ORDER_HISTORY.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p>ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        )}

      </div>
    </div>
  );
}