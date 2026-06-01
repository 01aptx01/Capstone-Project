"use client";

import { useEffect, useState } from "react";
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
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

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
    if (!phone || redeemingId !== null) return;
    setMessage(null);
    setRedeemingId(promotionId);
    try {
      const res = await redeemCoupon(phone, promotionId);
      setMessage(res.message || "แลกคูปองสำเร็จ");
      await loadMember();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "แลกคูปองไม่สำเร็จ",
      );
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 max-w-5xl">
        <div className="w-full mb-8">
          <Card
            className="w-full flex flex-col items-center justify-center p-6 text-center border-0"
            style={{ background: 'var(--brand-grad)', boxShadow: 'var(--brand-glow)' }}
          >
            <span className="text-white/80 font-bold text-xs uppercase tracking-wider mb-2">คะแนนสะสมของคุณ</span>
            <div className="flex items-baseline gap-1.5 justify-center">
              <span className="text-7xl font-extrabold text-white">{points}</span>
              <span className="text-sm font-extrabold text-white/70 uppercase">Points</span>
            </div>
            <p className="text-xs text-white/70 mt-3 leading-relaxed max-w-xs">
              สะสมคะแนนจากการซื้อสินค้าที่ตู้ แล้วนำแต้มมาแลกคูปองส่วนลดเพื่อนำรหัสไปกรอกใช้งานที่หน้าตู้ได้ทันที
            </p>
          </Card>
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
              <CouponCard
                key={coupon.promotion_id}
                coupon={{
                  id: coupon.promotion_id,
                  title: coupon.title,
                  description: coupon.description,
                  points: coupon.points_cost,
                  colorBg: "bg-brand",
                  discountValue: coupon.discount_amount,
                  expiry: coupon.expiry ?? "ไม่มีวันหมดอายุ",
                }}
                action={
                  <Button
                    size="sm"
                    loading={redeemingId === coupon.promotion_id}
                    disabled={points < coupon.points_cost || redeemingId !== null}
                    onClick={() => void handleRedeem(coupon.promotion_id)}
                  >
                    แลกรับ
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
