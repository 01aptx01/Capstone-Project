"use client";
import React, { useState } from "react";
import ProductCard, { Product } from "../components/ProductCard";
import CartSidebar, { CartItem } from "../components/CartSidebar";
import Image from "next/image";
import "./globals.css";
import { BanknoteArrowUp, CreditCard, Headset, PackageOpen, PhoneCall, SquareDashedMousePointer } from "lucide-react";

// --- Mock Data ---
const mockProducts: Product[] = [
  {
    id: 1,
    name: "เปามดแดง",
    desc: "ไส้หมูแดงเข้มข้น หวานกำลังดี",
    price: 32,
    image: "/product/img/pao-moddaeng.png"
  },
  {
    id: 2,
    name: "เปาหมูสับ",
    desc: "หมูสับไข่เค็ม รสกลมกล่อม",
    price: 32,
    image: "/product/img/pao-moosub.png"
  },
  {
    id: 3,
    name: "เปากุ้ง",
    desc: "เนื้อกุ้งเด้งเต็มคำ",
    price: 32,
    image: "/product/img/pao-shrimp.png"
  },
  {
    id: 4,
    name: "เปาครีม",
    desc: "ครีมคัสตาร์ด หอมหวานละมุน",
    price: 25,
    image: "/product/img/pao-cream.png"
  }
];

type ModalType = "none" | "info" | "usage" | "numpad" | "report";

export default function VendingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [phoneNumber, setPhoneNumber] = useState("");

  // --- Modal Handlers ---
  const handleOpenNumpad = () => {
    setActiveModal("numpad");
    setPhoneNumber("");
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

  // ฟังก์ชันจัดฟอร์แมตเบอร์โทรให้ออกมาเป็น XXX-XXXXXXX
  const displayFormattedPhone = () => {
    if (!phoneNumber) return "000-0000000";
    if (phoneNumber.length > 3) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    return phoneNumber;
  };

  // --- Cart Logic ---
  const handleAddToCart = (product: Product) => { // ใส่ Type : Product
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // คำนวณราคารวมทั้งหมด
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 1. ฟังก์ชันเพิ่มจำนวน
  const handleIncrease = (productId: number) => {
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item));
  };

  // 2. ฟังก์ชันลดจำนวน
  const handleDecrease = (productId: number) => {
    setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, qty: Math.max(1, item.qty - 1) } : item));
  };

  // 3. ฟังก์ชันลบสินค้าออกจากตะกร้า
  const handleRemove = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    alert(`กำลังดำเนินการชำระเงินจำนวน ${totalPrice} บาท`);
    // TODO: เรียก API ชำระเงินตรงนี้
    setCart([]);
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
              id={product.id}
              key={product.id}
              name={product.name}
              desc={product.desc}
              price={product.price}
              image={product.image}
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
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
        onOpenInfo={() => setActiveModal("info")}
      />

      {activeModal !== "none" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
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

        </div>
      )}

    </div >
  );
}