"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button, Card, EmptyState, PageHeader } from "@/components/Ui";

export default function MyCouponsPage() {
  const router = useRouter();
  const { appliedCoupon, setAppliedCoupon } = useCart();

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 max-w-3xl">
        <PageHeader title="คูปองของฉัน" />

        <p className="text-muted text-sm mb-6">
          ใส่รหัสคูปองตอนชำระเงินในหน้าตะกร้า หรือแลกคูปองด้วยแต้มที่หน้าแลกรับ
        </p>

        {appliedCoupon ? (
          <Card className="mb-4 border-brand/30 bg-brand-muted/30">
            <p className="font-bold text-foreground">{appliedCoupon.label_th}</p>
            <p className="text-success font-bold text-sm mt-1">
              ใช้งานในตะกร้าปัจจุบัน (-{appliedCoupon.discount_thb} ฿)
            </p>
            <button
              type="button"
              onClick={() => setAppliedCoupon(null)}
              className="mt-3 text-sm text-destructive font-bold touch-target"
            >
              ยกเลิกคูปองในตะกร้า
            </button>
          </Card>
        ) : (
          <EmptyState
            title="ยังไม่มีคูปองที่เลือกในตะกร้า"
            className="py-10"
          />
        )}

        <Button fullWidth onClick={() => router.push("/checkout")}>
          ไปที่ตะกร้าเพื่อใส่โค้ด
        </Button>
      </div>
    </div>
  );
}
