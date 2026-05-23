"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponModal } from "@/components/Ui/CouponModal";
import { PaymentMethodModal } from "@/components/Ui/PaymentMethodModal";
import { useCart } from "@/context/CartContext";
import { BaoImage } from "@/components/cards/BaoImage";

export default function CheckoutPage() {
  const router = useRouter();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    cartItems,
    cartCount,
    totalPrice,
    payableTotal,
    appliedCoupon,
    setAppliedCoupon,
    updateQty,
    removeItem,
    startCheckout,
  } = useCart();

  const handleConfirmPaymentMethod = (method: string) => {
    setIsPaymentModalOpen(false);
    startCheckout(method);
    router.push("/payment");
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-[calc(100vh-72px)] bg-gray-50 relative">
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 pt-6 pb-4 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-700 border border-gray-100"
          >
            ←
          </button>
          <h1 className="text-2xl font-extrabold text-[#161D29]">ตะกร้าของฉัน</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 relative"
              >
                <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden relative shadow-sm border border-gray-100">
                  <BaoImage item={item} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-8">
                    <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                    <p className="font-bold text-[#FF8A33] text-sm mt-0.5">
                      {item.price} ฿
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500"
                  >
                    🗑
                  </button>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full px-2 py-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold"
                      >
                        −
                      </button>
                      <span className="font-bold text-gray-800 w-4 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      รวม{" "}
                      <span className="font-bold text-gray-600">
                        {item.price * item.qty} ฿
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-auto pt-6">
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="w-full bg-white p-4 rounded-[1rem] shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <span className="font-bold text-gray-700 text-sm">
                  {appliedCoupon
                    ? appliedCoupon.label_th
                    : "ใช้คูปองหรือกรอกโค้ดส่วนลด"}
                </span>
                {appliedCoupon && (
                  <span className="text-[#10B981] font-bold text-xs">
                    - {appliedCoupon.discount_thb} ฿
                  </span>
                )}
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

      {cartItems.length > 0 && (
        <div className="sticky bottom-0 w-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)] border-t border-gray-100 z-50 mt-auto rounded-t-[2rem]">
          <div className="max-w-2xl mx-auto px-6 py-6 w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  ยอดรวมสินค้า ({cartCount}/3 ชิ้น)
                </span>
                <span className="font-bold text-gray-800">{totalPrice} ฿</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#10B981] font-medium">ส่วนลดคูปอง</span>
                  <span className="font-bold text-[#10B981]">
                    - {appliedCoupon.discount_thb} ฿
                  </span>
                </div>
              )}
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-gray-800 text-lg">ยอดชำระสุทธิ</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-[#FF8A33] text-4xl">
                    {payableTotal}
                  </span>
                  <span className="font-bold text-gray-800 text-sm">บาท</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#FF8A33] hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/30"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      )}

      {isCouponModalOpen && (
        <CouponModal
          currentCode={appliedCoupon?.code}
          onClose={() => setIsCouponModalOpen(false)}
          onApply={(coupon) => {
            setAppliedCoupon(coupon);
            setIsCouponModalOpen(false);
          }}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentMethodModal
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPaymentMethod}
        />
      )}
    </div>
  );
}
