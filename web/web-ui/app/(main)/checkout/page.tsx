// app/(main)/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingSuccessModal } from "@/components/Ui/BookingSuccessModal";

export default function CheckoutPage() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "เปามดแดง",
      price: 25,
      qty: 3,
      image: "", 
    }
  ]);

  const updateQty = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > 3 || newQty < 1) return item; 
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleConfirmBooking = () => {
    setIsSuccessModalOpen(true);
  };

  const handleGoToHistory = () => {
    setIsSuccessModalOpen(false);
    router.push("/history");
  };

  return (
    // 🚨 แก้ไขบรรทัดนี้: เพิ่ม flex-1, h-full และ min-h-[calc(100vh-72px)] เพื่อบังคับให้สูงเต็มจอเสมอ
    <div className="flex flex-col flex-1 w-full h-full min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-72px)] bg-gray-50 relative">
      
      {/* 1. ส่วนเนื้อหา รายการสินค้า (ใช้ flex-1 เพื่อดันให้กล่องสรุปยอดไปอยู่ล่างสุดเสมอ) */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-5 md:px-10 pt-6 md:pt-8 pb-10">
        
        {/* Header ย้อนกลับ */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-700 border border-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#161D29]">ตะกร้าของฉัน</h1>
        </div>

        {/* รายการสินค้า */}
        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 relative hover:shadow-md transition-shadow">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-[#EADCC8] rounded-2xl shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-white/50 rounded-full" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-10">
                    <h3 className="font-bold text-gray-800 text-base md:text-xl">{item.name}</h3>
                    <p className="font-bold text-[#FF8A33] text-sm md:text-base mt-1">{item.price} ฿</p>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-full px-2 py-1 md:px-3 md:py-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors font-bold text-lg">−</button>
                      <span className="font-bold text-gray-800 w-4 md:w-6 text-center text-sm md:text-base">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors font-bold text-lg">+</button>
                    </div>
                    
                    <div className="text-xs md:text-sm font-medium text-gray-400">
                      รวม <span className="font-bold text-gray-600 text-sm md:text-base">{item.price * item.qty} ฿</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border border-gray-100">
            <p className="text-6xl mb-4">🛒</p>
            <p className="font-bold text-lg">ไม่มีสินค้าในตะกร้า</p>
          </div>
        )}
      </div>

      {/* 2. ส่วนสรุปยอด (Sticky Bottom) จะโดน mt-auto ดันไปอยู่ล่างสุดเสมอ */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.06)] border-t border-gray-100 z-50 mt-auto">
          
          <div className="max-w-4xl mx-auto px-6 py-6 md:px-10 md:py-6 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-10">
            
            <div className="w-full md:w-auto flex flex-col gap-1 md:gap-0">
              <div className="flex justify-between md:justify-start items-center md:gap-4 text-sm text-gray-500 mb-2 md:mb-1">
                <span>จำนวนสินค้ารวม ({totalQty}/3)</span>
                <span className="font-bold text-gray-800 md:hidden">{totalQty} ชิ้น</span>
              </div>
              
              <div className="flex justify-between md:justify-start items-end md:gap-4">
                <span className="font-bold text-gray-800 text-lg md:text-xl">ยอดรวมทั้งสิ้น</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-[#FF8A33] text-4xl md:text-5xl">{totalPrice}</span>
                  <span className="font-bold text-gray-800 text-sm md:text-base">บาท</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px border-t border-dashed border-gray-200 md:hidden" />

            <button 
              onClick={handleConfirmBooking}
              className="w-full md:w-auto md:min-w-[280px] py-4 rounded-2xl font-bold text-white bg-[#FF8A33] hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 text-base md:text-lg shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ยืนยันการจอง
            </button>

          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <BookingSuccessModal onConfirm={handleGoToHistory} />
      )}
    </div>
  );
}