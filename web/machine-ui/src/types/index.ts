// ==========================================
// Shared Type Definitions
// ==========================================

// ModalType - สถานะทั้งหมดของ Modal UI
export type ModalType =
  | "none"                 // ไม่แสดงโมดอล
  | "info"                 // หน้าต่างความช่วยเหลือและข้อมูลทั่วไป
  | "usage"                // หน้าต่างแสดงวิธีการใช้งานตู้
  | "numpad"               // แป้นพิมพ์ตัวเลข
  | "contact"              // หน้าจอแสดงข้อมูลติดต่อสอบถามเจ้าหน้าที่
  | "coupon"               // หน้าจอใส่รหัสคูปองส่วนลด
  | "payment"              // หน้าจอชำระเงิน (สแกนคิวอาร์ / แตะบัตร)
  | "processing"           // หน้าจอแสดงขั้นตอนการอุ่นร้อนและการเสิร์ฟ
  | "points_result"        // หน้าจอแสดงผลคะแนนที่ได้รับ
  | "limit_warning"        // หน้าจอเตือนเมื่อจำนวนของในตะกร้าเต็มโควตา
  | "stock_limit_warning"; // หน้าจอเตือนเมื่อสินค้าชิ้นที่เลือกหมดสต็อกในตู้

// PaymentMethod - ช่องทางการชำระเงินที่ระบบตู้รองรับ
export type PaymentMethod =
  | "promptpay" // ชำระผ่านระบบสแกนคิวอาร์โค้ด PromptPay (Omise)
  | "truemoney" // ชำระผ่าน TrueMoney Wallet
  | "card";     // ชำระผ่านการแตะบัตรเครดิต/เดบิต (NFC Card Tap)

// TestCardBrand - แบรนด์บัตรเครดิตทดสอบสำหรับการแตะผ่านเครื่องอ่าน NFC จำลอง
export type TestCardBrand = "visa" | "mastercard" | "unionpay";

// นำเข้าและส่งออกแบบรวมศูนย์ เพื่อให้โมดูลอื่นเรียกใช้จากไฟล์นี้ไฟล์เดียวได้สะดวก
export type { Product } from "../components/ProductCard";
export type { CartItem } from "../components/CartSidebar";
export type { AppliedCoupon } from "../components/CouponModal";
export type { AgentJobState } from "../hooks/useJobSocket";