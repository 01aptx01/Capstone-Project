"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchMemberCoupons, type UserCoupon } from "@/lib/api/orders";
import { Button, EmptyState, PageHeader, Skeleton } from "@/components/Ui";
import { MyCouponCard } from "@/components/cards/MyCouponCard";
import type { MyCoupon } from "@/components/cards/MyCouponCard";

function mapToMyCoupon(coupon: UserCoupon): MyCoupon {
  const colorMap: Record<string, string> = {
    percent: "bg-sky-500",
    fixed: "bg-brand",
    flat: "bg-brand",
  };
  const color = colorMap[(coupon.type || "").toLowerCase()] ?? "bg-brand";

  // คำนวณ status จริง
  let status: MyCoupon["status"] = coupon.status as MyCoupon["status"];
  if (
    status === "active" &&
    coupon.expiry &&
    new Date(coupon.expiry) < new Date()
  ) {
    status = "expired";
  }

  const expiryLabel = coupon.expiry
    ? `หมดอายุ ${new Date(coupon.expiry).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })}`
    : "ไม่มีวันหมดอายุ";

  return {
    id: coupon.id,
    title: coupon.title,
    description: coupon.description,
    expiry: expiryLabel,
    status,
    color,
  };
}

export default function MyCouponsPage() {
  const router = useRouter();
  const { phone } = useUser();

  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    if (!phone) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMemberCoupons(phone);
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดคูปองไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const activeCoupons = coupons.filter((c) => c.status === "active");
  const usedOrExpiredCoupons = coupons.filter(
    (c) => c.status === "used" || c.status === "expired",
  );

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 max-w-3xl">
        <PageHeader title="คูปองของฉัน" />

        <p className="text-muted text-sm mb-6">
          คุณสามารถแลกคะแนนสะสมเพิ่มได้ที่หน้าแลกรับ
        </p>

        {/* Applied coupon banner */}


        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-card" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <EmptyState
            title="โหลดคูปองไม่สำเร็จ"
            description={error}
            icon={<span className="text-4xl">⚠️</span>}
            action={
              <Button variant="secondary" onClick={() => void loadCoupons()}>
                ลองใหม่
              </Button>
            }
          />
        )}

        {/* Not logged in */}
        {!isLoading && !error && !phone && (
          <EmptyState
            title="กรุณาเข้าสู่ระบบ"
            description="เข้าสู่ระบบเพื่อดูคูปองของคุณ"
          />
        )}

        {/* Active coupons */}
        {!isLoading && !error && phone && activeCoupons.length > 0 && (
          <section className="mb-8">
            <h2 className="font-bold text-foreground text-sm mb-3 uppercase tracking-wide text-muted">
              คูปองที่ใช้ได้ ({activeCoupons.length})
            </h2>
            <div className="flex flex-col gap-3">
              {activeCoupons.map((coupon) => (
                <MyCouponCard
                  key={coupon.id}
                  coupon={mapToMyCoupon(coupon)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Used/Expired coupons */}
        {!isLoading && !error && phone && usedOrExpiredCoupons.length > 0 && (
          <section className="mb-8">
            <h2 className="font-bold text-sm mb-3 uppercase tracking-wide text-muted">
              ประวัติคูปอง
            </h2>
            <div className="flex flex-col gap-3">
              {usedOrExpiredCoupons.map((coupon) => (
                <MyCouponCard
                  key={coupon.id}
                  coupon={mapToMyCoupon(coupon)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!isLoading && !error && phone && coupons.length === 0 && (
          <EmptyState
            title="ยังไม่มีคูปอง"
            description="แลกแต้มเพื่อรับคูปองส่วนลดได้ที่หน้าแลกรับ"
            action={
              <Button variant="secondary" onClick={() => router.push("/redeem")}>
                ไปแลกแต้ม
              </Button>
            }
          />
        )}

        <div className="mt-4 flex flex-col gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push("/redeem")}
          >
            แลกแต้มรับคูปอง
          </Button>
        </div>
      </div>
    </div>
  );
}
