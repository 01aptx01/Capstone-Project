// ==========================================
// Shared Type Definitions
// ==========================================

/** All possible modal states in the vending machine UI */
export type ModalType =
  | "none"
  | "info"
  | "usage"
  | "numpad"
  | "contact"
  | "coupon"
  | "payment"
  | "processing"
  | "points_result"
  | "limit_warning"
  | "stock_limit_warning";

/** Supported payment methods */
export type PaymentMethod = "promptpay" | "truemoney" | "card";

/** Test card brands for NFC simulation */
export type TestCardBrand = "visa" | "mastercard" | "unionpay";

// Re-export types from existing component/hook files
export type { Product } from "../components/ProductCard";
export type { CartItem } from "../components/CartSidebar";
export type { AppliedCoupon } from "../components/CouponModal";
export type { AgentJobState } from "../hooks/useJobSocket";
