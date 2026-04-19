import React, { useState } from "react";
import ProductCard from "../../components/ProductCard";
import CartSidebar from "../../components/CartSidebar";
import LogoModPao from "../../assets/Logo_modpao.png";
import './VendingPage.css';

// ข้อมูลจำลองอ้างอิงตาม Design ของคุณ
const mockProducts = [
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

export default function VendingPage() {
  const [cart, setCart] = useState([]);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isNumpadModalOpen, setIsNumpadModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleOpenUsage = () => {
    setIsInfoModalOpen(false); // ปิด Popup แรก
    setIsUsageModalOpen(true); // เปิด Popup วิธีการใช้งาน
  };

  const handleOpenReport = () => {
    setIsInfoModalOpen(false); // ปิดหน้าเมนู i
    setIsReportModalOpen(true); // เปิดหน้าแจ้งปัญหา
  };

  const handleOpenNumpad = () => {
    setIsInfoModalOpen(false);
    setIsNumpadModalOpen(true);
    setPhoneNumber(""); // เคลียร์เบอร์เก่าทุกครั้งที่เปิดใหม่
  };

  const handleNumberClick = (num) => {
    // ให้กรอกได้สูงสุด 10 ตัว
    if (phoneNumber.length < 10) {
      setPhoneNumber(prev => prev + num);
    }
  };

  const handleDeleteClick = () => {
    setPhoneNumber(prev => prev.slice(0, -1)); // ลบตัวสุดท้ายทิ้ง
  };

  const handleConfirmPhone = () => {
    if (phoneNumber.length === 10) {
      alert(`ตรวจสอบคะแนนสำหรับเบอร์: ${phoneNumber}`);
      setIsNumpadModalOpen(false);
      // TODO: นำเบอร์นี้ไปเช็คกับ API ต่อ
    } else {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลักครับ");
    }
  };

  // ฟังก์ชันจัดฟอร์แมตเบอร์โทรให้ออกมาเป็น XXX-XXXXXXX
  const displayFormattedPhone = () => {
    if (phoneNumber.length === 0) return "000-0000000"; // Placeholder เบลอๆ
    if (phoneNumber.length > 3) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return phoneNumber;
  };

  // ฟังก์ชันเพิ่มของลงตะกร้า
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // ถ้ามีอยู่แล้วให้บวกจำนวน (qty)
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // ถ้ายังไม่มีให้เพิ่มเข้าไปใหม่
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // คำนวณราคารวมทั้งหมด
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 1. ฟังก์ชันเพิ่มจำนวน
  const handleIncrease = (productId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // 2. ฟังก์ชันลดจำนวน (ถ้าลดจนเหลือ 1 จะไม่ให้ลดต่อ ต้องกดปุ่มลบแทน เพื่อกัน User กดพลาด)
  const handleDecrease = (productId) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          return { ...item, qty: Math.max(1, item.qty - 1) };
        }
        return item;
      })
    );
  };

  // 3. ฟังก์ชันลบสินค้าออกจากตะกร้า
  const handleRemove = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    alert(`กำลังดำเนินการชำระเงินจำนวน ${totalPrice} บาท`);
    // TODO: เรียก API ชำระเงินตรงนี้
    setCart([]); // เคลียร์ตะกร้าหลังชำระเงิน
  };

  return (
    <div className="vending-app">

      {/* ฝั่งซ้าย: โซนเลือกสินค้า */}
      <div className="main-content">
        <div className="header">
          <span>M <img src={LogoModPao} alt="Logo ModPao" className="logo-image" /> D . P A O</span>
        </div>

        <div className="product-container">
          {mockProducts.map((product) => (
            <ProductCard
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
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* โมดูลข้อมูล */}
      {isInfoModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsInfoModalOpen(false)} /* กดพื้นหลังสีดำเพื่อปิด */
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()} /* ป้องกันไม่ให้กดโดนปุ่มแล้วทะลุไปปิดฉากหลัง */
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsInfoModalOpen(false)}
            >
              &times; {/* ตัวอักษร X (กากบาท) */}
            </button>

            <button className="modal-action-btn" onClick={handleOpenUsage}>วิธีการใช้งาน</button>
            <button className="modal-action-btn" onClick={handleOpenNumpad}>ตรวจสอบคะแนน</button>
            <button className="modal-action-btn" onClick={handleOpenReport}>รายงานปัญหา</button>
          </div>
        </div>
      )}

      {isUsageModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUsageModalOpen(false)}>
          <div className="usage-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* ปุ่มกากบาทสีส้ม */}
            <button className="modal-close-btn" onClick={() => setIsUsageModalOpen(false)}>&times;</button>
            {/* หัวข้อ */}
            <div className="modal-title">วิธีการใช้งาน</div>

            <div className="usage-list">
              <div className="usage-item">
                <span className="usage-number">1.</span>
                <div className="usage-icon-placeholder"><span class="material-symbols-outlined">gesture_select</span></div>
                <span className="usage-text">เลือกสินค้าที่ต้องการ</span>
              </div>

              <div className="usage-item">
                <span className="usage-number">2.</span>
                <div className="usage-icon-placeholder"><span class="material-symbols-outlined">credit_card</span></div>
                <span className="usage-text">เลือกช่องทางการชำระเงิน</span>
              </div>

              <div className="usage-item">
                <span className="usage-number">3.</span>
                <div className="usage-icon-placeholder"><span class="material-symbols-outlined">money_bag</span></div>
                <span className="usage-text">ชำระเงินตามจำนวน</span>
              </div>

              <div className="usage-item">
                <span className="usage-number">4.</span>
                <div className="usage-icon-placeholder"><span class="material-symbols-outlined">box</span></div>
                <span className="usage-text">รับสินค้า</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNumpadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNumpadModalOpen(false)}>
          <div className="numpad-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsNumpadModalOpen(false)}>&times;</button>

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
        </div>
      )}

      {isReportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="report-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsReportModalOpen(false)}>&times;</button>

            <div className="report-title">รายงานปัญหา</div>

            {/* เบอร์โทรศัพท์ */}
            <div className="report-phone"><span class="material-symbols-outlined">call</span>02-123-4567</div>
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
        </div>
      )}

    </div >
  );
}