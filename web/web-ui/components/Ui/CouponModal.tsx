"use client";

import React, { useEffect, useState } from "react";
import { validateCoupon, type AppliedCoupon } from "@/lib/api/buy";
import { MACHINE_CODE } from "@/lib/config";
import { useCart } from "@/context/CartContext";

interface CouponModalProps {
  onClose: () => void;
  onApply: (coupon: AppliedCoupon | null) => void;
  currentCode?: string;
}

export function CouponModal({
  onClose,
  onApply,
  currentCode,
}: CouponModalProps) {
  const { cartItems } = useCart();
  const [code, setCode] = useState(currentCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(currentCode ?? "");
    setError(null);
  }, [currentCode]);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      onApply(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cart = cartItems.map((item) => ({
        product_id: Number(item.id),
        quantity: item.qty,
      }));
      const data = await validateCoupon({
        code: trimmed,
        machine_code: MACHINE_CODE,
        cart,
      });
      if (!data.valid) {
        setError(data.message || "ไม่สามารถใช้คูปองนี้ได้");
        return;
      }
      onApply({
        code: data.code!,
        promotion_id: data.promotion_id!,
        type: data.type!,
        subtotal_thb: data.subtotal_thb!,
        discount_thb: data.discount_thb!,
        final_thb: data.final_thb!,
        points_cost: data.points_cost ?? 0,
        label_th: data.label_th ?? trimmed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800">ใช้คูปองส่วนลด</h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="กรอกโค้ดส่วนลด"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FF8A33]"
          />
          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}
          <button
            onClick={() => void handleApply()}
            disabled={loading}
            className="w-full py-3 bg-[#FF8A33] text-white rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "กำลังตรวจสอบ..." : "ใช้คูปอง"}
          </button>
          {currentCode && (
            <button
              onClick={() => onApply(null)}
              className="w-full py-2 text-gray-500 text-sm font-medium"
            >
              ยกเลิกคูปอง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
