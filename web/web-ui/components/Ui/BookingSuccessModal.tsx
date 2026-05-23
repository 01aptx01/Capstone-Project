// components/ui/BookingSuccessModal.tsx
import React from "react";

interface BookingSuccessModalProps {
  onConfirm: () => void;
}

export function BookingSuccessModal({ onConfirm }: BookingSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl p-8 text-center animate-scale-in">
        
        {/* ไอคอนเครื่องหมายถูก */}
        <div className="w-24 h-24 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h3 className="text-2xl font-extrabold text-[#161D29] mb-3 tracking-tight">จองสำเร็จ!</h3>
        
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          ซาลาเปาแสนอร่อยรอคุณอยู่<br/>
          กรุณานำ QR Code ในหน้าประวัติ<br/>
          <span className="font-bold text-[#FF8A33]">ไปสแกนรับที่ตู้ MOD PAO ได้เลยครับ</span>
        </p>

        <button 
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl font-bold text-white bg-[#10B981] hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 text-base"
        >
          ดูประวัติการจอง
        </button>
      </div>
    </div>
  );
}