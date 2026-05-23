"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { checkout, getPaymentStatus, mockPay } from "@/lib/api/buy";
import { earnPoints } from "@/lib/api/members";
import { createPromptPaySource } from "@/lib/payment/omise";
import { FULFILLMENT_MODE, MACHINE_CODE } from "@/lib/config";

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

  const displayOrderId = chargeId
    ? chargeId.slice(-8)
    : "...";

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
    <div className="flex flex-col h-screen bg-gray-50 pb-[180px]">
      <div className="flex items-center gap-4 p-5 bg-white shadow-sm z-10 shrink-0">
        <button
          onClick={() => router.push("/home")}
          className="text-gray-600 hover:bg-gray-100 p-1.5 rounded-full"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">ชำระเงิน</h1>
      </div>

      <div className="px-5 pt-6 w-full max-w-md mx-auto flex-1 overflow-y-auto">
        <div className="text-center mb-4">
          <span className="font-bold text-gray-500 text-sm">
            หมายเลขคำสั่งซื้อ: {displayOrderId}
          </span>
        </div>

        {(initError || isInitiating) && (
          <div className="mb-4 text-center text-sm">
            {isInitiating && (
              <p className="text-gray-500">กำลังสร้าง QR Code...</p>
            )}
            {initError && <p className="text-red-500 font-bold">{initError}</p>}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden mb-6">
          <div className="p-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 border border-blue-100 rounded-full mb-6">
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
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-gray-300 text-sm">
                    {isInitiating ? "..." : "QR Code"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col items-center border-t border-dashed border-gray-100">
            <p className="text-gray-500 font-bold text-sm mb-1">ยอดที่ต้องชำระ</p>
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-4xl font-extrabold text-[#FF8A33]">
                {payableTotal}
              </span>
              <span className="text-xl font-bold text-[#FF8A33]">฿</span>
            </div>
            <span className="text-2xl font-extrabold text-[#EF4444] tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && chargeId && (
          <button
            onClick={() => void handleMockPay()}
            className="w-full mb-3 py-2 bg-green-500 text-white rounded-xl text-sm font-bold"
          >
            [Dev] จำลองชำระเงินสำเร็จ
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white px-5 pt-5 pb-8 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-50 border-t border-gray-100">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">
          {checkError && (
            <p className="text-red-500 text-sm text-center font-bold">{checkError}</p>
          )}
          <button
            onClick={() => void handleVerifyPayment()}
            disabled={!chargeId || isChecking}
            className="w-full py-3.5 bg-[#FF8A33] text-white rounded-xl font-bold disabled:opacity-50"
          >
            ยืนยันการชำระเงิน
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3.5 bg-gray-50 text-gray-500 rounded-xl font-bold"
          >
            ยกเลิกทำรายการ
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">ยกเลิกรายการ?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
              >
                ปิด
              </button>
              <button
                onClick={() => void handleConfirmCancel()}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF8A33] rounded-full animate-spin mb-4" />
          <p className="text-white font-bold">กำลังตรวจสอบ...</p>
        </div>
      )}
    </div>
  );
}
