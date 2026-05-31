"use client";
import React, { useEffect, useState } from "react";

export type AppliedCoupon = {
  code: string; // รหัสคูปอง
  promotion_id: number; // ไอดีระบุแคมเปญโปรโมชั่น
  type: string; // ประเภทคูปอง (เช่น ส่วนลดเงินสด หรือ แลกแต้ม)
  subtotal_thb: number; // ยอดราคารวมเดิมก่อนหักส่วนลด
  discount_thb: number; // จำนวนเงินส่วนลดที่ได้หักไป
  final_thb: number; // ยอดเงินหลังลดแล้ว
  points_cost: number; // แต้มสะสมที่ต้องชำระแลกสิทธิ์
  label_th: string; // ตำอธิบายส่วนลด
};

type Props = {
  open: boolean;
  onClose: () => void;
  onApplied: (c: AppliedCoupon) => void;
  machineCode: string;
  cart: { product_id: number; quantity: number }[];
};

// CouponModal Component
// - โมดอลป๊อปอัปให้ลูกค้ากรอกรหัสคูปองส่วนลด
export default function CouponModal({
  open,
  onClose,
  onApplied,
  machineCode,
  cart,
}: Props) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AppliedCoupon | null>(null);

  // ล้างค่าฟิลด์และตัวแปรต่างๆ ทุกครั้งเมื่อมีการเปิดหน้าต่างนี้ใหม่
  useEffect(() => {
    if (open) {
      setStep("input");
      setCode("");
      setError(null);
      setPreview(null);
    }
  }, [open]);

  if (!open) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ฟังก์ชันส่งรหัสที่ลูกค้าพิมพ์ไปตรวจสอบความถูกต้องกับ API Backend
  const handleCheck = async () => {
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("กรุณากรอกรหัสคูปอง");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/buy/validate-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          machine_code: machineCode,
          cart,
        }),
      });
      const data = await res.json();

      // กรณีคูปองไม่ตรงตามเงื่อนไข (เช่น รหัสหมดอายุ สินค้าไม่ตรงหมวดหมู่ หรือสิทธิ์เต็ม)
      if (!data.valid) {
        setError(data.message || "ไม่สามารถใช้คูปองนี้ได้");
        return;
      }

      // กรณีผ่านเกณฑ์
      const next: AppliedCoupon = {
        code: data.code,
        promotion_id: data.promotion_id,
        type: data.type,
        subtotal_thb: data.subtotal_thb,
        discount_thb: data.discount_thb,
        final_thb: data.final_thb,
        points_cost: data.points_cost ?? 0,
        label_th: data.label_th,
      };

      setPreview(next);
      setStep("confirm");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const confirmApply = () => {
    if (preview) {
      onApplied(preview);
      onClose();
    }
  };

  return (
    <div className="coupon-modal-box" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="modal-close-btn" onClick={onClose} aria-label="ปิด">&times;</button>
      <div className="coupon-modal-title">ใช้คูปองส่วนลด</div>

      {/* ขั้นตอนการกรอกรหัส */}
      {step === "input" && (
        <>
          <p className="coupon-modal-hint">กรอกรหัสคูปองเพื่อตรวจสอบกับระบบ</p>
          <input
            type="text"
            className="coupon-modal-input"
            placeholder="เช่น PAO2026"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            autoComplete="off"
          />
          {error && <div className="coupon-modal-error">{error}</div>}
          <div className="coupon-modal-actions">
            <button type="button" className="coupon-modal-btn secondary" onClick={onClose} disabled={loading}>
              ยกเลิก
            </button>
            <button type="button" className="coupon-modal-btn primary" onClick={() => void handleCheck()} disabled={loading}>
              {loading ? "กำลังตรวจสอบ…" : "ตรวจสอบ"}
            </button>
          </div>
        </>
      )}

      {/* ขั้นตอนการแสดงสิทธิ์และให้ลูกค้ายืนยัน */}
      {step === "confirm" && preview && (
        <>
          <div className="coupon-preview-card coupon-preview-card--simple">
            <div className="coupon-preview-code">{preview.code}</div>
            <p className="coupon-preview-label">{preview.label_th}</p>
          </div>
          <p className="coupon-confirm-question">ยืนยันใช้คูปองนี้หรือไม่?</p>
          <div className="coupon-modal-actions">
            <button
              type="button"
              className="coupon-modal-btn secondary"
              onClick={() => {
                setStep("input");
                setPreview(null);
              }}
            >
              กลับไปแก้รหัส
            </button>
            <button type="button" className="coupon-modal-btn primary" onClick={confirmApply}>
              ยืนยันใช้คูปอง
            </button>
          </div>
        </>
      )}
    </div>
  );
}
