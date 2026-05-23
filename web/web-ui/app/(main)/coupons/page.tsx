"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function MyCouponsPage() {
  const router = useRouter();
  const { appliedCoupon, setAppliedCoupon } = useCart();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100"
          >
            ←
          </button>
          <h1 className="text-2xl font-extrabold text-[#161D29]">คูปองของฉัน</h1>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          ใส่รหัสคูปองตอนชำระเงินในหน้าตะกร้า หรือแลกคูปองด้วยแต้มที่หน้าแลกรับ
        </p>

        {appliedCoupon ? (
          <div className="bg-white p-5 rounded-2xl border border-orange-100 mb-4">
            <p className="font-bold text-gray-800">{appliedCoupon.label_th}</p>
            <p className="text-[#10B981] font-bold text-sm mt-1">
              ใช้งานในตะกร้าปัจจุบัน (-{appliedCoupon.discount_thb} ฿)
            </p>
            <button
              onClick={() => setAppliedCoupon(null)}
              className="mt-3 text-sm text-red-500 font-bold"
            >
              ยกเลิกคูปองในตะกร้า
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10">
            ยังไม่มีคูปองที่เลือกในตะกร้า
          </p>
        )}

        <button
          onClick={() => router.push("/checkout")}
          className="w-full py-3.5 bg-[#FF8A33] text-white rounded-xl font-bold"
        >
          ไปที่ตะกร้าเพื่อใส่โค้ด
        </button>
      </div>
    </div>
  );
}
