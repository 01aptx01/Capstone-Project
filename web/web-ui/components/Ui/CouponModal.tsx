// components/Ui/CouponModal.tsx
"use client";

import React, { useState } from "react";
// 🚨 ดึงชุดข้อมูล COUPONS จาก constants มาใช้
import { COUPONS, Coupon } from "@/lib/constants"; 

interface CouponModalProps {
  onClose: () => void;
  onApply: (coupon: Coupon | null) => void;
  currentCouponId?: number;
}

export function CouponModal({ onClose, onApply, currentCouponId }: CouponModalProps) {
  const [selectedId, setSelectedId] = useState<number | undefined>(currentCouponId);

  const handleToggleCoupon = (id: number) => {
    if (selectedId === id) {
      setSelectedId(undefined); 
    } else {
      setSelectedId(id); 
    }
  };

  const handleApply = () => {
    // ดึงคูปองที่เลือกจากข้อมูล COUPONS
    const coupon = COUPONS.find(c => c.id === selectedId) || null;
    onApply(coupon);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        
        {/* Header Modal */}
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800">เลือกคูปองส่วนลด</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* ส่วนกรอกโค้ด */}
        <div className="p-5 border-b border-gray-50 flex gap-3">
          <input 
            type="text" 
            placeholder="กรอกโค้ดส่วนลด" 
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FF8A33]"
          />
          <button className="bg-gray-100 text-gray-500 px-5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
            ใช้โค้ด
          </button>
        </div>

        {/* 🚨 ใช้ข้อมูล COUPONS ในการลูปแสดงผล */}
        <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
          <h4 className="text-sm font-bold text-gray-600 mb-3">คูปองที่ใช้ได้ ({COUPONS.length})</h4>
          
          <div className="flex flex-col gap-3">
            {COUPONS.map((coupon) => (
              <div 
                key={coupon.id} 
                onClick={() => handleToggleCoupon(coupon.id)}
                className={`flex bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all select-none ${selectedId === coupon.id ? "border-[#FF8A33]" : "border-transparent"}`}
              >
                {/* 🚨 ดึงสีจาก coupon.colorBg มาใช้แทน */}
                <div className={`w-20 ${coupon.colorBg} flex items-center justify-center rounded-l-lg border-r-2 border-dashed border-white relative transition-colors`}>
                  <span className="text-3xl text-white opacity-60 font-bold">%</span>
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div>
                    {/* 🚨 ดึงชื่อ คำอธิบาย วันหมดอายุมาโชว์ */}
                    <h5 className="font-bold text-gray-800 text-sm md:text-base">{coupon.title}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{coupon.expiry}</p>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedId === coupon.id ? "border-[#FF8A33]" : "border-gray-200"}`}>
                    {selectedId === coupon.id && <div className="w-2.5 h-2.5 bg-[#FF8A33] rounded-full animate-fade-in"></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white border-t border-gray-50">
          <button 
            onClick={handleApply}
            className="w-full py-3.5 bg-[#FF8A33] hover:bg-orange-500 text-white rounded-xl font-bold transition-colors shadow-md shadow-orange-500/20"
          >
            ตกลง
          </button>
        </div>

      </div>
    </div>
  );
}