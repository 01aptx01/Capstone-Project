"use client";
import React, { useState, useEffect } from "react";
import ProductCard, { Product } from "../components/ProductCard";
import CartSidebar, { CartItem } from "../components/CartSidebar";
import Image from "next/image";
import "./globals.css";
import { BanknoteArrowUp, Check, CreditCard, Nfc, PackageOpen, PhoneCall, ScanLine, Smartphone, SquareDashedMousePointer } from "lucide-react";

// --- Mock Data ---
const mockProducts: Product[] = [
  { id: 1, name: "เปามดแดง", desc: "ไส้หมูแดงเข้มข้น หวานกำลังดี", price: 32, heatingTime: 15, image: "/product/img/pao-moddaeng.png" },
  { id: 2, name: "เปาหมูสับ", desc: "หมูสับไข่เค็ม รสกลมกล่อม", price: 32, heatingTime: 20, image: "/product/img/pao-moosub.png" },
  { id: 3, name: "เปากุ้ง", desc: "เนื้อกุ้งเด้งเต็มคำ", price: 32, heatingTime: 15, image: "/product/img/pao-shrimp.png" },
  { id: 4, name: "เปาครีม", desc: "ครีมคัสตาร์ด หอมหวานละมุน", price: 25, heatingTime: 12, image: "/product/img/pao-cream.png" }
];

type ModalType = "none" | "info" | "usage" | "numpad" | "report" | "payment" | "processing";
type PaymentMethod = "promptpay" | "visa" | "unionpay" | "mastercard";
const PROCESS_STEPS = ["กำลังนำเข้าเตาอุ่น", "กำลังอุ่น", "กำลังเสิร์ฟ", "พร้อมทาน"];

export default function VendingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);

  // --- Logic ระบบคิว ---
  const [queue, setQueue] = useState<Product[]>([]); // แถวคิวสินค้า (แตกจากตะกร้า)
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0); // เวลารวมทั้งหมด

  const totalHeatingTime = cart.reduce((sum, item) => sum + (item.heatingTime * item.qty), 0);

  const simulatePaymentSuccess = () => {
    // 1. แตกสินค้าในตะกร้าออกมาเป็นคิวทีละลูก (เช่น ซื้อ 2 ลูก จะมี 2 array items)
    const flatQueue = cart.flatMap(item => Array(item.qty).fill(item));
    setQueue(flatQueue);

    // 2. คำนวณเวลารวม = เวลาอุ่นทุกชิ้นรวมกัน + นำเข้าเตา (3วิ) + เสิร์ฟ (3วิ)
    const totalProcessTime = 3 + flatQueue.reduce((sum, item) => sum + item.heatingTime, 0) + 3;

    setGlobalTimeLeft(totalProcessTime);
    setActiveModal("processing");
    setCart([]);
  };

  // Logic นับถอยหลัง (Timer)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeModal === "processing" && globalTimeLeft > 0) {
      interval = setInterval(() => setGlobalTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, globalTimeLeft]);

  let currentStep = 0;
  let currentItemIndex = 0;
  const totalProcessTime = 3 + queue.reduce((sum, item) => sum + item.heatingTime, 0) + 3;

  if (globalTimeLeft === 0) {
    currentStep = 3; // พร้อมทาน
  } else if (globalTimeLeft <= 3) {
    currentStep = 2; // กำลังเสิร์ฟ (3 วิสุดท้าย)
  } else if (globalTimeLeft <= totalProcessTime - 3) {
    currentStep = 1; // กำลังอุ่น
    // คำนวณว่าตอนนี้กำลังอุ่นลูกไหนอยู่
    const elapsedHeating = (totalProcessTime - 3) - globalTimeLeft;
    let accumulatedTime = 0;
    for (let i = 0; i < queue.length; i++) {
      accumulatedTime += queue[i].heatingTime;
      if (elapsedHeating < accumulatedTime) {
        currentItemIndex = i;
        break;
      }
    }
  } else {
    currentStep = 0; // นำเข้าเตาอุ่น (3 วิแรก)
  }

  const progressLineWidth = `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // --- Handlers ---
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };
  const handleIncrease = (productId: number) => {
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item));
  };
  const handleDecrease = (productId: number) => {
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, qty: Math.max(1, item.qty - 1) } : item));
  };
  const handleRemove = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    // TODO: เรียก API ชำระเงินตรงนี้
    setActiveModal("payment");
    // setCart([]);
  };

  const handleOpenNumpad = () => {
    setActiveModal("numpad");
    setPhoneNumber("");
  };

  const closePaymentModal = () => {
    setActiveModal("none");
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
  };

  // --- Numpad Logic ---
  const handleNumberClick = (num: string) => {
    if (phoneNumber.length < 10) setPhoneNumber(prev => prev + num);
  };
  const handleDeleteClick = () => setPhoneNumber(prev => prev.slice(0, -1))
  const handleConfirmPhone = () => {
    if (phoneNumber.length === 10) {
      alert(`ตรวจสอบคะแนนสำหรับเบอร์: ${phoneNumber}`);
      setActiveModal("none");
    } else {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
    }
  };

  const displayFormattedPhone = () => {
    if (!phoneNumber) return "000-0000000";
    if (phoneNumber.length > 3) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    return phoneNumber;
  };

  return (
    <div className="vending-app">

      {/* ฝั่งซ้าย: โซนเลือกสินค้า */}
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
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAdd={() => handleAddToCart(product)}
            />
          ))}
        </div>

        <div className="device-id">
          <div className="status-dot"></div>
          ID:MP1-001
        </div>
      </div>

      {/* ฝั่งขวา: ตะกร้าสินค้า */}
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

      {activeModal !== "none" && (
        <div className="modal-overlay" onClick={activeModal === "payment" ? closePaymentModal : () => setActiveModal("none")}>
          {/* Modal 1: เมนู Info */}
          {activeModal === "info" && (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveModal("none")}>&times;</button>
              <button className="modal-action-btn" onClick={() => setActiveModal("usage")}>วิธีการใช้งาน</button>
              <button className="modal-action-btn" onClick={handleOpenNumpad}>ตรวจสอบคะแนน</button>
              <button className="modal-action-btn" onClick={() => setActiveModal("report")}>รายงานปัญหา</button>
            </div>
          )}

          {/* Modal 2: วิธีการใช้งาน */}
          {activeModal === "usage" && (
            <div className="usage-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveModal("none")}>&times;</button>
              {/* หัวข้อ */}
              <div className="modal-title">วิธีการใช้งาน</div>
              <div className="usage-list">
                <div className="usage-item">
                  <span className="usage-number">1.</span>
                  <div className="usage-icon-placeholder"><SquareDashedMousePointer /></div>
                  <span className="usage-text">เลือกสินค้าที่ต้องการ</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">2.</span>
                  <div className="usage-icon-placeholder"><CreditCard /></div>
                  <span className="usage-text">เลือกช่องทางการชำระเงิน</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">3.</span>
                  <div className="usage-icon-placeholder"><BanknoteArrowUp /></div>
                  <span className="usage-text">ชำระเงินตามจำนวน</span>
                </div>
                <div className="usage-item">
                  <span className="usage-number">4.</span>
                  <div className="usage-icon-placeholder"><PackageOpen /></div>
                  <span className="usage-text">รับสินค้า</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal 3: Numpad */}
          {activeModal === "numpad" && (
            <div className="numpad-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveModal("none")}>&times;</button>
              <div className="numpad-title">โปรดกรอกหมายเลขโทรศัพท์</div>
              {/* จอแสดงเบอร์โทร */}
              <div className="phone-display" style={{ opacity: phoneNumber ? 1 : 0.6 }}>
                {displayFormattedPhone()}
              </div>
              {/* แป้นพิมพ์ */}
              <div className="numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button key={num} className="numpad-btn" onClick={() => handleNumberClick(num.toString())}>
                    {num}
                  </button>
                ))}
                <button className="numpad-btn action" onClick={handleDeleteClick}>DEL</button>
                <button className="numpad-btn" onClick={() => handleNumberClick('0')}>0</button>
                <button className="numpad-btn action" onClick={handleConfirmPhone}>OK</button>
              </div>
            </div>
          )}

          {/* Modal 4: Report */}
          {activeModal === "report" && (
            <div className="report-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveModal("none")}>&times;</button>
              <div className="report-title">รายงานปัญหา</div>
              {/* เบอร์โทรศัพท์ */}
              <div className="report-phone"><PhoneCall />02-123-4567</div>
              <div className="report-divider">หรือ</div>
              {/* โซน LINE สำหรับสแกนแจ้งปัญหา */}
              <div className="line-report-section">
                <div className="qr-placeholder">
                  {/* จำลอง QR Code ด้วย Icon Line และภาพตัวอย่าง */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}>LINE</div>
                    <div style={{ fontSize: '10px' }}>SCAN ME</div>
                  </div>
                </div>
                <div className="line-id-text">ID: @MOD.PAO</div>
                <div className="scan-text">สแกนเพื่อติดต่อเจ้าหน้าที่โดยตรง</div>
              </div>
            </div>
          )}

          {/* Modal 5 : เมนู payment */}
          {activeModal === "payment" && (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => { setActiveModal("none"); setSelectedPaymentMethod(null); }}>&times;</button>
              <div className="payment-wrapper">
                {/* --- Step 0: เลือกช่องทางชำระเงิน --- */}
                {selectedPaymentMethod === null && (
                  <>
                    <div className="modal-title">โปรดเลือกวิธีการชำระเงิน</div>
                    <div className="modal-payment">
                      <button className="modal-action-payment-btn" onClick={() => setSelectedPaymentMethod("promptpay")}>
                        <Image
                          className="payment-logo"
                          src="/PromptPay-logo.png"
                          alt="PromptPay"
                          width={160}
                          height={89}
                          priority
                        />
                      </button>
                      <button className="modal-action-payment-btn" onClick={() => setSelectedPaymentMethod("visa")}>
                        <Image
                          src="/Visa-logo.png"
                          alt="Visa"
                          width={160}
                          height={65}
                          priority
                        />
                      </button>
                      <button className="modal-action-payment-btn" onClick={() => setSelectedPaymentMethod("unionpay")}>
                        <Image
                          src="/UnionPay-logo.png"
                          alt="UnionPay"
                          width={160}
                          height={90}
                          priority
                        />
                      </button>
                      <button className="modal-action-payment-btn" onClick={() => setSelectedPaymentMethod("mastercard")}>
                        <Image
                          src="/Mastercard-logo.png"
                          alt="Mastercard"
                          width={140}
                          height={90}
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
                          <p><Smartphone size={20} color="#f89025" /> 1. เปิดแอปพลิเคชันธนาคารของคุณ</p>
                          <p><ScanLine size={20} color="#f89025" /> 2. เลือกเมนู "สแกน QR Code"</p>
                          <p><BanknoteArrowUp size={20} color="#f89025" /> 3. สแกนเพื่อชำระเงินในหน้าถัดไป</p>
                        </div>
                        <button className="modal-confirm-btn" onClick={() => setPaymentStep(2)}>
                          รับทราบ และแสดง QR Code
                        </button>
                      </>
                    )}
                    {/* Step 2: แสดง QR Code เปล่าๆ */}
                    {paymentStep === 2 && (
                      <>
                        <Image
                          src="/QR_code-fake.svg"
                          alt="QR Code"
                          width={200}
                          height={200}
                          priority
                        />
                        <p style={{ color: '#475569', fontWeight: 600 }}>กรุณาสแกนภายใน 3:00 นาที</p>
                      </>
                    )}
                  </>
                )}
                {/* --- Flow B: บัตรเครดิต (Visa, UnionPay, Mastercard) --- */}
                {selectedPaymentMethod !== null && selectedPaymentMethod !== "promptpay" && (
                  <>
                    <div className="payment-title">
                      ชำระเงินด้วย {selectedPaymentMethod.toUpperCase()}
                    </div>

                    {/* Step 1: แนะนำ */}
                    {paymentStep === 1 && (
                      <>
                        <div className="payment-instruction-list">
                          <p><CreditCard size={20} color="#f89025" /> 1. เตรียมบัตรของคุณให้พร้อม</p>
                          <p><Nfc size={20} color="#f89025" /> 2. แตะบัตรที่เครื่องรับชำระเงินด้านล่างหน้าจอ</p>
                          <p><BanknoteArrowUp size={20} color="#f89025" /> 3. รอสัญญาณเสียงเพื่อเสร็จสิ้นรายการ</p>
                        </div>
                        <button className="modal-confirm-btn" onClick={() => setPaymentStep(2)}>
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
                        <h3 style={{ color: '#f89025', marginBottom: '5px' }}>กำลังรอการแตะบัตร...</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>กรุณานำบัตรมาแตะที่เครื่องอ่านด้านล่าง</p>
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
                    {paymentStep === 2 ? "ย้อนกลับไปอ่านวิธีใช้" : "เปลี่ยนช่องทางการชำระเงิน"}
                  </button>
                )}

                {/* ปุ่มจำลองชำระเงินสำเร็จ */}
                {selectedPaymentMethod !== null && (
                  <button
                    style={{ marginTop: '20px', padding: '10px', background: '#22c55e', color: 'white', borderRadius: '8px', width: '100%', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    onClick={simulatePaymentSuccess}
                  >
                    [Test] จำลองชำระเงินสำเร็จ
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modal 6: หน้าจอรอรับสินค้า (Processing) */}
          {activeModal === "processing" && (
            <div className="processing-modal-box" onClick={(e) => e.stopPropagation()}>
              {/* ส่วนหัว */}
              <div className={`processing-header ${currentStep === 3 ? 'success-theme' : ''}`}>
                <div className="processing-title">{currentStep === 3 ? "อร่อยให้อร่อยนะครับ!" : "กรุณารอสักครู่..."}</div>
                <div className="processing-subtitle">{currentStep === 3 ? "🎉 สินค้าของคุณพร้อมแล้ว!" : PROCESS_STEPS[currentStep]}</div>
              </div>

              {/* ส่วนกลาง */}
              <div className="processing-center-area">
                {currentStep < 3 && (
                  <div className="countdown-timer">
                    {globalTimeLeft >= 60 ? (
                      <>{Math.floor(globalTimeLeft / 60)}:{String(globalTimeLeft % 60).padStart(2, '0')}<span className="countdown-label">นาทีที่เหลือ</span></>
                    ) : (
                      <>{globalTimeLeft}<span className="countdown-label">วินาทีที่เหลือ</span></>
                    )}

                    {/* แสดงบอกสถานะคิว */}
                    {currentStep === 1 && queue.length > 0 && (
                      <div className="current-queue-status">
                        ♨️ กำลังอุ่น: {queue[currentItemIndex]?.name}
                        {queue.length > 1 && (
                          <div className="queue-counter">ลูกที่ {currentItemIndex + 1} จาก {queue.length}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={`bun-illustration ${currentStep === 3 ? 'ready' : ''}`}>
                    {currentStep === 3 ? (
                      <Image src="/Pao.png" alt="Completed Bun" width={190} height={190} />
                    ) : (
                      <>
                        <span className="bun-smoke">♨️</span>
                        <Image src="/Pao.png" alt="Heating Bun" width={160} height={160} />
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* ส่วนล่าง */}
              <div className={`processing-bottom-area ${currentStep === 3 ? 'success-theme' : ''}`}>
                {currentStep < 3 ? (
                  <div className="stepper-container">
                    <div className="stepper-progress-line" style={{ width: progressLineWidth }}></div>
                    {PROCESS_STEPS.map((stepName, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      return (
                        <div key={index} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                          <div className="step-circle">
                            {isCompleted ? <Check size={24} /> : index + 1}
                          </div>
                          <div className="step-label">{stepName}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button className="modal-confirm-btn" style={{ fontSize: '24px', padding: '15px 50px' }} onClick={() => setActiveModal("none")}>
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