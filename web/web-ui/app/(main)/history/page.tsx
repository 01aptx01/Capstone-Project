// app/(main)/history/page.tsx
"use client";

import React, { useState } from "react";
import { HistoryCard } from "@/components/cards/HistoryCard";
import { QRScannerModal } from "@/components/Ui/QRScannerModal";
import { CancelConfirmModal } from "@/components/Ui/CancelConfirmModal"; // 1. นำเข้า Component ใหม่
import { ORDER_HISTORY, OrderHistory } from "@/lib/constants";

export default function HistoryPage() {
  const [scanOrder, setScanOrder] = useState<OrderHistory | null>(null);
  const [cancelOrder, setCancelOrder] = useState<OrderHistory | null>(null); // 2. เพิ่ม State สำหรับยกเลิกออเดอร์

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10 relative">
      <div className="px-5 md:px-10 pt-8 max-w-4xl mx-auto">
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
          ประวัติการสั่งซื้อ
        </h1>

        <div className="flex flex-col gap-4">
          {ORDER_HISTORY.map((order) => (
            <HistoryCard 
              key={order.id} 
              order={order} 
              onScan={() => setScanOrder(order)} 
              onCancel={() => setCancelOrder(order)} // 3. กดแล้วส่งข้อมูลเข้า State ยกเลิก
            />
          ))}
        </div>

        {ORDER_HISTORY.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p>ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        )}

      </div>

      {/* เรียกใช้ Modal สแกน QR */}
      {scanOrder && (
        <QRScannerModal 
          orderNumber={scanOrder.orderNumber} 
          onClose={() => setScanOrder(null)} 
        />
      )}

      {/* 4. เรียกใช้ Modal ยืนยันการยกเลิก */}
      {cancelOrder && (
        <CancelConfirmModal 
          orderNumber={cancelOrder.orderNumber}
          onClose={() => setCancelOrder(null)}
          onConfirm={() => {
            alert(`จำลอง: ยกเลิกคำสั่งซื้อ ${cancelOrder.orderNumber} สำเร็จแล้ว!`);
            setCancelOrder(null);
            // TODO: ใส่ Logic ยิง API ไปลบข้อมูลที่ฝั่ง Backend ตรงนี้
          }}
        />
      )}
    </div>
  );
}