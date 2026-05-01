// components/cards/HistoryCard.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { OrderHistory } from "@/lib/constants";

interface HistoryCardProps {
  order: OrderHistory;
}

export function HistoryCard({ order }: HistoryCardProps) {
  const router = useRouter();

  // กำหนดรูปแบบและสีตามสถานะ
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "สำเร็จ", color: "text-[#10B981]", bg: "bg-emerald-50" };
      case "cancelled":
        return { label: "ยกเลิกแล้ว", color: "text-[#FF5A5A]", bg: "bg-red-50" };
      case "pending":
      default:
        return { label: "รอการชำระเงิน", color: "text-[#FF8A33]", bg: "bg-orange-50" };
    }
  };

  const statusInfo = getStatusDisplay(order.status);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      
      {/* Header ของ Card */}
      <div className="flex justify-between items-center border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">ออเดอร์ #{order.orderNumber}</span>
          <span className="text-xs text-gray-400 font-medium">{order.datetime}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </div>

      {/* ข้อมูลสินค้า */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm">{order.items}</span>
          <span className="font-extrabold text-gray-800">{order.total} ฿</span>
        </div>
        
        {/* 🚨 ปุ่มชำระเงิน (โชว์เฉพาะสถานะ pending) */}
        {order.status === "pending" && (
          <button 
            onClick={() => router.push("/payment")}
            className="px-5 py-2 bg-[#FF8A33] hover:bg-orange-500 text-white text-sm font-bold rounded-full shadow-sm transition-colors"
          >
            ชำระเงิน
          </button>
        )}

        {/* ปุ่มสแกนรับสินค้า (โชว์เฉพาะสถานะ completed) */}
        {order.status === "completed" && (
           <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
             สแกนแลกรับ
           </button>
        )}
      </div>

    </div>
  );
}