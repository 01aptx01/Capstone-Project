"use client";
import React, { useCallback, useEffect, useState } from "react";
import { getPublicApiUrl, MAX_COUPON_CODE_LENGTH, NUMPAD_COUNTDOWN_SECONDS } from "../constants";

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
  const [countdown, setCountdown] = useState(NUMPAD_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) return;
    setStep("input");
    setCode("");
    setError(null);
    setPreview(null);
    setCountdown(NUMPAD_COUNTDOWN_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (open && countdown === 0) {
      onClose();
    }
  }, [open, countdown, onClose]);

  const handleKey = useCallback((char: string) => {
    setError(null);
    setCode((prev) => {
      if (prev.length >= MAX_COUPON_CODE_LENGTH) return prev;
      return prev + char;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setError(null);
    setCode((prev) => prev.slice(0, -1));
  }, []);

  const handleCheck = async () => {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError("กรุณากรอกรหัสคูปอง");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = getPublicApiUrl();
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

      setPreview({
        code: (data.code as string) || trimmed,
        promotion_id: data.promotion_id,
        type: data.type,
        subtotal_thb: data.subtotal_thb,
        discount_thb: data.discount_thb,
        final_thb: data.final_thb,
        points_cost: data.points_cost ?? 0,
        label_th: data.label_th,
      });
      setStep("confirm");
      setError(null);
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

  if (!open) return null;

  const displayCode = code || "กรอกรหัสคูปอง";

  return (
    <div className="numpad-modal-box" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="timeout-close-btn" onClick={onClose}>
        <span>{countdown}</span>
        <span className="points-close-icon">&times;</span>
      </button>

      {step === "input" && (
        <div className="numpad-modal-body">
          <div className="numpad-title">ใช้คูปองส่วนลด</div>
          {error && (
            <div
              className="numpad-modal-error kiosk-alert kiosk-alert--error"
              role="alert"
            >
              {error}
            </div>
          )}
          <div
            className="phone-display"
            style={{ opacity: code ? 1 : 0.6 }}
            aria-live="polite"
          >
            {displayCode}
          </div>
          <div className="numpad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                className="numpad-btn"
                disabled={loading}
                onClick={() => handleKey(String(num))}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="numpad-btn action"
              disabled={loading}
              onClick={handleDelete}
            >
              DEL
            </button>
            <button
              type="button"
              className="numpad-btn"
              disabled={loading}
              onClick={() => handleKey("0")}
            >
              0
            </button>
            <button
              type="button"
              className="numpad-btn action"
              disabled={loading}
              onClick={() => void handleCheck()}
            >
              {loading ? "..." : "OK"}
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && preview && (
        <div className="numpad-modal-body">
          <div className="numpad-title">ยืนยันใช้คูปอง</div>
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
                setError(null);
              }}
            >
              กลับไปแก้รหัส
            </button>
            <button
              type="button"
              className="coupon-modal-btn primary"
              onClick={confirmApply}
            >
              ยืนยันใช้คูปอง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
