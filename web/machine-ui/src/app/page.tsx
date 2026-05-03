"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductCard, { Product } from "../components/ProductCard";
import CartSidebar, { CartItem } from "../components/CartSidebar";
import Image from "next/image";
import Script from "next/script";
import "./globals.css";
import { BanknoteArrowUp, Check, CreditCard, Nfc, PackageOpen, PhoneCall, ScanLine, Smartphone, SquareDashedMousePointer, } from "lucide-react";
import { useJobSocket, AgentJobState } from "../hooks/useJobSocket";

type ModalType =
  | "none"
  | "info"
  | "usage"
  | "numpad"
  | "contact"
  | "payment"
  | "processing"
  | "points_result"
  | "limit_warning";
type PaymentMethod = "promptpay" | "visa" | "unionpay" | "mastercard";
const PROCESS_STEPS = [
  "กำลังนำเข้าเตาอุ่น",
  "กำลังอุ่น",
  "กำลังเสิร์ฟ",
  "พร้อมทาน",
];



// สไตล์ปุ่ม Test เพื่อลดความซ้ำซ้อนใน JSX
const testBtnStyle: React.CSSProperties = {
  padding: "10px",
  background: "#22c55e",
  color: "white",
  borderRadius: "12px",
  width: "100%",
  fontWeight: "bold",
  fontSize: "18px",
  border: "none",
  cursor: "pointer",
};

export default function VendingPage() {
  // ==========================================
  // APPLICATION STATES
  // ==========================================
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  // -- Payment States --
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
  const [isOmiseLoaded, setIsOmiseLoaded] = useState(false); // เช็คว่า Omise โหลดเสร็จหรือยัง
  const [realQrCode, setRealQrCode] = useState<string | null>(null); // เก็บ QR Code จริงจาก Backend
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // ตัวแปรเก็บรอบการดึงสถานะจ่ายเงิน
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const currentChargeIdRef = useRef<string | null>(null); // เก็บค่าล่าสุดไว้ใช้ใน setInterval/setTimeout
  const [isCancelPaymentConfirmOpen, setIsCancelPaymentConfirmOpen] = useState(false);

  // -- Agent Job (Hardware) States --
  // These are now driven by the useJobSocket hook below (Socket.IO → Server)
  // instead of EventSource → local Agent SSE endpoint.

  // -- Flow & Queue States --
  const [isAfterPayment, setIsAfterPayment] = useState(false);
  const [queue, setQueue] = useState<Product[]>([]);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0); // เวลารวมทั้งหมด

  // -- Timers States --
  const [paymentCountdown, setPaymentCountdown] = useState<number>(180);
  const [pointsCountdown, setPointsCountdown] = useState<number>(10);
  const [numpadCountdown, setNumpadCountdown] = useState<number>(60);

  // -- Member / Points States --
  const [memberPoints, setMemberPoints] = useState<number | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [isNewMember, setIsNewMember] = useState<boolean>(false);
  const [isMemberLoading, setIsMemberLoading] = useState<boolean>(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const totalPriceRef = useRef<number>(0);

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

  const dismissCancelPaymentConfirm = () => {
    setIsCancelPaymentConfirmOpen(false);
  };

  useEffect(() => {
    if (activeModal !== "payment" || paymentStep === 1) {
      setIsCancelPaymentConfirmOpen(false);
    }
  }, [activeModal, paymentStep]);

  // Sync state to ref for timers
  useEffect(() => {
    currentChargeIdRef.current = currentChargeId;
  }, [currentChargeId]);

  // ==========================================
  // SOCKET.IO JOB STATE (replaces local Agent SSE)
  // ==========================================
  // Connect to Server Socket.IO and listen for job_event_broadcast events
  // in the machine's room — no direct connection to the local agent needed.
  const {
    agentJobState,
    agentCurrentItemIndex,
    globalTimeLeft: socketGlobalTimeLeft,
    isConnected: isServerSocketConnected,
  } = useJobSocket({
    activeJobId: (isAfterPayment || activeModal === "processing") ? currentChargeId : null,
  });

  // Sync socket-driven remaining time into local globalTimeLeft state
  // (fallback local timer still runs if socket has no data yet)
  useEffect(() => {
    if ((isAfterPayment || activeModal === "processing") && agentJobState) {
      setGlobalTimeLeft(socketGlobalTimeLeft);
    }
  }, [socketGlobalTimeLeft, activeModal, isAfterPayment, agentJobState]);

  // ==========================================
  // DERIVED DATA (คำนวณค่าจาก State อัตโนมัติ)
  // ==========================================
  const calculateTotalProcessTime = (q: Product[]) => {
    if (q.length === 0) return 0;
    const maxTime = Math.max(...q.map((it) => it.heatingTime));
    return maxTime + 3 * (q.length - 1);
  };

  const totalHeatingTime = calculateTotalProcessTime(
    cart.flatMap((item) => Array.from({ length: item.qty }, () => item))
  );
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalProcessTime = calculateTotalProcessTime(queue);

  // ฟังก์ชันหาว่าตอนนี้อยู่สเต็ปไหนของการอุ่น (Fallback UI)
  const getProcessStatus = () => {
    if (queue.length === 0) return { step: 0, itemIndex: 0 };
    if (globalTimeLeft === 0) return { step: 3, itemIndex: 0 };
    if (globalTimeLeft <= queue.length * 3) return { step: 2, itemIndex: queue.length - 1 };
    if (globalTimeLeft > totalProcessTime - 5) return { step: 0, itemIndex: 0 };
    return { step: 1, itemIndex: 0 };
  };

  const mapAgentStateToStep = (state: AgentJobState): number => {
    if (state === "TRANSFER_TO_OVEN") return 0;
    if (state === "HEATING") return 1;
    if (state === "DISPENSING") return 2;
    return 3; // DONE / ERROR
  };

  const fallbackStatus = getProcessStatus();
  const currentStep = agentJobState ? mapAgentStateToStep(agentJobState) : fallbackStatus.step;
  const currentItemIndex = agentJobState ? agentCurrentItemIndex : fallbackStatus.itemIndex;
  const isProcessCompleted = agentJobState
    ? agentJobState === "DONE" || agentJobState === "ERROR"
    : currentStep === 3;
  const isProcessSuccess = agentJobState ? agentJobState === "DONE" : currentStep === 3;
  const progressLineWidth = `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;

  // Fetch Products from Server
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/products?machine_code=MP1-001`,);
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        // Map DB fields to Frontend interface
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          desc: p.description,
          price: p.price,
          heatingTime: p.heating_time,
          image: p.image_url,
          category: p.category,
          stock: p.stock,
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // TIMERS (useEffect)
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
  }, [activeModal, paymentCountdown]);

  // Timer: นับถอยหลังการโชว์คะแนนสะสม
  useEffect(() => {
    if (activeModal !== "points_result") return;
    const timer = setInterval(() => {
      setPointsCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === "points_result" && pointsCountdown === 0) {
      if (isAfterPayment) {
        startHeatingProcess();
      } else {
        setActiveModal("none");
      }
    }
  }, [activeModal, pointsCountdown, isAfterPayment]);

  // Timer: นับถอยหลังหน้ารับเบอร์โทร (Numpad)
  useEffect(() => {
    if (activeModal !== "numpad") return;
    const timer = setInterval(() => {
      setNumpadCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === "numpad" && numpadCountdown === 0) {
      if (isAfterPayment) {
        startHeatingProcess();
      } else {
        setActiveModal("none");
      }
    }
  }, [activeModal, numpadCountdown, isAfterPayment]);

  // Timer: นับถอยหลังระบบอุ่นสินค้ารวม
  useEffect(() => {
    if (activeModal === "processing" && !agentJobState) {
      const interval = setInterval(() => {
        setGlobalTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeModal, agentJobState]);


  // ==========================================
  // PAYMENT API LOGIC
  // ==========================================
  const handlePaymentSuccess = () => {
    // ล้าง Interval ของการ Polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // ตั้งค่าคิวและตะกร้า
    const flatQueue = cart.flatMap((item) => Array(item.qty).fill(item));
    totalPriceRef.current = totalPrice; // Save total price for points
    setQueue(flatQueue);
    setCart([]);
    setRealQrCode(null);

    // ไปหน้าสะสมแต้ม
    setIsAfterPayment(true);
    setPhoneNumber("");
    setNumpadCountdown(60);
    setActiveModal("numpad");
  };

  const processPayment = async (paymentData: { type: "token" | "source"; id: string; amount: number; }) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    const controller = new AbortController();
    const timeoutMs = 60000;
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
          machine_code: "MP1-001",
          cart: cart.map((item) => ({ product_id: item.id, quantity: item.qty })),
          amount: paymentData.amount,
          payment_type: paymentData.type,
          payment_id: paymentData.id,
          draft_id: currentChargeId?.startsWith("draft_") ? currentChargeId : undefined,
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

      if (paymentData.type === "source" && result.qr_code) {
        setRealQrCode(result.qr_code);
        setPaymentStep(2);
        pollPaymentStatus(result.charge_id);
      } else {
        handlePaymentSuccess();
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
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    console.log(`[Frontend] Starting poll for charge: ${chargeId}`);

    // Max 60 attempts × 2s = 2 minutes, then auto-cancel
    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        console.warn(`[Frontend] Poll timeout after ${MAX_ATTEMPTS} attempts — auto-cancelling`);
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        await cancelAndClosePaymentModal();
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/buy/status/${chargeId}`);
        if (res.ok) {
          const data = await res.json();
          console.log(`[Frontend] Poll result for ${chargeId} [${attempts}/${MAX_ATTEMPTS}]:`, data.status);
          if (data.status === "PAID" || data.status === "paid") {
            console.log("[Frontend] Payment confirmed via polling!");
            handlePaymentSuccess();
          }
        } else {
          console.error(`[Frontend] Poll failed with status: ${res.status}`);
        }
      } catch (e) {
        console.error("[Frontend] Polling exception:", e);
      }
    }, 2000);
  };

  // --- ฟังก์ชันสร้าง QR Code ---
  const handleDirectPromptPay = async () => {
    if (!(window as any).Omise) {
      alert("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    // Create Source ID for PromptPay
    Omise.createSource(
      "promptpay",
      {
        amount: totalPrice * 100,
        currency: "THB",
      },
      async (statusCode: number, response: any) => {
        if (statusCode !== 200) {
          console.error("Omise Source Error:", response);
          alert("ไม่สามารถสร้างรายการ PromptPay ได้");
          return;
        }

        const sourceId = response.id;

        // Send sourceId to Backend
        setPaymentStep(2);
        processPayment({ type: "source", id: sourceId, amount: totalPrice * 100 });
      },
    );
  };

  const handleProceedToTap = async () => {
    setPaymentCountdown(180);
    setPaymentStep(2);

    // สร้าง Draft Order ใน Database เพื่อให้มีสถานะ "รอจ่าย" โผล่ขึ้นมาในระบบ
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/buy/create-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_code: "MP1-001",
          cart: cart.map((item) => ({ product_id: item.id, quantity: item.qty })),
          amount: totalPrice * 100,
          payment_method: "credit_card",
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

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  // Cart Actions
  const MAX_CART_ITEMS = 4;

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const totalItems = prevCart.reduce((sum, item) => sum + item.qty, 0);
      if (totalItems >= MAX_CART_ITEMS) {
        setActiveModal("limit_warning");
        return prevCart;
      }
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const handleIncrease = (productId: number) => {
    setCart((prevCart) => {
      const totalItems = prevCart.reduce((sum, item) => sum + item.qty, 0);
      if (totalItems >= MAX_CART_ITEMS) {
        setActiveModal("limit_warning");
        return prevCart;
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      );
    });
  };
  const handleDecrease = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, item.qty - 1) }
          : item,
      ),
    );
  };
  const handleRemove = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Modal Actions
  const handleCheckout = () => {
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
    setRealQrCode(null);
    setCurrentChargeId(null);

    // ตั้งเวลาและเปิด Modal
    setPaymentCountdown(180);
    setActiveModal("payment");
  };
  const handleOpenNumpad = () => {
    setIsAfterPayment(false);
    setNumpadCountdown(60);
    setActiveModal("numpad");
    setPhoneNumber("");
  };
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

  // Phone Handlers
  const handleNumberClick = (num: string) => {
    if (phoneNumber.length < 10) setPhoneNumber((prev) => prev + num);
  };
  const handleDeleteClick = () => setPhoneNumber((prev) => prev.slice(0, -1));

  const handleConfirmPhone = async () => {
    if (phoneNumber.length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setIsMemberLoading(true);
    setMemberError(null);

    if (isAfterPayment) {
      try {
        const res = await fetch(`${apiUrl}/api/members/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber,
            total_price: totalPriceRef.current,
            charge_id: currentChargeId,
          }),
        });
        const data = await res.json();
        setEarnedPoints(data.points_earned ?? 0);
        setMemberPoints(data.total_points ?? 0);
        setIsNewMember(data.is_new_member ?? false);
        setPointsCountdown(10);
        setActiveModal("points_result");
      } catch (err) {
        console.error("Earn points error:", err);
        startHeatingProcess();
      } finally {
        setIsMemberLoading(false);
      }
    } else {
      try {
        const res = await fetch(`${apiUrl}/api/members/${phoneNumber}`);
        if (res.status === 404) {
          setMemberError("ไม่พบข้อมูลสมาชิก กรุณาลงทะเบียนหลังจากซื้อสินค้า");
          setMemberPoints(null);
          setEarnedPoints(0);
          setIsNewMember(false);
          setPointsCountdown(10);
          setActiveModal("points_result");
        } else if (res.ok) {
          const data = await res.json();
          setMemberPoints(data.points);
          setEarnedPoints(0);
          setIsNewMember(false);
          setMemberError(null);
          setPointsCountdown(10);
          setActiveModal("points_result");
        } else {
          alert("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
        }
      } catch (err) {
        console.error("Lookup error:", err);
        alert("ไม่สามารถเชื่อมต่อกับระบบได้");
      } finally {
        setIsMemberLoading(false);
      }
    }
  };

  const displayFormattedPhone = () => {
    if (!phoneNumber) return "xxx-xxxxxxx";
    if (phoneNumber.length > 3) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    return phoneNumber;
  };

  // Flow Actions
  const simulatePromptPaySuccess = async () => {
    if (!currentChargeId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/buy/mock-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charge_id: currentChargeId }),
      });
    } catch (err) {
      console.error("Mock Pay Error:", err);
      handlePaymentSuccess();
    }
  };
  // --- 💡 ฟังก์ชันจำลองการแตะบัตรที่เครื่องอ่าน NFC ---
  const simulateNfcTap = async () => {
    if (!(window as any).Omise) {
      alert("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);

    console.log("[Frontend] Simulating Card Tap: Generating Omise Token...");

    const cardData = {
      name: "Test Visa Machine",
      number: "4242424242424242",
      expiration_month: 12,
      expiration_year: 2029,
      security_code: "123",
    };

    Omise.createToken("card", cardData, async (statusCode: number, response: any) => {
      if (statusCode === 200) {
        console.log("[Frontend] Test Token Generated:", response.id);
        // Step 2: Send token to Backend for real charge execution
        processPayment({
          type: "token",
          id: response.id,
          amount: totalPrice * 100,
        });
      } else {
        console.error("[Frontend] Omise Tokenization Failed:", response);
        alert(`Tokenization Error: ${response.message || "Unknown error"}`);

        // Reset UI on failure
        setTimeout(() => {
          cancelAndClosePaymentModal();
        }, 2000);
      }
    });
  };

  const startHeatingProcess = () => {
    // คำนวณเวลาและเริ่มหน้าจอ Processing
    if (!agentJobState) {
      const totalProcessTime = calculateTotalProcessTime(queue);
      setGlobalTimeLeft(totalProcessTime);
    }
    setIsAfterPayment(false);
    setActiveModal("processing");
  };

  return (
    <div className="vending-app">
      <Script
        src="https://cdn.omise.co/omise.js"
        onLoad={() => setIsOmiseLoaded(true)}
      />
      {/* --- ฝั่งซ้าย: โซนเลือกสินค้า --- */}
      <div className="main-content">
        <div className="header">
          <span>
            M
            <Image
              src="/Logo_modpao.png"
              alt="Logo ModPao"
              width={70}
              height={70}
              className="logo-image"
              priority
            />
            D.PAO
          </span>
        </div>

        <div className="product-container">
          {isLoadingProducts ? (
            <div className="loading-state">กำลังโหลดสินค้า...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAdd={() => handleAddToCart(product)}
              />
            ))
          ) : (
            <div className="error-state">ไม่พบสินค้าที่พร้อมจำหน่าย</div>
          )}
        </div>

        <div className="device-id">
          <div className="status-dot"></div>ID:MP1-001
        </div>
      </div>

      {/* --- ฝั่งขวา: ตะกร้าสินค้า --- */}
      <CartSidebar
        cart={cart}
        totalHeatingTime={totalHeatingTime}
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
        onOpenInfo={() => setActiveModal("info")}
        onOpenContact={() => setActiveModal("contact")}
      />

      {/* --- OVERLAY & MODALS --- */}
      {activeModal !== "none" && (
        <div
          className="modal-overlay"
          onClick={
            activeModal === "payment"
              ? () => {
                if (paymentStep === 1) {
                  cancelAndClosePaymentModal();
                }
              }
              : () => setActiveModal("none")
          }
        >
          {/* Modal 1: เมนู Info */}
          {activeModal === "info" && (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal("none")}
              >
                &times;
              </button>
              <button
                className="modal-action-btn"
                onClick={() => setActiveModal("usage")}
              >
                วิธีการใช้งาน
              </button>
              <button className="modal-action-btn" onClick={handleOpenNumpad}>
                ตรวจสอบคะแนน
              </button>
              <button
                className="modal-action-btn"
                onClick={() => setActiveModal("contact")}
              >
                รายงานปัญหา
              </button>
            </div>
          )}

          {/* Modal 2: วิธีการใช้งาน */}
          {activeModal === "usage" && (
            <div
              className="usage-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal("none")}
              >
                &times;
              </button>
              {/* หัวข้อ */}
              <div className="modal-title">วิธีการใช้งาน</div>
              <div className="usage-list">
                <div className="usage-item">
                  <span className="usage-number">1.</span>
                  <div className="usage-icon-placeholder">
                    <SquareDashedMousePointer />
                  </div>
                  <span className="usage-text">เลือกสินค้าที่ต้องการ</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">2.</span>
                  <div className="usage-icon-placeholder">
                    <CreditCard />
                  </div>
                  <span className="usage-text">เลือกช่องทางการชำระเงิน</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">3.</span>
                  <div className="usage-icon-placeholder">
                    <BanknoteArrowUp />
                  </div>
                  <span className="usage-text">ชำระเงินตามจำนวน</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">4.</span>
                  <div className="usage-icon-placeholder">
                    <PackageOpen />
                  </div>
                  <span className="usage-text">รับสินค้า</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal 3: Numpad (กรอกเบอร์โทร) */}
          {activeModal === "numpad" && (
            <div
              className="numpad-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ปุ่ม Timeout / Close ของ Numpad */}
              <button
                className="timeout-close-btn"
                onClick={
                  isAfterPayment
                    ? startHeatingProcess // ถ้าหลังจ่ายเงินให้ข้าม
                    : () => setActiveModal("none") // ถ้าก่อนจ่ายให้ปิด
                }
              >
                <span>{numpadCountdown}</span>
                <span className="points-close-icon">&times;</span>
              </button>
              <div className="numpad-title">
                {isAfterPayment
                  ? "กรุณากรอกเบอร์เพื่อสะสมแต้ม"
                  : "โปรดกรอกหมายเลขโทรศัพท์"}
              </div>
              {/* จอแสดงเบอร์โทร */}
              <div
                className="phone-display"
                style={{ opacity: phoneNumber ? 1 : 0.6 }}
              >
                {displayFormattedPhone()}
              </div>
              {/* แป้นพิมพ์ */}
              <div className="numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    className="numpad-btn"
                    onClick={() => handleNumberClick(num.toString())}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="numpad-btn action"
                  onClick={handleDeleteClick}
                >
                  DEL
                </button>
                <button
                  className="numpad-btn"
                  onClick={() => handleNumberClick("0")}
                >
                  0
                </button>
                <button
                  className="numpad-btn action"
                  onClick={handleConfirmPhone}
                  disabled={isMemberLoading}
                >
                  {isMemberLoading ? "..." : "OK"}
                </button>
              </div>
              {isAfterPayment && (
                <button
                  className="modal-back-btn"
                  onClick={startHeatingProcess}
                  style={{ textDecoration: "underline", marginTop: "10px" }}
                >
                  ไม่สะสมแต้ม ข้ามไปยังขั้นตอนการอุ่น
                </button>
              )}
            </div>
          )}

          {/* Modal 4: Points Result (แสดงคะแนนสะสม) */}
          {activeModal === "points_result" && (
            <div
              className="points-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="timeout-close-btn"
                onClick={
                  isAfterPayment
                    ? startHeatingProcess
                    : () => setActiveModal("none")
                }
              >
                <span>{pointsCountdown}</span>
                <span className="points-close-icon">&times;</span>
              </button>

              {memberError ? (
                <>
                  <div className="points-title" style={{ color: "#ef4444" }}>❌ ไม่พบสมาชิก</div>
                  <div className="points-disclaimer" style={{ marginTop: "16px", fontSize: "16px" }}>
                    {memberError}
                  </div>
                </>
              ) : (
                <>
                  {isNewMember && (
                    <div style={{
                      background: "linear-gradient(135deg, #f89025, #f59e0b)",
                      color: "white", borderRadius: "20px", padding: "6px 18px",
                      fontSize: "14px", fontWeight: "bold", marginBottom: "8px",
                    }}>
                      ✨ ยินดีต้อนรับสมาชิกใหม่!
                    </div>
                  )}
                  <div className="points-title">
                    {isAfterPayment ? "ได้รับแต้ม" : "คะแนนสะสมปัจจุบัน"}
                  </div>
                  {isAfterPayment && earnedPoints > 0 && (
                    <div style={{ color: "#22c55e", fontSize: "22px", fontWeight: "bold", marginBottom: "4px" }}>
                      +{earnedPoints} แต้ม
                    </div>
                  )}
                  <div className="points-value">{memberPoints ?? 0}</div>
                  <div className="points-unit">คะแนน</div>
                  <div className="points-disclaimer">
                    <strong>*คะแนนสามารถนำไปแลกเป็นส่วนลดหรือโปรโมชั่น*</strong>
                    <br />
                    ได้ทางเว็บไซต์ MODPAO.com
                  </div>
                </>
              )}
            </div>
          )}

          {/* Modal 5: Report (รายงานปัญหา) */}
          {activeModal === "contact" && (
            <div
              className="report-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal("none")}
              >
                &times;
              </button>
              <div className="report-title">ติดต่อเจ้าหน้าที่</div>
              {/* เบอร์โทรศัพท์ */}
              <div className="report-phone">
                <PhoneCall />
                02-123-4567
              </div>
              <div className="report-divider">หรือ</div>
              {/* โซน LINE สำหรับสแกนแจ้งปัญหา */}
              <div className="line-report-section">
                <div className="qr-placeholder">
                  {/* จำลอง QR Code ด้วย Icon Line และภาพตัวอย่าง */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        color: "#22c55e",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      LINE
                    </div>
                    <div style={{ fontSize: "10px" }}>SCAN ME</div>
                  </div>
                </div>
                <div className="line-id-text">ID: @MOD.PAO</div>
                <div className="scan-text">
                  สแกนเพื่อติดต่อเจ้าหน้าที่โดยตรง
                </div>
              </div>
            </div>
          )}

          {/* Modal 6 : Payment (ชำระเงิน) */}
          {/* --- Modal: แจ้งเตือนจำนวนสินค้าสูงสุด --- */}
          {activeModal === "limit_warning" && (
            <div className="modal-overlay" onClick={() => setActiveModal("none")}>
              <div
                className="points-modal-box"
                style={{
                  maxWidth: "400px",
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "white",
                  borderRadius: "32px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px"
                }}>
                  <PackageOpen size={40} color="#ef4444" />
                </div>
                
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#1f2937",
                  marginBottom: "12px"
                }}>
                  ตะกร้าเต็มแล้ว!
                </h2>
                
                <p style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  lineHeight: "1.6",
                  marginBottom: "32px"
                }}>
                  ขออภัยครับ 1 คำสั่งซื้อสามารถซื้อสินค้าได้สูงสุด {MAX_CART_ITEMS} ชิ้นเท่านั้น
                </p>

                <button
                  onClick={() => setActiveModal("none")}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "linear-gradient(135deg, #f89025, #f59e0b)",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  ตกลง
                </button>
              </div>
            </div>
          )}

          {activeModal === "payment" && (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button
                className="timeout-close-btn danger"
                onClick={() => {
                  attemptClosePaymentModal();
                }}
              >
                <span>{paymentCountdown}</span>
                <span style={{ fontSize: "28px", lineHeight: 1 }}>&times;</span>
              </button>
              <div className="payment-wrapper">
                {/* --- Step 0: เลือกช่องทางชำระเงิน --- */}
                {selectedPaymentMethod === null && (
                  <>
                    <div className="modal-title">โปรดเลือกวิธีการชำระเงิน</div>
                    <div className="modal-payment">
                      <button
                        className="modal-action-payment-btn"
                        onClick={() => {
                          setSelectedPaymentMethod("promptpay");
                        }}
                        disabled={!isOmiseLoaded}
                      >
                        <Image
                          className="payment-logo"
                          src="/PromptPay-logo.png"
                          alt="PromptPay"
                          width={150}
                          height={85}
                          priority
                        />
                      </button>
                      <button
                        className="modal-action-payment-btn"
                        onClick={() => {
                          setSelectedPaymentMethod("visa");
                        }}
                        disabled={!isOmiseLoaded}
                      >
                        <Image
                          src="/Visa-logo.png"
                          alt="Visa"
                          width={150}
                          height={65}
                          priority
                        />
                      </button>
                      <button
                        className="modal-action-payment-btn"
                        onClick={() => {
                          setSelectedPaymentMethod("unionpay");
                        }}
                        disabled={!isOmiseLoaded}
                      >
                        <Image
                          src="/UnionPay-logo.png"
                          alt="UnionPay"
                          width={140}
                          height={80}
                          priority
                        />
                      </button>
                      <button
                        className="modal-action-payment-btn"
                        onClick={() => {
                          setSelectedPaymentMethod("mastercard");
                        }}
                        disabled={!isOmiseLoaded}
                      >
                        <Image
                          src="/Mastercard-logo.png"
                          alt="Mastercard"
                          width={110}
                          height={80}
                          priority
                        />
                      </button>
                    </div>
                  </>
                )}

                {/* --- Flow A: PromptPay --- */}
                {selectedPaymentMethod === "promptpay" && (
                  <>
                    <div className="payment-title">ชำระเงินด้วย PromptPay</div>
                    {/* Step 1: แนะนำ */}
                    {paymentStep === 1 && (
                      <>
                        <div className="payment-instruction-list">
                          <p>
                            <Smartphone size={20} color="#f89025" /> 1.
                            เปิดแอปพลิเคชันธนาคารของคุณ
                          </p>
                          <p>
                            <ScanLine size={20} color="#f89025" /> 2. เลือกเมนู
                            "สแกน QR Code"
                          </p>
                          <p>
                            <BanknoteArrowUp size={20} color="#f89025" /> 3.
                            สแกนเพื่อชำระเงินในหน้าถัดไป
                          </p>
                        </div>
                        <button
                          className="modal-confirm-btn"
                          onClick={() => {
                            setPaymentCountdown(180);
                            handleDirectPromptPay();
                          }}
                        >
                          รับทราบ และแสดง QR Code
                        </button>
                      </>
                    )}
                    {/* Step 2: แสดง QR Code เปล่าๆ */}
                    {paymentStep === 2 && (
                      <>
                        {realQrCode ? (
                          <img
                            src={realQrCode}
                            alt="PromptPay QR"
                            width={200}
                            height={200}
                            style={{ borderRadius: "12px" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 200,
                              height: 200,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f1f5f9",
                              borderRadius: "12px",
                              color: "#64748b",
                            }}
                          >
                            กำลังสร้าง QR Code...
                          </div>
                        )}
                        <button
                          style={testBtnStyle}
                          onClick={simulatePromptPaySuccess}
                        >
                          [Test] จำลองโอนเงินสำเร็จ
                        </button>
                      </>
                    )}
                  </>
                )}
                {/* --- Flow B: บัตรเครดิต (Visa, UnionPay, Mastercard) --- */}
                {selectedPaymentMethod !== null &&
                  selectedPaymentMethod !== "promptpay" && (
                    <>
                      <div className="payment-title">
                        ชำระเงินด้วย {selectedPaymentMethod.toUpperCase()}
                      </div>
                      {/* Step 1: แนะนำ */}
                      {paymentStep === 1 && (
                        <>
                          <div className="payment-instruction-list">
                            <p>
                              <CreditCard size={20} color="#f89025" /> 1.
                              เตรียมบัตรของคุณให้พร้อม
                            </p>
                            <p>
                              <Nfc size={20} color="#f89025" /> 2.
                              แตะบัตรที่เครื่องรับชำระเงินด้านล่างหน้าจอ
                            </p>
                            <p>
                              <BanknoteArrowUp size={20} color="#f89025" /> 3.
                              รอสัญญาณเสียงเพื่อเสร็จสิ้นรายการ
                            </p>
                          </div>
                          <button
                            className="modal-confirm-btn"
                            onClick={handleProceedToTap}
                          >
                            ดำเนินการแตะบัตร
                          </button>
                        </>
                      )}

                      {/* Step 2: แอนิเมชันรอแตะบัตร */}
                      {paymentStep === 2 && (
                        <>
                          <div className="nfc-pulse-container">
                            <div className="nfc-icon-wrapper">
                              <Nfc size={64} strokeWidth={1.5} />
                            </div>
                          </div>
                          <h3 style={{ color: "#f89025", marginBottom: "5px" }}>
                            กำลังรอการแตะบัตร...
                          </h3>
                          <p style={{ color: "#64748b", fontSize: "14px" }}>
                            กรุณานำบัตรมาแตะที่เครื่องอ่านด้านล่าง
                          </p>
                          {/* กดเพื่อจำลองการแตะบัตร NFC */}
                          <button 
                            style={{...testBtnStyle, opacity: isProcessingPayment ? 0.5 : 1}} 
                            onClick={simulateNfcTap}
                            disabled={isProcessingPayment}
                          >
                            {isProcessingPayment ? "กำลังประมวลผล..." : "[Test] Simulate Visa Tap"}
                          </button>
                        </>
                      )}
                    </>
                  )}

                {/* ปุ่มย้อนกลับ */}
                {selectedPaymentMethod !== null && paymentStep === 1 && (
                  <button
                    className="modal-back-btn"
                    onClick={() => {
                      setSelectedPaymentMethod(null);
                    }}
                  >
                    เปลี่ยนช่องทางการชำระเงิน
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PaymentConfirmOpenModal */}
          {activeModal === "payment" && isCancelPaymentConfirmOpen && (
            <div
              className="confirm-overlay"
              onClick={(e) => {
                e.stopPropagation();
                dismissCancelPaymentConfirm();
              }}
            >
              <div
                className="confirm-modal-box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="confirm-title">ยืนยันการยกเลิก</div>
                <div className="confirm-desc">
                  ต้องการยกเลิกการชำระเงินและกลับไปหน้าเลือกสินค้าใช่หรือไม่?
                </div>
                <div className="confirm-actions">
                  <button
                    className="confirm-btn modal-action-btn"
                    onClick={dismissCancelPaymentConfirm}
                  >
                    กลับไปชำระเงิน
                  </button>
                  <button
                    className="confirm-btn danger"
                    onClick={confirmCancelPayment}
                  >
                    ยกเลิกการชำระเงิน
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 7: Processing (หน้าจอรอรับสินค้า) */}
          {activeModal === "processing" && (
            <div
              className="processing-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ส่วนหัว */}
              <div
                className={`processing-header ${isProcessSuccess ? "success-theme" : ""}`}
              >
                <div className="processing-title">
                  {isProcessSuccess
                    ? "ทานให้อร่อยนะครับ!"
                    : "กรุณารอสักครู่..."}
                </div>
                <div className="processing-subtitle">
                  {isProcessSuccess
                    ? "🎉 สินค้าของคุณพร้อมแล้ว!"
                    : PROCESS_STEPS[currentStep]}
                </div>
              </div>

              {/* ส่วนกลาง */}
              <div className="processing-center-area">
                {currentStep < 3 && (
                  <div className="countdown-timer">
                    {globalTimeLeft >= 60 ? (
                      <>
                        {Math.floor(globalTimeLeft / 60)}:
                        {String(globalTimeLeft % 60).padStart(2, "0")}
                        <span className="countdown-label">นาทีที่เหลือ</span>
                      </>
                    ) : (
                      <>
                        {globalTimeLeft}
                        <span className="countdown-label">วินาทีที่เหลือ</span>
                      </>
                    )}

                    {/* แสดงบอกสถานะคิว */}
                    {currentStep === 1 && queue.length > 0 && (
                      <div className="current-queue-status">
                        ♨️ กำลังอุ่น: {queue[currentItemIndex]?.name}
                        {queue.length > 1 && (
                          <div className="queue-counter">
                            ลูกที่ {currentItemIndex + 1} จาก {queue.length}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    className={`bun-illustration ${currentStep === 3 ? "ready" : ""}`}
                  >
                    {currentStep === 3 ? (
                      <Image
                        src="/Pao.png"
                        alt="Completed Bun"
                        width={190}
                        height={190}
                      />
                    ) : (
                      <>
                        <span className="bun-smoke">♨️</span>
                        <Image
                          src="/Pao.png"
                          alt="Heating Bun"
                          width={160}
                          height={160}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ส่วนล่าง */}
              <div
                className={`processing-bottom-area ${isProcessSuccess ? "success-theme" : ""}`}
              >
                {!isProcessCompleted ? (
                  <div className="stepper-container">
                    <div
                      className="stepper-progress-line"
                      style={{ width: progressLineWidth }}
                    ></div>
                    {PROCESS_STEPS.map((stepName, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      return (
                        <div
                          key={index}
                          className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        >
                          <div className="step-circle">
                            {isCompleted ? <Check size={24} /> : index + 1}
                          </div>
                          <div className="step-label">{stepName}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    className="modal-confirm-btn"
                    style={{ fontSize: "24px", padding: "15px 50px" }}
                    onClick={() => setActiveModal("none")}
                  >
                    หยิบสินค้าเรียบร้อยแล้ว
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
