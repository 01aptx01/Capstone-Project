"use client";

import React, { useState } from "react";
import { pickupOrder } from "@/lib/api/orders";
import { useUser } from "@/context/UserContext";

interface QRScannerModalProps {
  orderNumber: string;
  chargeId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QRScannerModal({
  orderNumber,
  chargeId,
  onClose,
  onSuccess,
}: QRScannerModalProps) {
  const { phone } = useUser();
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "failed">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickup = async () => {
    if (!phone) {
      setError("กรุณาเข้าสู่ระบบ");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await pickupOrder(chargeId, phone);
      setScanStatus("success");
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setScanStatus("failed");
      setError(err instanceof Error ? err.message : "รับสินค้าไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 z-30 p-2"
        >
          ×
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <p className="font-bold text-gray-800 mb-2">สแกนรับสินค้า</p>
          <p className="text-sm text-gray-500 mb-6">ออเดอร์ #{orderNumber}</p>

          {scanStatus === "idle" && (
            <>
              <div className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-gray-400 text-sm">กล้อง (เร็วๆ นี้)</span>
              </div>
              {error && (
                <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
              )}
              <button
                onClick={() => void handlePickup()}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FF8A33] text-white rounded-xl font-bold disabled:opacity-60"
              >
                {isSubmitting ? "กำลังส่งคำสั่ง..." : "ยืนยันรับสินค้าที่ตู้"}
              </button>
            </>
          )}

          {scanStatus === "success" && (
            <p className="text-emerald-600 font-bold text-lg">รับสินค้าสำเร็จ!</p>
          )}

          {scanStatus === "failed" && (
            <>
              <p className="text-red-500 font-bold mb-4">ไม่สำเร็จ</p>
              {error && <p className="text-sm text-gray-500 mb-4">{error}</p>}
              <button
                onClick={() => setScanStatus("idle")}
                className="w-full py-3 bg-gray-100 rounded-xl font-bold"
              >
                ลองอีกครั้ง
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
