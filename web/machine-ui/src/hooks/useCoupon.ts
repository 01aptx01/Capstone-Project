"use client";
import { useState, useEffect, useMemo } from "react";
import type { CartItem, AppliedCoupon } from "../types";
import { getPublicApiUrl } from "../constants";

// useCoupon Hook
// - จัดการการใช้คูปองส่วนลด คะแนน และราคาสุทธิที่ต้องจ่าย
// - มีระบบคำนวณและตรวจสอบสิทธิ์คูปองซ้ำแบบเรียลไทม์เมื่อจำนวนสินค้าในตะกร้าเปลี่ยนแปลง
export function useCoupon(cart: CartItem[], machineCode: string, totalPrice: number) {
  // สถานะเก็บคูปองที่กำลังใช้งานอยู่ (ถ้าไม่มีเก็บเป็น null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // สร้าง Cart Signature เพื่อตรวจจับการเปลี่ยนแปลงของ id และ qty เท่านั้น
  const cartSignature = useMemo(
    () =>
      cart
        .map((item) => `${item.id}:${item.qty}`)
        .sort()
        .join("|"),
    [cart],
  );

  // ผลกระทบข้างเคียง (Side Effect):
  // 1. ล้างคูปองอัตโนมัติหากตะกร้าว่างเปล่า
  // 2. หากมีคูปองค้างอยู่ และตะกร้าเปลี่ยน -> เรียก API ตรวจสอบความถูกต้องของคูปองกับสินค้าปัจจุบัน
  useEffect(() => {
    // 1. ถ้าตะกร้าไม่มีของเลย ให้ยกเลิกการใช้คูปองทันที
    if (cart.length === 0) {
      setAppliedCoupon(null);
      return;
    }
    if (!appliedCoupon?.code) return;

    const code = appliedCoupon.code;
    let cancelled = false; // ตัวแปรสำหรับยกเลิก API call ตัวเดิมหากมีอันใหม่แทรกเข้ามาก่อนส่งเสร็จ (Race Conditions)
    const apiUrl = getPublicApiUrl();
    
    // แปลงตะกร้าสินค้าไปเป็นรูปแบบ payload
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
        
        // ถ้าผ่านเกณฑ์
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
  }, [cartSignature, cart.length, appliedCoupon?.code, machineCode]);

  // คำนวณยอดเงินที่ต้องชำระจริงหลังหักส่วนลดคูปอง
  const payableTotal = useMemo(() => {
    if (appliedCoupon && cart.length > 0) return appliedCoupon.final_thb;
    return totalPrice;
  }, [appliedCoupon, cart.length, totalPrice]);

  return { 
    appliedCoupon,
    setAppliedCoupon,
    payableTotal
  };
}
