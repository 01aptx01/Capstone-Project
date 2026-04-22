"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductCard, { Product } from "../components/ProductCard";
import CartSidebar, { CartItem } from "../components/CartSidebar";
import Image from "next/image";
import Script from "next/script";
import "./globals.css";
import {
  BanknoteArrowUp,
  Check,
  CreditCard,
  Nfc,
  PackageOpen,
  PhoneCall,
  ScanLine,
  Smartphone,
  SquareDashedMousePointer,
} from "lucide-react";

// ==========================================
// MOCK DATA & TYPES
// ==========================================
// Products will be fetched from the server
// const mockProducts: Product[] = [
//   { id: 1, name: "เปามดแดง", desc: "ไส้หมูแดงเข้มข้น หวานกำลังดี", price: 32, heatingTime: 15, image: "/product/img/pao-moddaeng.png" },
//   { id: 2, name: "เปาหมูสับ", desc: "หมูสับไข่เค็ม รสกลมกล่อม", price: 32, heatingTime: 20, image: "/product/img/pao-moosub.png" },
//   { id: 3, name: "เปากุ้ง", desc: "เนื้อกุ้งเด้งเต็มคำ", price: 32, heatingTime: 15, image: "/product/img/pao-shrimp.png" },
//   { id: 4, name: "เปาครีม", desc: "ครีมคัสตาร์ด หอมหวานละมุน", price: 25, heatingTime: 12, image: "/product/img/pao-cream.png" }
// ];

type ModalType =
  | "none"
  | "info"
  | "usage"
  | "numpad"
  | "report"
  | "payment"
  | "processing"
  | "points_result";
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
  marginTop: "10px",
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
  const [isOmiseLoaded, setIsOmiseLoaded] = useState(false); // เช็คว่า Omise โหลดเสร็จหรือยัง
  const [realQrCode, setRealQrCode] = useState<string | null>(null); // เก็บ QR Code จริงจาก Backend
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // ตัวแปรเก็บรอบการดึงสถานะจ่ายเงิน
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);

  // -- Flow & Queue States --
  const [isAfterPayment, setIsAfterPayment] = useState(false);
  const [queue, setQueue] = useState<Product[]>([]);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0); // เวลารวมทั้งหมด

  // -- Timers States --
  const [paymentCountdown, setPaymentCountdown] = useState<number>(60);
  const [pointsCountdown, setPointsCountdown] = useState<number>(10);

  const MOCK_USER_POINTS = 38;

  // ==========================================
  // DERIVED DATA (คำนวณค่าจาก State อัตโนมัติ)
  // ==========================================
  const totalHeatingTime = cart.reduce(
    (sum, item) => sum + item.heatingTime * item.qty,
    0,
  );
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalProcessTime =
    3 + queue.reduce((sum, item) => sum + item.heatingTime, 0) + 3;

  // ฟังก์ชันหาว่าตอนนี้อยู่สเต็ปไหนของการอุ่น
  const getProcessStatus = () => {
    if (queue.length === 0) return { step: 0, itemIndex: 0 };
    if (globalTimeLeft === 0) return { step: 3, itemIndex: 0 };
    if (globalTimeLeft <= 3) return { step: 2, itemIndex: queue.length - 1 };

    const elapsedHeating = totalProcessTime - 3 - globalTimeLeft;
    let accumulatedTime = 0;

    for (let i = 0; i < queue.length; i++) {
      accumulatedTime += queue[i].heatingTime;
      if (elapsedHeating < accumulatedTime) {
        return { step: 1, itemIndex: i };
      }
    }
    return { step: 0, itemIndex: 0 };
  };
  const { step: currentStep, itemIndex: currentItemIndex } = getProcessStatus();
  const progressLineWidth = `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;

  // Fetch Products from Server
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(
          `${apiUrl}/api/products?machine_id=MP1-001`,
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        // Map DB fields to Frontend interface
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          desc: p.description,
          price: p.price,
          heatingTime: p.heating_time,
          image: p.image_url,
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
    let timer: NodeJS.Timeout;
    if (activeModal === "payment") {
      if (paymentCountdown > 0) {
        timer = setInterval(
          () => setPaymentCountdown((prev) => prev - 1),
          1000,
        );
      } else {
        closePaymentModal();
      }
    }
    return () => clearInterval(timer);
  }, [activeModal, paymentCountdown]);

  // Timer: นับถอยหลังการโชว์คะแนนสะสม
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeModal === "points_result") {
      if (pointsCountdown > 0) {
        timer = setInterval(() => setPointsCountdown((prev) => prev - 1), 1000);
      } else {
        if (isAfterPayment) {
          startHeatingProcess();
        } else {
          setActiveModal("none");
        }
      }
    }
    return () => clearInterval(timer);
  }, [activeModal, pointsCountdown, isAfterPayment]);

  // Timer: นับถอยหลังระบบอุ่นสินค้ารวม
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeModal === "processing" && globalTimeLeft > 0) {
      interval = setInterval(() => setGlobalTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, globalTimeLeft]);

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
    setQueue(flatQueue);
    setCart([]);
    setRealQrCode(null);

    // ไหลไปหน้าสะสมแต้ม
    setIsAfterPayment(true);
    setPhoneNumber("");
    setActiveModal("numpad");
  };

  const processPayment = async (paymentData: {
    type: "token" | "source";
    id: string;
    amount: number;
  }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/buy/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          machine_id: "MP1-001",
          cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
          amount: paymentData.amount,
          payment_type: paymentData.type,
          payment_id: paymentData.id,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Payment failed: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();

      if (paymentData.type === "source" && result.qr_code) {
        setRealQrCode(result.qr_code);
        setPaymentStep(2);
        pollPaymentStatus(result.charge_id);
      } else {
        handlePaymentSuccess();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Payment Error Details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause,
      });

      if (err.name === "AbortError") {
        alert("ระบบเชื่อมต่อล่าช้า กรุณาลองใหม่อีกครั้ง (Request Timeout)");
      } else {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
      }

      // Safeguard: Reset to home screen to prevent freeze
      setTimeout(() => {
        closePaymentModal();
        setActiveModal("none");
      }, 3000);
    }
  };

  const pollPaymentStatus = (chargeId: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/buy/status/${chargeId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            handlePaymentSuccess();
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);
  };

  const handleOmiseCheckout = (paymentMethod: "card" | "promptpay") => {
    if (typeof window !== "undefined" && (window as any).OmiseCard) {
      const OmiseCard = (window as any).OmiseCard;
      OmiseCard.configure({
        publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || "pkey_test_xxx",
        currency: "THB",
        frameLabel: "MOD.PAO Vending",
        submitLabel: "ชำระเงิน / Pay Now",
      });

      OmiseCard.open({
        amount: totalPrice * 100, // Omise ใช้หน่วยสตางค์
        defaultPaymentMethod:
          paymentMethod === "promptpay" ? "promptpay" : undefined,
        onCreateTokenSuccess: (nonce: string) => {
          const type = nonce.startsWith("tokn_") ? "token" : "source";
          processPayment({ type, id: nonce, amount: totalPrice * 100 });
        },
        onFormClosed: () => {
          console.log("Payment form closed by user");
        },
      });
    } else {
      alert("Payment gateway is still loading. Please try again.");
    }
  };

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  // Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
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
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
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
    // TODO: เรียก API ชำระเงินตรงนี้
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
  const handleConfirmPhone = () => {
    if (phoneNumber.length === 10) {
      setPointsCountdown(10);
      setActiveModal("points_result");
    } else {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
    }
  };
  const displayFormattedPhone = () => {
    if (!phoneNumber) return "xxx-xxxxxxx";
    if (phoneNumber.length > 3)
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    return phoneNumber;
  };

  // Flow Actions
  // --- 💡 ฟังก์ชันสร้าง QR Code ทันที (ข้ามหน้าต่าง Omise) ---
  const handleDirectPromptPay = async () => {
    if (!(window as any).Omise) {
      alert("ระบบชำระเงินยังไม่พร้อม");
      return;
    }

    const Omise = (window as any).Omise;
    const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;
    Omise.setPublicKey(publicKey);

    // 1. สร้าง Source ID สำหรับ PromptPay ก่อน
    Omise.createSource(
      "promptpay",
      {
        amount: totalPrice * 100, // จำนวนสตางค์
        currency: "THB",
      },
      async (statusCode: number, response: any) => {
        if (statusCode !== 200) {
          console.error("Omise Source Error:", response);
          alert("ไม่สามารถสร้างรายการชำระเงินได้");
          return;
        }

        const sourceId = response.id; // จะได้ค่าเริ่มต้นด้วย src_xxx

        // 2. ส่ง sourceId ที่ได้ไปที่ Backend
        setPaymentStep(2);
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${apiUrl}/api/buy/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              machine_id: "MP1-001",
              cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
              amount: totalPrice * 100,
              payment_type: "promptpay",
              payment_id: response.id, // <--- ต้องส่ง ID ที่ได้จาก Omise ไปด้วย!
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server Error: ${res.status} - ${errorText}`);
          }

          const result = await res.json();
          if (result.qr_code) {
            setRealQrCode(result.qr_code);
            setCurrentChargeId(result.charge_id);
            pollPaymentStatus(result.charge_id);
          }
        } catch (err: any) {
          console.error("PromptPay Flow Error:", err);
          alert("เกิดข้อผิดพลาดในการรับ QR Code");
          closePaymentModal();
        }
      },
    );
  };
  // --- 💡 ฟังก์ชันจำลองการโอนเงิน PromptPay (ยิงไปบอกหลังบ้าน) ---
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/buy/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          machine_id: "MP1-001",
          cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
          amount: totalPrice * 100,
          payment_type: "nfc_mock",
          card_brand: selectedPaymentMethod,
          payment_id: "nfc_token_from_hardware_12345",
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("NFC Payment failed");
      const result = await response.json();

      if (result.status === "successful") {
        handlePaymentSuccess();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("NFC Error Details:", err);

      if (err.name === "AbortError") {
        alert("เครื่องอ่านบัตรไม่ตอบสนอง (Timeout)");
      } else {
        console.warn("Backend not ready, falling back to UI simulation.");
        handlePaymentSuccess();
      }
    }
  };

  const startHeatingProcess = () => {
    // คำนวณเวลาและเริ่มหน้าจอ Processing
    const totalProcessTime =
      3 + queue.reduce((sum, item) => sum + item.heatingTime, 0) + 3;
    setGlobalTimeLeft(totalProcessTime);
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
      />

      {/* --- OVERLAY & MODALS --- */}
      {activeModal !== "none" && (
        <div
          className="modal-overlay"
          onClick={
            activeModal === "payment"
              ? closePaymentModal
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
                onClick={() => setActiveModal("report")}
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
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal("none")}
              >
                &times;
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
                >
                  OK
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
              {/* ปุ่มปิดอัตโนมัติพร้อมตัวเลข */}
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
              <div className="points-title">คะแนนสะสมปัจจุบัน</div>
              <div className="points-value">{MOCK_USER_POINTS}</div>
              <div className="points-unit">คะแนน</div>
              <div className="points-disclaimer">
                <strong>*คะแนนสามารถนำไปแลกเป็นส่วนลดหรือโปรโมชั่น*</strong>
                <br />
                ได้ทางเว็ปไซต์ MODPAO.com
              </div>
            </div>
          )}

          {/* Modal 5: Report (รายงานปัญหา) */}
          {activeModal === "report" && (
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
              <div className="report-title">รายงานปัญหา</div>
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
          {activeModal === "payment" && (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button
                className="timeout-close-btn danger"
                onClick={closePaymentModal}
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
                        onClick={() => setSelectedPaymentMethod("promptpay")}
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
                        onClick={() => setSelectedPaymentMethod("visa")}
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
                        onClick={() => setSelectedPaymentMethod("unionpay")}
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
                        onClick={() => setSelectedPaymentMethod("mastercard")}
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
                          onClick={handleDirectPromptPay}
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
                        <p
                          style={{
                            color: "#475569",
                            fontWeight: 600,
                            marginTop: "15px",
                          }}
                        >
                          กรุณาสแกนภายใน 3:00 นาที
                        </p>
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
                            onClick={() => setPaymentStep(2)}
                          >
                            ดำเนินการแตะบัตร
                          </button>
                          {/* <button className="modal-confirm-btn" onClick={() => setPaymentStep(2)}>
                          ดำเนินการแตะบัตร
                        </button> */}
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
                          {/* 💡 กดเพื่อจำลองการแตะบัตร NFC */}
                          <button style={testBtnStyle} onClick={simulateNfcTap}>
                            [Test] จำลองการแตะบัตรสำเร็จ (NFC)
                          </button>
                        </>
                      )}
                    </>
                  )}

                {/* ปุ่มย้อนกลับ */}
                {selectedPaymentMethod !== null && (
                  <button
                    className="modal-back-btn"
                    onClick={() => {
                      if (paymentStep === 2) setPaymentStep(1);
                      else setSelectedPaymentMethod(null);
                    }}
                  >
                    {paymentStep === 2
                      ? "ย้อนกลับไปอ่านวิธีใช้"
                      : "เปลี่ยนช่องทางการชำระเงิน"}
                  </button>
                )}
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
                className={`processing-header ${currentStep === 3 ? "success-theme" : ""}`}
              >
                <div className="processing-title">
                  {currentStep === 3
                    ? "อร่อยให้อร่อยนะครับ!"
                    : "กรุณารอสักครู่..."}
                </div>
                <div className="processing-subtitle">
                  {currentStep === 3
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
                className={`processing-bottom-area ${currentStep === 3 ? "success-theme" : ""}`}
              >
                {currentStep < 3 ? (
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
