// components/cards/HistoryCard.tsx
"use client";

import React, { useState } from "react";
import { OrderHistory } from "@/lib/constants";
import { QRScannerModal } from "@/components/Ui/QRScannerModal"; 

interface HistoryCardProps {
  order: OrderHistory;
}

export function HistoryCard({ order }: HistoryCardProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);

  // 🚨 กำหนดสีและข้อความสำหรับ 2 สถานะเท่านั้น
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ready_to_scan":
        return { label: "พร้อมสแกน", color: "text-[#10B981]", bg: "bg-emerald-50" }; 
      case "completed":
        return { label: "เสร็จสิ้น", color: "text-gray-500", bg: "bg-gray-100" }; 
      default:
        return { label: "-", color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const statusInfo = getStatusDisplay(order.status);

  return (
    <>
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
          
          {/* 🚨 ปุ่มสแกนรับสินค้า (โชว์เฉพาะสถานะ ready_to_scan) */}
          {order.status === "ready_to_scan" && (
             <button 
               onClick={() => setShowQRScanner(true)}
               className="px-5 py-2 bg-[#FF8A33] hover:bg-orange-600 text-white text-sm font-bold rounded-full shadow-sm transition-colors"
             >
               สแกนแลกรับ
             </button>
          )}
        </div>

      </div>

      {/* เรียกใช้งาน QR Scanner Modal เมื่อกดปุ่มสแกนแลกรับ */}
      {showQRScanner && (
        <QRScannerModal 
          orderNumber={order.orderNumber} 
          onClose={() => setShowQRScanner(false)} 
        />
      )}
    </>
  );
}