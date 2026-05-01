// app/(main)/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponModal } from "@/components/Ui/CouponModal"; 
import { COUPONS } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { BaoImage } from "@/components/cards/BaoImage"; 

// 🚨 1. Import Modal เลือกช่องทางชำระเงิน (ลบ BookingSuccessModal ทิ้งได้เลย)
import { PaymentMethodModal } from "@/components/Ui/PaymentMethodModal";

export default function CheckoutPage() {
  const router = useRouter();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  
  // 🚨 2. State สำหรับเปิดปิด Modal ช่องทางชำระเงิน
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 🚨 3. ดึง startCheckout มาใช้งาน
  const { cartItems, cartCount, totalPrice, updateQty, removeItem, appliedCoupon, setAppliedCoupon, startCheckout } = useCart();

  const discountAmount = appliedCoupon ? appliedCoupon.discountValue : 0;
  const netPrice = Math.max(0, totalPrice - discountAmount); 

  // 🚨 4. ฟังก์ชันยืนยันเลือกช่องทางจ่ายเงิน
  const handleConfirmPaymentMethod = (method: string) => {
    setIsPaymentModalOpen(false);
    startCheckout(method); // เริ่มจับเวลา + เปลี่ยนสถานะเป็น pending
    router.push("/payment"); // ไปหน้า QR (เดี๋ยวเราสร้างในสเต็ปที่ 3)
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-[calc(100vh-72px)] bg-gray-50 relative">
      
      {/* 1. ส่วนเนื้อหาที่เลื่อนได้ */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 pt-6 pb-4 flex flex-col">
        
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-700 border border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-2xl font-extrabold text-[#161D29]">ตะกร้าของฉัน</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 relative">
                <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden relative shadow-sm border border-gray-100">
                  <BaoImage item={item as any} />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-8">
                    <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                    <p className="font-bold text-[#FF8A33] text-sm mt-0.5">{item.price} ฿</p>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full px-2 py-1">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-500 rounded-full font-bold">−</button>
                      <span className="font-bold text-gray-800 w-4 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 rounded-full font-bold">+</button>
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      รวม <span className="font-bold text-gray-600">{item.price * item.qty} ฿</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-auto pt-6">
              <button 
                onClick={() => setIsCouponModalOpen(true)}
                className="w-full bg-white p-4 rounded-[1rem] shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <svg className="text-[#FF8A33]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z"/><line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" /></svg>
                  
                  {appliedCoupon ? (
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-gray-800 text-sm">{appliedCoupon.title}</span>
                      <span className="font-bold text-[#10B981] text-xs mt-0.5">- {appliedCoupon.discountValue} ฿</span>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-700 text-sm">ใช้คูปองหรือกรอกโค้ดส่วนลด</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!appliedCoupon && COUPONS.length > 0 && (
                    <span className="bg-[#FF8A33] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {COUPONS.length} พร้อมใช้
                    </span>
                  )}
                  <svg className="text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border border-gray-100">
            <p className="text-6xl mb-4">🛒</p>
            <p className="font-bold text-lg">ไม่มีสินค้าในตะกร้า</p>
          </div>
        )}
      </div>

      {/* 2. ส่วนสรุปยอด (Sticky Bottom) */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 w-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)] border-t border-gray-100 z-50 mt-auto rounded-t-[2rem]">
          <div className="max-w-2xl mx-auto px-6 py-6 w-full flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">ยอดรวมสินค้า ({cartCount}/3 ชิ้น)</span>
                <span className="font-bold text-gray-800">{totalPrice} ฿</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#10B981] font-medium">ส่วนลดคูปอง</span>
                  <span className="font-bold text-[#10B981]">- {discountAmount} ฿</span>
                </div>
              )}

              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-gray-800 text-lg">ยอดชำระสุทธิ</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-[#FF8A33] text-4xl">{netPrice}</span>
                  <span className="font-bold text-gray-800 text-sm">บาท</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px border-t border-dashed border-gray-200" />

            {/* 🚨 5. เปลี่ยนข้อความเป็น ดำเนินการต่อ และกดแล้วเปิด Modal */}
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#FF8A33] hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-base"
            >
              ดำเนินการต่อ
            </button>

          </div>
        </div>
      )}

      {/* Render Modals */}
      {isCouponModalOpen && (
        <CouponModal 
          currentCouponId={appliedCoupon?.id}
          onClose={() => setIsCouponModalOpen(false)}
          onApply={(coupon) => {
            setAppliedCoupon(coupon); // 🚨 ให้บันทึกคูปองที่เลือก
            setIsCouponModalOpen(false); // 🚨 ปิดป๊อปอัป
          }}
        />
      )}

      {/* 🚨 6. Render Modal เลือกช่องทางจ่ายเงิน */}
      {isPaymentModalOpen && (
        <PaymentMethodModal 
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPaymentMethod}
        />
      )}
    </div>
  );
}