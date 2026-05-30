"use client";
import { useState, useEffect, useMemo } from "react";
import type { CartItem, AppliedCoupon } from "../types";

/**
 * Manages coupon state and auto-recalculation when cart changes.
 */
export function useCoupon(cart: CartItem[], machineCode: string, totalPrice: number) {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const cartSignature = useMemo(
    () =>
      cart
        .map((item) => `${item.id}:${item.qty}`)
        .sort()
        .join("|"),
    [cart],
  );

  /** ล้างคูปองเมื่อตะกร้าว่าง; เมื่อมีสินค้าและมีคูปอง — คำนวณยอดใหม่กับตะกร้าปัจจุบัน (ไม่ล้างเพราะแค่เพิ่มของ) */
  useEffect(() => {
    if (cart.length === 0) {
      setAppliedCoupon(null);
      return;
    }
    if (!appliedCoupon?.code) return;

    const code = appliedCoupon.code;
    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const payloadCart = cart.map((item) => ({ product_id: item.id, quantity: item.qty }));

    void (async () => {
      try {
        const res = await fetch(`${apiUrl}/api/buy/validate-coupon`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            machine_code: machineCode,
            cart: payloadCart,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.valid) {
          setAppliedCoupon(null);
          return;
        }
        setAppliedCoupon((prev) => {
          if (!prev || prev.code !== code) return prev;
          return {
            ...prev,
            subtotal_thb: data.subtotal_thb,
            discount_thb: data.discount_thb,
            final_thb: data.final_thb,
            label_th: data.label_th,
            points_cost: data.points_cost ?? prev.points_cost,
          };
        });
      } catch {
        if (!cancelled) setAppliedCoupon(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature, cart.length, appliedCoupon?.code, machineCode]);

  const payableTotal = useMemo(() => {
    if (appliedCoupon && cart.length > 0) return appliedCoupon.final_thb;
    return totalPrice;
  }, [appliedCoupon, cart.length, totalPrice]);

  return { appliedCoupon, setAppliedCoupon, payableTotal };
}
