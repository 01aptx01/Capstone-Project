"use client";
import { useState, useEffect, useRef } from "react";
import type { ModalType, PaymentMethod, TestCardBrand, CartItem, AppliedCoupon } from "../types";
import {
  PAYMENT_COUNTDOWN_SECONDS,
  NFC_BLOCK_DURATION_MS,
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_POLL_MAX_ATTEMPTS,
  PAYMENT_TIMEOUT_MS,
  TEST_CARDS,
} from "../constants";

interface UsePaymentOptions {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  cart: CartItem[];
  payableTotal: number;
  appliedCoupon: AppliedCoupon | null;
  machineCode: string;
  /** Called when payment succeeds — page orchestrates cross-cutting state reset */
  onPaymentSuccess: () => void;
}

export function usePayment({
  activeModal,
  setActiveModal,
  cart,
  payableTotal,
  appliedCoupon,
  machineCode,
  onPaymentSuccess,
}: UsePaymentOptions) {
  // ==========================================
  // STATE
  // ==========================================
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
  const [isOmiseLoaded, setIsOmiseLoaded] = useState(false);
  const [realQrCode, setRealQrCode] = useState<string | null>(null);
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState<number>(PAYMENT_COUNTDOWN_SECONDS);
  const [isCancelPaymentConfirmOpen, setIsCancelPaymentConfirmOpen] = useState(false);
  const [isNfcBlocked, setIsNfcBlocked] = useState(false);

  // ==========================================
  // REFS (for timer/interval callbacks)
  // ==========================================
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentChargeIdRef = useRef<string | null>(null);
  const nfcBlockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs to latest values for use inside timer/interval callbacks
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const payableTotalRef = useRef(payableTotal);
  payableTotalRef.current = payableTotal;
  const appliedCouponRef = useRef(appliedCoupon);
  appliedCouponRef.current = appliedCoupon;
  const isProcessingPaymentRef = useRef(isProcessingPayment);
  isProcessingPaymentRef.current = isProcessingPayment;

  // Sync state to ref for timers
  useEffect(() => {
    currentChargeIdRef.current = currentChargeId;
  }, [currentChargeId]);

  // Reset cancel confirm when leaving payment or going back to step 1
  useEffect(() => {
    if (activeModal !== "payment" || paymentStep === 1) {
      setIsCancelPaymentConfirmOpen(false);
    }
  }, [activeModal, paymentStep]);

  // ==========================================
  // CORE FUNCTIONS
  // ==========================================
  const closePaymentModal = () => {
    setActiveModal("none");
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
    setRealQrCode(null);
    setCurrentChargeId(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const cancelAndClosePaymentModal = async () => {
    const chargeIdToCancel = currentChargeIdRef.current;
    if (chargeIdToCancel) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${apiUrl}/api/buy/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ charge_id: chargeIdToCancel }),
        });
        console.log(`[Frontend] Auto-Cancelled order for charge: ${chargeIdToCancel}`);
      } catch (err) {
        console.error("[Frontend] Cancel API error:", err);
      }
    }
    closePaymentModal();
  };

  const attemptClosePaymentModal = () => {
    if (paymentStep === 2) {
      setIsCancelPaymentConfirmOpen(true);
      return;
    }
    cancelAndClosePaymentModal();
  };

  const confirmCancelPayment = async () => {
    setIsCancelPaymentConfirmOpen(false);
    await cancelAndClosePaymentModal();
  };

  const dismissCancelPaymentConfirm = () => {
    setIsCancelPaymentConfirmOpen(false);
  };

  /** Internal: clear polling + notify page orchestrator */
  const handlePaymentSuccessInternal = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setRealQrCode(null);
    onPaymentSuccessRef.current();
  };

  // ==========================================
  // PAYMENT API LOGIC
  // ==========================================
  const processPayment = async (paymentData: {
    type: "token" | "source" | "truemoney";
    id: string;
    amount: number;
  }) => {
    if (isProcessingPaymentRef.current) return;
    setIsProcessingPayment(true);
    const controller = new AbortController();
    const timeoutMs = PAYMENT_TIMEOUT_MS;
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("[Frontend] Initiating processPayment:", paymentData);
      const response = await fetch(`${apiUrl}/api/buy/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          machine_code: machineCode,
          cart: cartRef.current.map((item) => ({ product_id: item.id, quantity: item.qty })),
          amount: paymentData.amount,
          payment_type: paymentData.type,
          payment_id: paymentData.id,
          draft_id: currentChargeIdRef.current?.startsWith("draft_")
            ? currentChargeIdRef.current
            : undefined,
          coupon_code: appliedCouponRef.current?.code,
        }),
      });

      console.log("[Frontend] Backend response status:", response.status, {
        elapsedMs: Date.now() - startedAt,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Frontend] Backend error text:", errorText);
        throw new Error(
          `Payment failed: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("[Frontend] Backend result:", result);

      if (result?.charge_id) {
        setCurrentChargeId(result.charge_id);
      }

      if (
        (paymentData.type === "source" || paymentData.type === "truemoney") &&
        result.qr_code
      ) {
        setRealQrCode(result.qr_code);
        setPaymentStep(2);
        pollPaymentStatus(result.charge_id);
      } else {
        handlePaymentSuccessInternal();
      }
    } catch (err: any) {
      console.error("[Frontend] CRITICAL: Payment Process Failed", {
        message: err.message,
        name: err.name,
        elapsedMs: Date.now() - startedAt,
      });

      if (err.name === "AbortError") {
        alert(
          `ระบบเชื่อมต่อล่าช้า กรุณาลองใหม่อีกครั้ง (Timeout ${Math.round(timeoutMs / 1000)}s)`,
        );
      } else {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
      }

      // Safeguard: Reset to home screen to prevent freeze
      setTimeout(() => {
        cancelAndClosePaymentModal();
      }, 3000);
    } finally {
      clearTimeout(timeoutId);
      setIsProcessingPayment(false);
    }
  };

  const pollPaymentStatus = (chargeId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    console.log(`[Frontend] Starting poll for charge: ${chargeId}`);

    let attempts = 0;
    let inFlight = false;
    let stopped = false;

    const stopPolling = () => {
      stopped = true;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const tick = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      attempts++;
      if (attempts > PAYMENT_POLL_MAX_ATTEMPTS) {
        console.warn(
          `[Frontend] Poll timeout after ${PAYMENT_POLL_MAX_ATTEMPTS} attempts — auto-cancelling`,
        );
        stopPolling();
        await cancelAndClosePaymentModal();
        inFlight = false;
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/buy/status/${chargeId}`);
        if (res.ok) {
          const data = await res.json();
          const st = String(data.status ?? "").toLowerCase();
          console.log(
            `[Frontend] Poll result for ${chargeId} [${attempts}/${PAYMENT_POLL_MAX_ATTEMPTS}]:`,
            data.status,
          );
          if (st === "paid" || st === "dispensing" || st === "completed") {
            console.log("[Frontend] Payment confirmed via polling!");
            stopPolling();
            handlePaymentSuccessInternal();
            return;
          }
          if (
            st === "dispense_failed" ||
            st === "refunded" ||
            st === "cancelled" ||
            st === "canceled" ||
            st === "payment_failed" ||
            st === "failed"
          ) {
            stopPolling();
            alert(
              "การชำระเงินหรือการจ่ายสินค้าไม่สำเร็จ กรุณาติดต่อเจ้าหน้าที่หรือลองใหม่",
            );
            await cancelAndClosePaymentModal();
            return;
          }
        } else {
          console.error(`[Frontend] Poll failed with status: ${res.status}`);
        }
      } catch (e) {
        console.error("[Frontend] Polling exception:", e);
      } finally {
        inFlight = false;
      }
    };

    void tick();
    pollingIntervalRef.current = setInterval(
      () => void tick(),
      PAYMENT_POLL_INTERVAL_MS,
    );
  };

  // ==========================================
  // PAYMENT METHOD HANDLERS
  // ==========================================
  const handleDirectPromptPay = async () => {
    if (!(window as any).Omise) {
      alert("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    const amount = Math.round(payableTotalRef.current * 100);
    Omise.createSource(
      "promptpay",
      { amount, currency: "THB" },
      async (statusCode: number, response: any) => {
        if (statusCode !== 200) {
          console.error("Omise Source Error:", response);
          alert("ไม่สามารถสร้างรายการ PromptPay ได้");
          return;
        }
        const sourceId = response.id;
        setPaymentStep(2);
        processPayment({ type: "source", id: sourceId, amount });
      },
    );
  };

  const handleDirectTrueMoney = async () => {
    setPaymentStep(2);
    setRealQrCode(null);
    processPayment({
      type: "truemoney",
      id: "",
      amount: Math.round(payableTotalRef.current * 100),
    });
  };

  const handleProceedToTap = async () => {
    setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
    setPaymentStep(2);

    // สร้าง Draft Order ใน Database เพื่อให้มีสถานะ "รอจ่าย"
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/buy/create-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_code: machineCode,
          cart: cartRef.current.map((item) => ({
            product_id: item.id,
            quantity: item.qty,
          })),
          amount: Math.round(payableTotalRef.current * 100),
          payment_method: "credit_card",
          coupon_code: appliedCouponRef.current?.code,
        }),
      });
      const data = await response.json();
      if (data.charge_id) {
        setCurrentChargeId(data.charge_id);
      }
    } catch (err) {
      console.error("[Frontend] Error creating draft order:", err);
    }
  };

  // --- ฟังก์ชันจำลองการแตะบัตรที่เครื่องอ่าน NFC ---
  const simulateNfcTap = async (brand: TestCardBrand) => {
    if (!(window as any).Omise) {
      alert("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    console.log(
      `[Frontend] Simulating Card Tap (${brand}): Generating Omise Token...`,
    );

    const cardData = {
      name: TEST_CARDS[brand].name,
      number: TEST_CARDS[brand].number,
      expiration_month: 12,
      expiration_year: 2029,
      security_code: "123",
    };

    Omise.createToken(
      "card",
      cardData,
      async (statusCode: number, response: any) => {
        if (statusCode === 200) {
          console.log("[Frontend] Test Token Generated:", response.id);
          processPayment({
            type: "token",
            id: response.id,
            amount: Math.round(payableTotalRef.current * 100),
          });
        } else {
          console.error("[Frontend] Omise Tokenization Failed:", response);
          alert(`Tokenization Error: ${response.message || "Unknown error"}`);
          setTimeout(() => {
            cancelAndClosePaymentModal();
          }, 2000);
        }
      },
    );
  };

  /** Wrapper for NFC tap from UI buttons — adds blocking logic to prevent rapid re-taps */
  const handleSimulateNfcTap = (brand: TestCardBrand) => {
    if (isProcessingPayment || isNfcBlocked) return;
    setIsNfcBlocked(true);
    if (nfcBlockTimerRef.current) clearTimeout(nfcBlockTimerRef.current);
    nfcBlockTimerRef.current = setTimeout(
      () => setIsNfcBlocked(false),
      NFC_BLOCK_DURATION_MS,
    );
    simulateNfcTap(brand);
  };

  const simulatePromptPaySuccess = async () => {
    if (!currentChargeIdRef.current) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/buy/mock-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charge_id: currentChargeIdRef.current }),
      });
    } catch (err) {
      console.error("Mock Pay Error:", err);
      handlePaymentSuccessInternal();
    }
  };

  const handleCheckout = () => {
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
    setRealQrCode(null);
    setCurrentChargeId(null);
    setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
    setActiveModal("payment");
  };

  // ==========================================
  // TIMERS & EFFECTS
  // ==========================================
  // Timer: นับถอยหลังการชำระเงิน
  useEffect(() => {
    if (activeModal !== "payment") return;
    const timer = setInterval(() => {
      setPaymentCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === "payment" && paymentCountdown === 0) {
      cancelAndClosePaymentModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, paymentCountdown]);

  // NFC Reader Listener (จำลองการพิมพ์จากเครื่องอ่าน NFC)
  useEffect(() => {
    if (
      activeModal === "payment" &&
      selectedPaymentMethod !== null &&
      selectedPaymentMethod !== "promptpay" &&
      paymentStep === 2
    ) {
      let nfcBuffer = "";
      let lastKeyTime = Date.now();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (isProcessingPayment || isNfcBlocked) return;

        const now = Date.now();
        if (now - lastKeyTime > 100) {
          nfcBuffer = "";
        }
        lastKeyTime = now;

        if (e.key === "Enter") {
          if (nfcBuffer.length > 3) {
            e.preventDefault();
            setIsNfcBlocked(true);
            if (nfcBlockTimerRef.current) clearTimeout(nfcBlockTimerRef.current);
            nfcBlockTimerRef.current = setTimeout(
              () => setIsNfcBlocked(false),
              NFC_BLOCK_DURATION_MS,
            );
            simulateNfcTap("visa");
            nfcBuffer = "";
          }
        } else if (e.key.length === 1) {
          nfcBuffer += e.key;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, selectedPaymentMethod, paymentStep, isProcessingPayment, isNfcBlocked]);

  // Polling สำหรับ Hardware NFC Tap (จาก Python Agent / MFRC522)
  useEffect(() => {
    if (
      activeModal === "payment" &&
      selectedPaymentMethod !== null &&
      selectedPaymentMethod !== "promptpay" &&
      paymentStep === 2
    ) {
      const pollNfc = async () => {
        if (isProcessingPayment || isNfcBlocked) return;
        try {
          const res = await fetch("http://localhost:5000/nfc/status");
          if (res.ok) {
            const data = await res.json();
            if (data.status === "tapped") {
              console.log("[Frontend] Hardware NFC Tap detected via Agent!");
              simulateNfcTap("visa");
            }
          }
        } catch (e) {
          // Agent not running — ignore
        }
      };

      const interval = setInterval(pollNfc, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, selectedPaymentMethod, paymentStep, isProcessingPayment, isNfcBlocked]);

  return {
    // State
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentStep,
    isOmiseLoaded,
    setIsOmiseLoaded,
    realQrCode,
    currentChargeId,
    isProcessingPayment,
    paymentCountdown,
    setPaymentCountdown,
    isCancelPaymentConfirmOpen,
    isNfcBlocked,
    // Actions
    handleCheckout,
    attemptClosePaymentModal,
    confirmCancelPayment,
    cancelAndClosePaymentModal,
    dismissCancelPaymentConfirm,
    closePaymentModal,
    handleDirectPromptPay,
    handleDirectTrueMoney,
    handleProceedToTap,
    handleSimulateNfcTap,
    simulatePromptPaySuccess,
  };
}
