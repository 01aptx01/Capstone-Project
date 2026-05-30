"use client";

import { useState } from "react";
import { validateCoupon, type AppliedCoupon } from "@/lib/api/buy";
import { MACHINE_CODE } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { Alert, Button, Input, ModalSheet } from "@/components/Ui";

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
  return (
    <CouponModalBody
      key={currentCode ?? ""}
      onClose={onClose}
      onApply={onApply}
      currentCode={currentCode}
    />
  );
}

function CouponModalBody({
  onClose,
  onApply,
  currentCode,
}: CouponModalProps) {
  const { cartItems } = useCart();
  const [code, setCode] = useState(currentCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <ModalSheet open onClose={onClose} title="ใช้คูปองส่วนลด">
      <div className="px-5 pb-5 flex flex-col gap-3">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="กรอกโค้ดส่วนลด"
          className="text-sm py-3"
        />
        {error && <Alert variant="error">{error}</Alert>}
        <Button fullWidth loading={loading} onClick={() => void handleApply()}>
          ใช้คูปอง
        </Button>
        {currentCode && (
          <Button variant="ghost" fullWidth onClick={() => onApply(null)}>
            ยกเลิกคูปอง
          </Button>
        )}
      </div>
    </ModalSheet>
  );
}
