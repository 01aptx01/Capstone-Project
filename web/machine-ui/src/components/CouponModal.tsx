"use client";

import React, { useEffect, useState } from "react";

export type AppliedCoupon = {
  code: string;
  promotion_id: number;
  type: string;
  subtotal_thb: number;
  discount_thb: number;
  final_thb: number;
  points_cost: number;
  label_th: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onApplied: (c: AppliedCoupon) => void;
  machineCode: string;
  cart: { product_id: number; quantity: number }[];
};

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
      if (!data.valid) {
        setError(data.message || "ไม่สามารถใช้คูปองนี้ได้");
        return;
      }
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
      <button type="button" className="modal-close-btn" onClick={onClose} aria-label="ปิด">
        &times;
      </button>
      <div className="coupon-modal-title">ใช้คูปองส่วนลด</div>

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

      {step === "confirm" && preview && (
        <>
          <div className="coupon-preview-card coupon-preview-card--simple">
            <div className="coupon-preview-code">{preview.code}</div>
            <p className="coupon-preview-label">{preview.label_th}</p>
            {preview.points_cost > 0 && (
              <p className="coupon-preview-points">แลกแต้มที่กำหนด: {preview.points_cost} แต้ม</p>
            )}
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
