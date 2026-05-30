"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cards/CouponCard";
import { fetchRedeemableCoupons, type RedeemableCoupon } from "@/lib/api/promotions";
import { redeemCoupon } from "@/lib/api/members";
import { useUser } from "@/context/UserContext";
import { Alert, Button, Card, EmptyState, Skeleton } from "@/components/Ui";

export default function RedeemPage() {
  const { phone, profile, loadMember } = useUser();
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
      const res = await redeemCoupon(phone, promotionId);
      setMessage(res.message || "แลกคูปองสำเร็จ");
      await loadMember();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "แลกคูปองไม่สำเร็จ",
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Card className="flex-1 flex flex-col items-center justify-center p-6">
            <span className="text-muted font-bold mb-1">คะแนนของคุณ</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold text-brand">{points}</span>
              <span className="text-sm font-bold text-muted uppercase">Points</span>
            </div>
          </Card>

          <Link
            href="/coupons"
            className="flex-1 bg-surface p-6 rounded-card shadow-sm border border-border flex md:flex-col items-center justify-between md:justify-center hover:bg-brand-muted transition-colors touch-target"
          >
            <span className="text-foreground font-bold">คูปองที่สามารถใช้ได้</span>
            <span className="text-2xl font-extrabold text-brand">
              ใส่โค้ดตอนชำระ
            </span>
          </Link>
        </div>

        {message && (
          <Alert variant="info" className="mb-4">
            {message}
          </Alert>
        )}

        <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-6 text-center md:text-left">
          เลือกคูปองที่ต้องการแลก
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-card" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <EmptyState title="ยังไม่มีคูปองให้แลก" />
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
                    colorBg: "bg-brand",
                    discountValue: coupon.discount_amount,
                    expiry: coupon.expiry ?? "ไม่มีวันหมดอายุ",
                  }}
                />
                <Button
                  fullWidth
                  disabled={points < coupon.points_cost}
                  onClick={() => void handleRedeem(coupon.promotion_id)}
                >
                  แลกรับ ({coupon.points_cost} แต้ม)
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
