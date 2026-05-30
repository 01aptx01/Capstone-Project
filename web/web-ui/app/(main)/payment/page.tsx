"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { checkout, getPaymentStatus, mockPay } from "@/lib/api/buy";
import { earnPoints } from "@/lib/api/members";
import { createPromptPaySource } from "@/lib/payment/omise";
import { FULFILLMENT_MODE, MACHINE_CODE } from "@/lib/config";
import { Alert, Button, PageHeader } from "@/components/Ui";
import { ModalSheet } from "@/components/Ui/ModalSheet";

const PAID_STATUSES = new Set([
  "paid",
  "ready_to_scan",
  "dispensing",
  "completed",
]);

export default function PaymentPage() {
  const router = useRouter();
  const { phone, loadMember } = useUser();
  const {
    orderStatus,
    paymentMethod,
    timeLeft,
    payableTotal,
    appliedCoupon,
    cartItems,
    chargeId,
    qrCode,
    setCheckoutResult,
    cancelOrder,
    completeOrder,
  } = useCart();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const initStarted = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handlePaymentComplete = useCallback(async () => {
    stopPoll();
    if (phone && chargeId) {
      try {
        await earnPoints({
          phone_number: phone,
          total_price: payableTotal,
          charge_id: chargeId,
        });
        await loadMember();
      } catch {
        // non-blocking
      }
    }
    completeOrder();
    router.push("/history");
  }, [
    stopPoll,
    phone,
    chargeId,
    payableTotal,
    loadMember,
    completeOrder,
    router,
  ]);

  const startPoll = useCallback(
    (id: string) => {
      stopPoll();
      pollRef.current = setInterval(async () => {
        try {
          const data = await getPaymentStatus(id);
          const st = String(data.status ?? "").toLowerCase();
          if (PAID_STATUSES.has(st)) {
            await handlePaymentComplete();
          }
        } catch {
          // keep polling
        }
      }, 2000);
    },
    [stopPoll, handlePaymentComplete],
  );

  useEffect(() => {
    if (orderStatus !== "pending") {
      router.push("/home");
    }
  }, [orderStatus, router]);

  useEffect(() => {
    if (
      orderStatus !== "pending" ||
      chargeId ||
      initStarted.current ||
      !paymentMethod
    ) {
      return;
    }

    initStarted.current = true;
    setIsInitiating(true);
    setInitError(null);

    void (async () => {
      try {
        const cart = cartItems.map((item) => ({
          product_id: Number(item.id),
          quantity: item.qty,
        }));
        const amountSatang = Math.round(payableTotal * 100);

        let paymentType: "source" | "truemoney" = "source";
        let paymentId = "";

        if (paymentMethod === "promptpay") {
          paymentId = await createPromptPaySource(amountSatang);
          paymentType = "source";
        } else if (paymentMethod === "truemoney") {
          paymentType = "truemoney";
          paymentId = "";
        } else {
          throw new Error("ช่องทางชำระเงินไม่รองรับ");
        }

        const result = await checkout({
          machine_code: MACHINE_CODE,
          cart,
          amount: amountSatang,
          payment_type: paymentType,
          payment_id: paymentId,
          coupon_code: appliedCoupon?.code,
          fulfillment_mode: FULFILLMENT_MODE,
        });

        if (!result.charge_id) {
          throw new Error(result.message || "สร้างรายการชำระเงินไม่สำเร็จ");
        }

        setCheckoutResult(result.charge_id, result.qr_code ?? null);

        if (result.status === "paid") {
          await handlePaymentComplete();
          return;
        }

        startPoll(result.charge_id);
      } catch (err) {
        setInitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        initStarted.current = false;
      } finally {
        setIsInitiating(false);
      }
    })();

    return () => stopPoll();
  }, [
    orderStatus,
    chargeId,
    paymentMethod,
    cartItems,
    payableTotal,
    appliedCoupon,
    setCheckoutResult,
    startPoll,
    stopPoll,
    handlePaymentComplete,
  ]);

  if (orderStatus !== "pending") return null;

  const displayOrderId = chargeId ? chargeId.slice(-8) : "...";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleVerifyPayment = async () => {
    if (!chargeId) return;
    setIsChecking(true);
    setCheckError("");
    try {
      const data = await getPaymentStatus(chargeId);
      const st = String(data.status ?? "").toLowerCase();
      if (PAID_STATUSES.has(st)) {
        await handlePaymentComplete();
      } else {
        setCheckError("ยังไม่พบยอดการชำระเงิน กรุณาตรวจสอบอีกครั้ง");
      }
    } catch {
      setCheckError("ตรวจสอบสถานะไม่สำเร็จ");
    } finally {
      setIsChecking(false);
    }
  };

  const handleMockPay = async () => {
    if (!chargeId) return;
    try {
      await mockPay(chargeId);
      await handlePaymentComplete();
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "mock pay failed");
    }
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    await cancelOrder();
    router.push("/home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-48 md:pb-32">
      <div className="page-container pt-5 max-w-md mx-auto w-full">
        <PageHeader
          title="ชำระเงิน"
          onBack={() => router.push("/home")}
        />

        <p className="text-center text-sm font-bold text-muted mb-4">
          หมายเลขคำสั่งซื้อ: {displayOrderId}
        </p>

        {(initError || isInitiating) && (
          <div className="mb-4 text-center text-sm">
            {isInitiating && <p className="text-muted">กำลังสร้าง QR Code...</p>}
            {initError && <Alert variant="error">{initError}</Alert>}
          </div>
        )}

        <div className="bg-surface rounded-card shadow-sm border border-border flex flex-col overflow-hidden mb-6">
          <div className="p-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 border border-sky-100 rounded-full mb-6">
              <span className="font-bold text-[#003D6A] text-xs">
                {paymentMethod === "promptpay"
                  ? "Thai QR PromptPay"
                  : "TrueMoney Wallet"}
              </span>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center p-3">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="Payment QR"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-background rounded-xl flex items-center justify-center border border-border">
                  <span className="font-bold text-muted text-sm">
                    {isInitiating ? "..." : "QR Code"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col items-center border-t border-dashed border-border">
            <p className="text-muted font-bold text-sm mb-1">ยอดที่ต้องชำระ</p>
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-4xl font-extrabold text-brand">
                {payableTotal}
              </span>
              <span className="text-xl font-bold text-brand">฿</span>
            </div>
            <span className="text-2xl font-extrabold text-destructive tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && chargeId && (
          <Button
            variant="secondary"
            fullWidth
            className="mb-3 bg-success/10 text-success border-success/30"
            onClick={() => void handleMockPay()}
          >
            [Dev] จำลองชำระเงินสำเร็จ
          </Button>
        )}
      </div>

      <div
        className="fixed left-0 w-full bg-surface px-5 pt-5 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-40 border-t border-border max-w-md mx-auto right-0"
        style={{
          bottom: "calc(var(--safe-bottom) + 0.5rem)",
        }}
      >
        <div className="w-full flex flex-col gap-3">
          {checkError && <Alert variant="error">{checkError}</Alert>}
          <Button
            fullWidth
            loading={isChecking}
            disabled={!chargeId}
            onClick={() => void handleVerifyPayment()}
          >
            ยืนยันการชำระเงิน
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowCancelModal(true)}>
            ยกเลิกทำรายการ
          </Button>
        </div>
      </div>

      <ModalSheet open={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="px-6 pb-6 text-center">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            ยกเลิกรายการ?
          </h3>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowCancelModal(false)}>
              ปิด
            </Button>
            <Button variant="danger" fullWidth onClick={() => void handleConfirmCancel()}>
              ยืนยัน
            </Button>
          </div>
        </div>
      </ModalSheet>

      {isChecking && (
        <div className="fixed inset-0 z-[var(--z-toast)] bg-black/60 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-border border-t-brand rounded-full animate-spin mb-4" />
          <p className="text-white font-bold">กำลังตรวจสอบ...</p>
        </div>
      )}
    </div>
  );
}
