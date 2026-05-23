// app/(main)/payment/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function PaymentPage() {
  const router = useRouter();
  const { orderStatus, paymentMethod, timeLeft, totalPrice, appliedCoupon, cancelOrder, completeOrder } = useCart();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkAttempt, setCheckAttempt] = useState(0); 
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    if (orderStatus !== "pending") {
      router.push("/home");
    }
  }, [orderStatus, router]);

  if (orderStatus !== "pending") return null;

  const discountAmount = appliedCoupon ? appliedCoupon.discountValue : 0;
  const netPrice = Math.max(0, totalPrice - discountAmount);
  const mockOrderId = "1112"; 

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleBack = () => router.push("/home");

  const handleConfirmCancel = () => {
    cancelOrder(); // ฟังก์ชันนี้เราจะไปแก้ให้เคลียร์ตะกร้าในขั้นตอนต่อไป
    setShowCancelModal(false);
    router.push("/home");
  };

  const handleVerifyPayment = () => {
    setIsChecking(true);
    setCheckError("");

    setTimeout(() => {
      setIsChecking(false);
      if (checkAttempt === 0) {
        setCheckError("ยังไม่พบยอดการชำระเงิน กรุณาตรวจสอบอีกครั้ง");
        setCheckAttempt(1);
      } else {
        completeOrder(); // ฟังก์ชันนี้จะเคลียร์ตะกร้าเหมือนกัน
        router.push("/history"); 
      }
    }, 2000);
  };

  return (
    // 🚨 ปรับคอนเทนเนอร์หลักให้มีความสูงเต็มจอเป๊ะๆ และเผื่อที่ว่างด้านล่างสำหรับปุ่ม
    <div className="flex flex-col h-screen bg-gray-50 pb-[180px]">
      
      {/* Header ย้อนกลับ */}
      <div className="flex items-center gap-4 p-5 bg-white shadow-sm z-10 shrink-0">
        <button onClick={handleBack} className="text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">ชำระเงิน</h1>
      </div>

      {/* พื้นที่ใส่คิวอาร์โค้ด (มี Scroll หากหน้าจอเล็กเกิน) */}
      <div className="px-5 pt-6 w-full max-w-md mx-auto flex-1 overflow-y-auto no-scrollbar">
        
        <div className="text-center mb-4">
          <span className="font-bold text-gray-500 text-sm">หมายเลขคำสั่งซื้อ: {mockOrderId}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden mb-6">
          <div className="p-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 border border-blue-100 rounded-full mb-6">
              <svg className="text-[#003D6A]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M14 14h6v6h-6z"/><path d="M4 14h6v6H4z"/></svg>
              <span className="font-bold text-[#003D6A] text-xs">
                {paymentMethod === "promptpay" ? "Thai QR PromptPay" : "TrueMoney Wallet"}
              </span>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center p-3">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#FF8A33] rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#FF8A33] rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#FF8A33] rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#FF8A33] rounded-br-2xl"></div>
              
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="font-bold text-gray-300 text-lg">QR Code</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center w-full">
            <div className="absolute -left-3 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-100"></div>
            <div className="w-full border-t-2 border-dashed border-gray-100"></div>
            <div className="absolute -right-3 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-100"></div>
          </div>

          <div className="p-6 flex flex-col items-center">
            <p className="text-gray-500 font-bold text-sm mb-1">ยอดที่ต้องชำระ</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-extrabold text-[#FF8A33]">{netPrice}</span>
              <span className="text-xl font-bold text-[#FF8A33]">฿</span>
            </div>

            <div className="w-full flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1.5 text-[#EF4444]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-xs font-bold">กรุณาชำระเงินภายใน</span>
              </div>
              <span className="text-2xl font-extrabold text-[#EF4444] tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🚨 ปุ่มด้านล่างใช้ fixed bottom-0 บังคับติดขอบล่าง 100% */}
      <div className="fixed bottom-0 left-0 w-full bg-white px-5 pt-5 pb-8 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-50 border-t border-gray-100">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">
          {checkError && <p className="text-red-500 text-sm text-center font-bold animate-pulse">{checkError}</p>}
          
          <button 
            onClick={handleVerifyPayment}
            className="w-full py-3.5 bg-[#FF8A33] hover:bg-orange-500 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-orange-500/20"
          >
            ยืนยันการชำระเงิน
          </button>

          <button 
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl font-bold text-base transition-colors"
          >
            ยกเลิกทำรายการ
          </button>
        </div>
      </div>

      {/* ... Modals ยังคงเหมือนเดิม ... */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto bg-red-100 text-[#FF5A5A] rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ยกเลิกรายการ?</h3>
            <p className="text-gray-500 text-sm mb-6">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการชำระเงินคำสั่งซื้อนี้?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">ปิด</button>
              <button onClick={handleConfirmCancel} className="flex-1 py-3 bg-[#FF5A5A] text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">ยืนยันยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex flex-col items-center justify-center p-5 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF8A33] rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold text-lg animate-pulse">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      )}

    </div>
  );
}