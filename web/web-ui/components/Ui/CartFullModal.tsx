// components/ui/CartFullModal.tsx
import React from "react";

export function CartFullModal({ onClose }: { onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[320px] bg-white rounded-3xl shadow-xl p-8 text-center relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ไอคอนรถเข็น + กากบาทแดง */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 relative">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {/* Badge (X) */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-[#FF5A5A] text-white rounded-full border-2 border-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>
        
        <h3 className="text-xl font-extrabold text-[#161D29] mb-3">ตะกร้าเต็มแล้ว!</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          คุณสามารถจองล่วงหน้าได้สูงสุด<br/>
          <span className="font-bold text-[#FF8A33] text-base px-1">3 ชิ้น</span> ต่อ 1 คำสั่งซื้อเท่านั้น
        </p>

        <button 
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-[#161D29] hover:bg-gray-800 transition-colors shadow-md text-sm"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}