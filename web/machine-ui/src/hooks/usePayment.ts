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
  getPublicAgentBaseUrl,
  getPublicApiUrl,
} from "../constants";

interface UsePaymentOptions {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  cart: CartItem[]; // รายการของในตะกร้า
  payableTotal: number; // ราคาสุทธิที่รวมส่วนลดแล้ว
  appliedCoupon: AppliedCoupon | null; // คูปองที่ใช้
  machineCode: string; // รหัสของตู้กดสินค้า
  onPaymentSuccess: () => void; // ฟังก์ชันทำงานเมื่อชำระเงินเรียบร้อย
}

/**
 * usePayment Hook
 * - จัดการระบบจ่ายเงินชำระสินค้าของตู้กดอาหารทั้งหมด
 * รองรับ:
 *  - สร้างรายการสั่งซื้อชั่วคราว (Create Draft Order)
 *  - ชำระเงินผ่านระบบ Omise API (PromptPay, Credit Card Tokenization)
 *  - ชำระเงินผ่าน TrueMoney Wallet
 *  - จำลองแตะบัตรเครดิตผ่าน NFC (Hardware / Virtual Simulator)
 *  - ระบบสืบค้นเช็คผลการชำระเงินเรียลไทม์ (Polling Status)
 *  - ระบบควบคุมเวลาหมดเขตการทำธุรกรรม (Payment Timeout Countdown)
 */
export function usePayment({
  activeModal,
  setActiveModal,
  cart,
  payableTotal,
  appliedCoupon,
  machineCode,
  onPaymentSuccess,
}: UsePaymentOptions) {
  // STATE
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null); // ช่องทางจ่ายเงินที่ลูกค้าเลือก
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1); // สเตปการชำระเงิน: 1 = หน้าเลือกช่องทาง, 2 = หน้าแสดงผลคิวอาร์โค้ด / แตะบัตร
  const [isOmiseLoaded, setIsOmiseLoaded] = useState(false); // ตรวจจับว่าไลบรารีสคริปต์ Omise.js โหลดเข้าหน้าจอสำเร็จแล้วหรือยัง
  const [realQrCode, setRealQrCode] = useState<string | null>(null); // ข้อความ Base64 หรือลิงก์สำหรับสร้างภาพ QR Code จ่ายเงินจริง
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null); // รหัสหมายเลขอ้างอิงบิลจ่ายเงิน (Charge ID จาก Omise หรือ Draft ID จากระบบตู้)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // สถานะว่าระบบกำลังทำรายการชำระเงินค้างอยู่ ป้องกันผู้ใช้กดย้ำซ้ำๆ
  const [paymentCountdown, setPaymentCountdown] = useState<number>(PAYMENT_COUNTDOWN_SECONDS); // เวลานับถอยหลังหมดอายุบิลการทำรายการชำระเงิน
  const [isCancelPaymentConfirmOpen, setIsCancelPaymentConfirmOpen] = useState(false);
  const [isNfcBlocked, setIsNfcBlocked] = useState(false); // บล็อกการกดแตะบัตรชั่วคราวเพื่อกันระบบ Omise ทำงานซ้ำซ้อน
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null); // ข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการชำระเงิน

  // REFS
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // เก็บตัวแปร Interval สำหรับเรียกตรวจสอบสถานะเงินแบบวนรอบ
  const currentChargeIdRef = useRef<string | null>(null); // เก็บประวัติ Charge ID ปัจจุบัน ป้องกันการปิดการทำงานช้าแล้วข้อมูลเก่าหาย
  const nfcBlockTimerRef = useRef<NodeJS.Timeout | null>(null); // ตัวแปรเคลียร์เวลาล็อกแตะบัตรเครดิต

  // คัดลอกค่าล่าสุดลงสู่ Refs เพื่อไม่เกิดบั๊กข้อมูลแช่แข็งค้างคืนภายในตัวทำงาน setInterval
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

  // ซิงค์ ID ธุรกรรมเข้าสู่ Ref เสมอเมื่อเปลี่ยนค่า State
  useEffect(() => {
    currentChargeIdRef.current = currentChargeId;
  }, [currentChargeId]);

  // ล้างตัวยืนยันการยกเลิกอัตโนมัติหากออกจากโมดอล หรือย้อนกลับไปหน้าเลือกช่องทางชำระ (สเตป 1)
  useEffect(() => {
    if (activeModal !== "payment" || paymentStep === 1) {
      setIsCancelPaymentConfirmOpen(false);
    }
  }, [activeModal, paymentStep]);

  // CORE FUNCTIONS
  // - เคลียร์ค่าสถานะจ่ายเงินทั้งหมด และสั่งปิดโมดอลชำระเงินแบบปกติ
  const closePaymentModal = () => {
    setActiveModal("none");
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
    setRealQrCode(null);
    setCurrentChargeId(null);
    setPaymentErrorMsg(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // - สั่งยกเลิกธุรกรรมการชำระเงินที่ค้างคาไปยัง API และปิดหน้าจอ
  // - ช่วยเคลียร์คิวสต็อกสินค้าที่ตู้ล็อคไว้ให้เพื่อนสมาชิกลูกค้าคนถัดไปมาใช้ต่อได้ทันที
  const cancelAndClosePaymentModal = async () => {
    const chargeIdToCancel = currentChargeIdRef.current;
    if (chargeIdToCancel) {
      try {
        const apiUrl = getPublicApiUrl();
        // ยิงแจ้งเตือนหลังตู้เพื่อให้ยกเลิกการกักตุนสต็อกสินค้าในคิว
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

  // NFC ARM/DISARM (Hardware reader)
  // - Arm only while the UI is actively waiting for a card tap (card + step 2).
  // - Bind the tap to the current draft_id to prevent stale taps from paying the next order.
  useEffect(() => {
    const shouldArm =
      activeModal === "payment" &&
      selectedPaymentMethod === "card" &&
      paymentStep === 2;

    const draftId = currentChargeIdRef.current;
    const agentBase = getPublicAgentBaseUrl();
    if (!shouldArm || !draftId) return;

    const arm = async () => {
      try {
        const res = await fetch(`${agentBase}/nfc/arm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_id: draftId, ttl_ms: PAYMENT_COUNTDOWN_SECONDS * 1000 }),
        });
        if (res.ok) {
          console.log(`[NFC] armed for ${String(draftId).slice(0, 12)}…`);
        } else {
          console.warn("[NFC] arm failed:", res.status);
        }
      } catch {
        // ignore — if agent isn't reachable, polling will just never detect taps
        console.warn("[NFC] arm failed: agent unreachable");
      }
    };
    void arm();

    return () => {
      // Best-effort disarm to clear pending tap when leaving the screen.
      void fetch(`${agentBase}/nfc/disarm`, { method: "POST" })
        .then((r) => {
          if (r.ok) console.log("[NFC] disarmed");
        })
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, selectedPaymentMethod, paymentStep]);

  // - จัดการเมื่อผู้ใช้กดปุ่มกากบาทหรือกดปิดหน้าชำระเงิน
  // - หากสแกน QR ค้างอยู่ (สเตป 2) จะเปิดหน้าต่างถามยืนยันยกเลิก
  // - เพื่อป้องกันลูกค้ากดปิดโดยไม่ตั้งใจ
  const attemptClosePaymentModal = () => {
    if (paymentStep === 2) {
      setIsCancelPaymentConfirmOpen(true);
      return;
    }
    cancelAndClosePaymentModal();
  };

  // - ยืนยันยกเลิกและปิดหน้าระบบการชำระเงินจริง
  const confirmCancelPayment = async () => {
    setIsCancelPaymentConfirmOpen(false);
    await cancelAndClosePaymentModal();
  };

  // - ซ่อนหน้ายืนยันยกเลิกกลับเข้าสู่การสแกน QR ต่อไป
  const dismissCancelPaymentConfirm = () => {
    setIsCancelPaymentConfirmOpen(false);
  };

  // - เคลียร์ Loop การเช็คและส่งต่อสัญญาณเข้าสู่ฟังก์ชันออเดอร์พร้อมอุ่นอาหาร
  const handlePaymentSuccessInternal = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setRealQrCode(null);
    onPaymentSuccessRef.current(); // เรียก Callback จบงานเข้าสู่ขั้นสะสมแต้มและสลับหน้าจออุ่น
  };

  // PAYMENT API LOGIC
  // - ดำเนินการชำระเงินโดยส่งข้อมูลบิลที่หักจากผู้ใช้ไปยังเซิร์ฟเวอร์
  const processPayment = async (paymentData: {
    type: "token" | "source" | "truemoney";
    id: string; // Token ID จาก Omise API
    amount: number; // ยอดรวมเงิน (สตางค์)
  }) => {
    if (isProcessingPaymentRef.current) return;
    setIsProcessingPayment(true);
    setPaymentErrorMsg(null);
    
    const controller = new AbortController();
    const timeoutMs = PAYMENT_TIMEOUT_MS; // ตัดจบหากเชื่อมต่อยาวเกินกำหนด
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const apiUrl = getPublicApiUrl();
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
          // หากสร้าง Draft Order ไว้ก่อน (แตะบัตรเครดิต) ให้ส่ง Draft ID ตัวเดิมไปเปลี่ยนสเตตัสป้องกันบิลซ้ำซ้อน
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
        // กรณีคิวอาร์โค้ดสแกนจ่ายเงินสำเร็จ
        setRealQrCode(result.qr_code);
        setPaymentStep(2);
        pollPaymentStatus(result.charge_id);
      } else {
        // กรณีชำระผ่านบัตรเครดิตเสร็จสิ้นสมบูรณ์ทันทีโดยไม่สแกน
        handlePaymentSuccessInternal();
      }
    } catch (err: any) {
      console.error("[Frontend] CRITICAL: Payment Process Failed", {
        message: err.message,
        name: err.name,
        elapsedMs: Date.now() - startedAt,
      });

      if (err.name === "AbortError") {
        setPaymentErrorMsg(
          `ระบบเชื่อมต่อล่าช้า กรุณาลองใหม่อีกครั้ง (Timeout ${Math.round(timeoutMs / 1000)}s)`,
        );
      } else {
        setPaymentErrorMsg(`เกิดข้อผิดพลาด: ${err.message}`);
      }

      // ระบบช่วยเหลือ: หากจ่ายเงินล้มเหลวสุดขีด ให้รีเซ็ตกลับหน้าจอหลักใน 3 วินาทีเพื่อไม่ให้ตู้กดอาหารจอนิ่งค้าง
      setTimeout(() => {
        cancelAndClosePaymentModal();
      }, 3000);
    } finally {
      clearTimeout(timeoutId);
      setIsProcessingPayment(false);
    }
  };

  // - สอบถามตรวจสอบสถานะการชำระเงินออเดอร์นี้เป็นระยะๆ (Polling Loop)
  const pollPaymentStatus = (chargeId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const apiUrl = getPublicApiUrl();
    console.log(`[Frontend] Starting poll for charge: ${chargeId}`);

    let attempts = 0; // รอบการทำงานปัจจุบัน
    let inFlight = false; // ป้องกันการเรียก API ซ้ำซ้อนก่อนที่รอบเก่าจะตอบกลับเสร็จสิ้น
    let stopped = false; // ตัวควบคุมจบตัววนซ้ำ

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
      
      // กรณีใช้จำนวนรอบในการตรวจสอบการจ่ายเงินจนเกินขีดจำกัด -> สั่งยกเลิกบิล
      if (attempts > PAYMENT_POLL_MAX_ATTEMPTS) {
        console.warn(
          `[Frontend] Poll timeout after ${PAYMENT_POLL_MAX_ATTEMPTS} attempts — auto-cancelling`,
        );
        stopPolling();
        setPaymentErrorMsg("หมดเวลาการทำรายการชำระเงิน กรุณาลองใหม่อีกครั้ง");
        setTimeout(async () => {
          await cancelAndClosePaymentModal();
        }, 3000);
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
          
          // ตรวจสอบว่าสเตตัสได้รับการยืนยันการจ่ายเงินเรียบร้อยแล้วหรือไม่
          if (st === "paid" || st === "dispensing" || st === "completed") {
            console.log("[Frontend] Payment confirmed via polling!");
            stopPolling();
            handlePaymentSuccessInternal();
            return;
          }
          
          // ตรวจสอบหากยอดชำระล้มเหลว หรือมีการขอคืนเงินกะทันหัน หรือสินค้าขัดข้อง
          if (
            st === "dispense_failed" ||
            st === "refunded" ||
            st === "cancelled" ||
            st === "canceled" ||
            st === "payment_failed" ||
            st === "failed"
          ) {
            stopPolling();
            setPaymentErrorMsg(
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
    // ทำงานตรวจสอบซ้ำทุกๆ 1 วินาที
    pollingIntervalRef.current = setInterval(
      () => void tick(),
      PAYMENT_POLL_INTERVAL_MS,
    );
  };

  // PAYMENT METHOD HANDLERS (จัดการปุ่มกดเลือกช่องทางต่างๆ)
  // - สร้างบิลและรับคิวอาร์โค้ด PromptPay จ่ายเงินสดผ่าน Omise.js SDK
  const handleDirectPromptPay = async () => {
    if (!(window as any).Omise) {
      setPaymentErrorMsg("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    const amount = Math.round(payableTotalRef.current * 100); // แปลงมูลค่าไปเป็นหน่วยสตางค์
    
    // เรียก API ของ Omise เพื่อรับสิทธิ์เชื่อมโยง PromptPay
    Omise.createSource(
      "promptpay",
      { amount, currency: "THB" },
      async (statusCode: number, response: any) => {
        if (statusCode !== 200) {
          console.error("Omise Source Error:", response);
          setPaymentErrorMsg("ไม่สามารถสร้างรายการ PromptPay ได้");
          return;
        }
        const sourceId = response.id;
        setPaymentStep(2);
        processPayment({ type: "source", id: sourceId, amount });
      },
    );
  };

  // - จัดเตรียมสเปกของคิวอาร์สำหรับช่องทาง TrueMoney Wallet
  const handleDirectTrueMoney = async () => {
    setPaymentStep(2);
    setRealQrCode(null);
    processPayment({
      type: "truemoney",
      id: "",
      amount: Math.round(payableTotalRef.current * 100),
    });
  };

  // - นำผู้ใช้สลับเข้าสู่ขั้นตอนเตรียมแตะบัตรจ่ายเงิน (NFC Card Reader Mode)
  // - ทำการจองสินค้าชั่วคราว (Create Draft Order ใน DB)
  const handleProceedToTap = async () => {
    setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
    setPaymentStep(2);

    try {
      const apiUrl = getPublicApiUrl();
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
        setCurrentChargeId(data.charge_id); // บันทึกบิลฉบับร่าง (Draft ID)
      }
    } catch (err) {
      console.error("[Frontend] Error creating draft order:", err);
    }
  };

  // - ฟังก์ชันจำลองการแตะบัตรเครดิตที่หน้าตู้ (NFC simulation)
  // - จะทำการจำลองแปลงข้อมูลบัตรเครดิตไปเป็น Token ของ Omise API
  const simulateNfcTap = async (brand: TestCardBrand) => {
    if (!(window as any).Omise) {
      setPaymentErrorMsg("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    console.log(
      `[Frontend] Simulating Card Tap (${brand}): Generating Omise Token...`,
    );

    // ดึงค่าหมายเลขบัตรทดสอบที่ระบุ (เช่น Visa, Mastercard)
    const cardData = {
      name: TEST_CARDS[brand].name,
      number: TEST_CARDS[brand].number,
      expiration_month: 12,
      expiration_year: 2029,
      security_code: "123",
    };

    // ส่งชุดข้อมูลจำลองเพื่อรับ Token ID สำหรับตัดบัตรอย่างถูกต้องและปลอดภัย
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
          setPaymentErrorMsg(`Tokenization Error: ${response.message || "Unknown error"}`);
          setTimeout(() => {
            cancelAndClosePaymentModal();
          }, 2000);
        }
      },
    );
  };

  // - แผงครอบปุ่มกดแตะบัตรเครดิตบน UI หน้าจอทดสอบ
  // - มีกลไกป้องกันบั๊กแตะบัตรซ้ำๆ ถี่เกินไป (Rate Limiting)
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

  // - ฟังก์ชันจำลองการชำระเงินโอนเงินแบบ QR PromptPay สำเร็จ
  const simulatePromptPaySuccess = async () => {
    if (!currentChargeIdRef.current) return;
    try {
      const apiUrl = getPublicApiUrl();
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

  // - ล้างประวัติต่างๆ และสั่งเริ่มต้นระบบจ่ายเงินจากหน้าหลัก
  const handleCheckout = () => {
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
    setRealQrCode(null);
    setCurrentChargeId(null);
    setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
    setActiveModal("payment");
  };

  // TIMERS & EFFECTS (ระบบเวลาหมดอายุธุรกรรม)
  // Timer: ทำหน้าที่หักคะแนนเวลานับถอยหลังของหน้าจอชำระเงินในทุกๆ วินาที
  useEffect(() => {
    if (activeModal !== "payment") return;
    const timer = setInterval(() => {
      setPaymentCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  // ตรวจจับเมื่อเวลากรอกชำระเงินลดลงเป็น 0 วินาที -> ยกเลิกและปิดหน้าต่างอัตโนมัติป้องกันยอดบิลค้างคา
  useEffect(() => {
    if (activeModal === "payment" && paymentCountdown === 0) {
      setTimeout(() => {
        void cancelAndClosePaymentModal();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, paymentCountdown]);

  // NFC Keyboard Listener
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
        // หากลูกค้าไม่ได้พิมพ์ติดต่อกันใน 100ms ให้ถือว่าเป็นข้อความขยะชุดใหม่
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

  // Polling สำหรับ Hardware NFC Tap (ตัววนเช็คสัญญาณบัตรจาก Python Agent เซ็นเซอร์เครื่องจริง)
  useEffect(() => {
    if (
      activeModal === "payment" &&
      selectedPaymentMethod === "card" &&
      paymentStep === 2
    ) {
      const pollNfc = async () => {
        if (isProcessingPayment || isNfcBlocked) return;
        try {
          const draftId = currentChargeIdRef.current;
          if (!draftId) return;
          // ดึงสถานะการแตะบัตรจาก Python Agent (ผูกกับ draft_id ปัจจุบัน)
          const res = await fetch(
            `${getPublicAgentBaseUrl()}/nfc/status?draft_id=${encodeURIComponent(draftId)}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === "tapped") {
              console.log(`[NFC] tapped for ${String(draftId).slice(0, 12)}…`);
              simulateNfcTap("visa");
            }
          }
        } catch (e) {
          // หากไม่พบ Agent เครื่องเชื่อมอยู่ ให้ปล่อยผ่าน
        }
      };

      const interval = setInterval(pollNfc, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, selectedPaymentMethod, paymentStep, isProcessingPayment, isNfcBlocked]);

  return {
    // States
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
    paymentErrorMsg,
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

