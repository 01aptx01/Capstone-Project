// components/ui/CancelConfirmModal.tsx
import React from "react";

interface CancelConfirmModalProps {
  orderNumber: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelConfirmModal({ orderNumber, onConfirm, onClose }: CancelConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[320px] bg-white rounded-3xl shadow-xl p-6 text-center relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ไอคอนแจ้งเตือน */}
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">ยกเลิกคำสั่งซื้อ?</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          คุณต้องการยกเลิกคำสั่งซื้อ <span className="font-bold text-gray-800">#{orderNumber}</span> ใช่หรือไม่?<br/>
          เมื่อยกเลิกแล้วจะไม่สามารถกู้คืนได้
        </p>

        {/* ปุ่มกดยืนยัน/ยกเลิก */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            ย้อนกลับ
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm text-sm"
          >
            ยืนยันยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}