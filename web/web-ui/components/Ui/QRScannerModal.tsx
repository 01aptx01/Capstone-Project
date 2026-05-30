"use client";

import { useState } from "react";
import { pickupOrder } from "@/lib/api/orders";
import { useUser } from "@/context/UserContext";
import { Alert, Button, ModalSheet } from "@/components/Ui";

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
    <ModalSheet open onClose={onClose} title="สแกนรับสินค้า">
      <div className="px-6 pb-6 flex flex-col items-center text-center">
        <p className="text-sm text-muted mb-6">ออเดอร์ #{orderNumber}</p>

        {scanStatus === "idle" && (
          <>
            <div className="w-48 h-48 border-2 border-dashed border-border rounded-2xl flex items-center justify-center mb-6 bg-background">
              <span className="text-muted text-sm">กล้อง (เร็วๆ นี้)</span>
            </div>
            {error && (
              <Alert variant="error" className="mb-4 w-full">
                {error}
              </Alert>
            )}
            <Button
              fullWidth
              loading={isSubmitting}
              onClick={() => void handlePickup()}
            >
              ยืนยันรับสินค้าที่ตู้
            </Button>
          </>
        )}

        {scanStatus === "success" && (
          <p className="text-success font-bold text-lg py-8">รับสินค้าสำเร็จ!</p>
        )}

        {scanStatus === "failed" && (
          <>
            <p className="text-destructive font-bold mb-4">ไม่สำเร็จ</p>
            {error && <p className="text-sm text-muted mb-4">{error}</p>}
            <Button variant="secondary" fullWidth onClick={() => setScanStatus("idle")}>
              ลองอีกครั้ง
            </Button>
          </>
        )}
      </div>
    </ModalSheet>
  );
}
