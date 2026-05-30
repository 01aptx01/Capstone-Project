"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponModal } from "@/components/Ui/CouponModal";
import { PaymentMethodModal } from "@/components/Ui/PaymentMethodModal";
import { useCart } from "@/context/CartContext";
import { BaoImage } from "@/components/cards/BaoImage";
import { Button, EmptyState, PageHeader } from "@/components/Ui";

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
    <div className="flex flex-col flex-1 w-full min-h-[calc(100vh-var(--header-height))] bg-background relative">
      <div className="flex-1 page-container pt-6 pb-4 flex flex-col max-w-2xl">
        <PageHeader title="ตะกร้าของฉัน" />

        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface p-4 rounded-card shadow-sm border border-border flex gap-4 relative"
              >
                <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden border border-border bg-brand-muted">
                  <BaoImage item={item} />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="pr-8">
                    <h3 className="font-bold text-foreground text-base truncate">
                      {item.name}
                    </h3>
                    <p className="font-bold text-brand text-sm mt-0.5">
                      {item.price} ฿
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 touch-target p-1.5 text-muted hover:text-destructive"
                    aria-label="ลบรายการ"
                  >
                    🗑
                  </button>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-3 bg-background border border-border rounded-full px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="touch-target w-7 h-7 flex items-center justify-center text-muted font-bold"
                      >
                        −
                      </button>
                      <span className="font-bold text-foreground w-4 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="touch-target w-7 h-7 flex items-center justify-center text-muted font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs font-medium text-muted">
                      รวม{" "}
                      <span className="font-bold text-foreground">
                        {item.price * item.qty} ฿
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="w-full bg-surface p-4 rounded-card shadow-sm border border-border flex items-center justify-between touch-target hover:bg-brand-muted/50 transition-colors text-left"
            >
              <span className="font-bold text-foreground text-sm">
                {appliedCoupon
                  ? appliedCoupon.label_th
                  : "ใช้คูปองหรือกรอกโค้ดส่วนลด"}
              </span>
              {appliedCoupon && (
                <span className="text-success font-bold text-xs shrink-0">
                  - {appliedCoupon.discount_thb} ฿
                </span>
              )}
            </button>
          </div>
        ) : (
          <EmptyState
            title="ไม่มีสินค้าในตะกร้า"
            icon={<span className="text-5xl">🛒</span>}
            action={
              <Button variant="secondary" onClick={() => router.push("/home")}>
                กลับไปเลือกเมนู
              </Button>
            }
          />
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="sticky bottom-[calc(var(--safe-bottom)+0.75rem)] md:bottom-0 w-full bg-surface shadow-[0_-10px_30px_rgba(0,0,0,0.06)] border-t border-border z-40 mt-auto rounded-t-[2rem]">
          <div className="max-w-2xl mx-auto page-container py-6 w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">
                  ยอดรวมสินค้า ({cartCount}/3 ชิ้น)
                </span>
                <span className="font-bold text-foreground">{totalPrice} ฿</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-success font-medium">ส่วนลดคูปอง</span>
                  <span className="font-bold text-success">
                    - {appliedCoupon.discount_thb} ฿
                  </span>
                </div>
              )}
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-foreground text-lg">
                  ยอดชำระสุทธิ
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-brand text-4xl">
                    {payableTotal}
                  </span>
                  <span className="font-bold text-foreground text-sm">บาท</span>
                </div>
              </div>
            </div>
            <Button size="lg" fullWidth onClick={() => setIsPaymentModalOpen(true)}>
              ดำเนินการต่อ
            </Button>
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
