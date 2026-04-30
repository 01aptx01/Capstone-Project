// components/cards/HistoryCard.tsx
import React from "react";
import { OrderHistory } from "@/lib/constants";

interface HistoryCardProps {
  order: OrderHistory;
  onScan?: () => void;
  onCancel?: () => void; // 1. เพิ่ม Props สำหรับกดยกเลิก
}

export function HistoryCard({ order, onScan, onCancel }: HistoryCardProps) {
  const getStatusConfig = () => {
    switch (order.status) {
      case "pending":
        return {
          icon: (
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FF8A33]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          ),
          btnText: "แลกรับที่ตู้",
          btnClass: "bg-[#FF8A33] text-white hover:bg-orange-500 shadow-sm",
          onClick: onScan,
        };
      case "completed":
        return {
          icon: (
            <div className="w-12 h-12 rounded-full bg-[#4ADE80] flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ),
          btnText: "เสร็จสิ้น",
          btnClass: "bg-gray-200 text-white cursor-not-allowed",
          onClick: undefined,
        };
      case "cancelled":
        return {
          icon: (
            <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          ),
          btnText: "ยกเลิกแล้ว",
          btnClass: "bg-gray-200 text-white cursor-not-allowed",
          onClick: undefined,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-transform hover:shadow-md">
      
      <div className="flex gap-4 relative">
        <div className="shrink-0">{config.icon}</div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{order.datetime}</p>
          <h3 className="text-base font-bold text-gray-800">
            หมายเลขคำสั่งซื้อ#{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{order.items}</p>
        </div>
        
        {/* 2. ปรับปุ่ม X บนมือถือให้ชัดขึ้น มีวงกลมรองรับพื้นหลัง */}
        {order.status === "pending" && (
          <button 
            onClick={onCancel}
            className="md:hidden absolute top-0 right-0 p-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-red-500 rounded-full transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <div className="h-px w-full bg-gray-50 md:hidden" />

      <div className="flex justify-between items-center md:flex-col md:items-end gap-3 md:gap-4">
        <div className="text-sm">
          <span className="text-gray-800 font-bold">ยอดรวม </span>
          <span className="text-xl font-bold text-[#FF8A33] mx-1">{order.total}</span>
          <span className="text-gray-800 font-bold">บาท</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 3. ผูกปุ่มคำว่า "ยกเลิก" บนเดสก์ท็อปให้กดได้ด้วย */}
          {order.status === "pending" && (
            <button 
              onClick={onCancel}
              className="hidden md:block text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              ยกเลิก
            </button>
          )}
          
          <button 
            onClick={config.onClick} 
            className={`px-6 py-2 rounded-full font-bold text-sm ${config.btnClass}`}
          >
            {config.btnText}
          </button>
        </div>
      </div>
    </div>
  );
}