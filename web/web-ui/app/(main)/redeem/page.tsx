"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cards/CouponCard";
import { fetchRedeemableCoupons, type RedeemableCoupon } from "@/lib/api/promotions";
import { redeemCoupon } from "@/lib/api/members";
import { useUser } from "@/context/UserContext";

export default function RedeemPage() {
  const { phone, profile } = useUser();
  const [coupons, setCoupons] = useState<RedeemableCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const points = profile?.points ?? 0;

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchRedeemableCoupons();
        setCoupons(data);
      } catch {
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleRedeem = async (promotionId: number) => {
    if (!phone) return;
    setMessage(null);
    try {
      await redeemCoupon(phone, promotionId);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "ระบบแลกคูปองยังไม่พร้อม (501)",
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-gray-600 font-bold mb-1">คะแนนของคุณ</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold text-[#FF8A33]">
                {points}
              </span>
              <span className="text-sm font-bold text-gray-400 uppercase">
                Points
              </span>
            </div>
          </div>

          <Link
            href="/coupons"
            className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex md:flex-col items-center justify-between md:justify-center hover:bg-orange-50 transition-colors"
          >
            <span className="text-gray-800 font-bold">คูปองที่สามารถใช้ได้</span>
            <span className="text-2xl font-extrabold text-[#FF8A33]">
              ใส่โค้ดตอนชำระ
            </span>
          </Link>
        </div>

        {message && (
          <p className="text-center text-sm font-bold text-amber-600 mb-4">
            {message}
          </p>
        )}

        <div className="text-center md:text-left mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            เลือกคูปองที่ต้องการแลก
          </h2>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-10">กำลังโหลด...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {coupons.map((coupon) => (
              <div key={coupon.promotion_id} className="flex flex-col gap-3">
                <CouponCard
                  coupon={{
                    id: coupon.promotion_id,
                    title: coupon.title,
                    description: coupon.description,
                    points: coupon.points_cost,
                    colorBg: "bg-[#FF8A33]",
                    discountValue: coupon.discount_amount,
                    expiry: coupon.expiry ?? "ไม่มีวันหมดอายุ",
                  }}
                />
                <button
                  onClick={() => void handleRedeem(coupon.promotion_id)}
                  disabled={points < coupon.points_cost}
                  className="w-full py-3 bg-[#FF8A33] disabled:bg-gray-300 text-white rounded-xl font-bold"
                >
                  แลกรับ ({coupon.points_cost} แต้ม)
                </button>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-10">
                ยังไม่มีคูปองให้แลก
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
