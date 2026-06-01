"use client";


import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchMemberCoupons, type UserCoupon } from "@/lib/api/orders";
import { Button, EmptyState, PageHeader, Skeleton, Chip } from "@/components/Ui";
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
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    expiry: expiryLabel,
    status,
    color,
    remaining: coupon.quantity ?? null,
  };
}

export default function MyCouponsPage() {
  const router = useRouter();
  const { phone } = useUser();

  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "used" | "expired">("all");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCoupons();
  }, [loadCoupons]);

  const mappedCoupons = coupons.map(mapToMyCoupon);

  const filteredCoupons = mappedCoupons.filter((c) => {
    if (activeFilter === "all") return true;
    return c.status === activeFilter;
  });

  const countActive = mappedCoupons.filter((c) => c.status === "active").length;
  const countUsed = mappedCoupons.filter((c) => c.status === "used").length;
  const countExpired = mappedCoupons.filter((c) => c.status === "expired").length;

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 max-w-3xl">
        <PageHeader title="คูปองของฉัน" back={false} />

        <p className="text-muted text-sm mb-6">
          คุณสามารถแลกคะแนนสะสมเพิ่มได้ที่หน้าแลกรับ
        </p>

        {/* Filters */}
        {phone && !isLoading && !error && (
          <div className="chip-scroll flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1 border-b border-border/50">
            <Chip
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            >
              ทั้งหมด ({mappedCoupons.length})
            </Chip>
            <Chip
              active={activeFilter === "active"}
              onClick={() => setActiveFilter("active")}
            >
              พร้อมใช้งาน ({countActive})
            </Chip>
            <Chip
              active={activeFilter === "used"}
              onClick={() => setActiveFilter("used")}
            >
              ใช้งานแล้ว ({countUsed})
            </Chip>
            <Chip
              active={activeFilter === "expired"}
              onClick={() => setActiveFilter("expired")}
            >
              หมดอายุ ({countExpired})
            </Chip>
          </div>
        )}

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

        {/* Coupon list */}
        {!isLoading && !error && phone && filteredCoupons.length > 0 && (
          <div className="flex flex-col gap-3 mb-8">
            {filteredCoupons.map((coupon) => (
              <MyCouponCard
                key={coupon.id}
                coupon={coupon}
              />
            ))}
          </div>
        )}

        {/* Filter empty state */}
        {!isLoading && !error && phone && coupons.length > 0 && filteredCoupons.length === 0 && (
          <EmptyState
            title={
              activeFilter === "active"
                ? "ไม่มีคูปองที่พร้อมใช้งาน"
                : activeFilter === "used"
                ? "ไม่มีคูปองที่ใช้งานแล้ว"
                : activeFilter === "expired"
                ? "ไม่มีคูปองที่หมดอายุ"
                : "ไม่พบคูปอง"
            }
            description="คุณสามารถแลกคะแนนสะสมเพิ่มได้ที่หน้าแลกรับ"
          />
        )}

        {/* Empty state (No coupons at all) */}
        {!isLoading && !error && phone && coupons.length === 0 && (
          <EmptyState
            title="ยังไม่มีคูปอง"
            description="แลกแต้มเพื่อรับคูปองส่วนลดได้ที่หน้าแลกรับ"
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
