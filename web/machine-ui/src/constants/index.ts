import React from "react";
import type { TestCardBrand } from "../types";

// ==========================================
// Process Steps (UI labels)
// ==========================================
export const PROCESS_STEPS = [
  "กำลังนำเข้าเตาอุ่น",
  "กำลังอุ่น",
  "กำลังเสิร์ฟ",
  "พร้อมทาน",
];

// ==========================================
// Timing Constants (seconds)
// ==========================================
export const STEP1_DELAY = 2;
export const DISPENSE_WINDOW = 2;
export const STEP4_HOLD = 3;
export const FINAL_STEP_HOLD = 3;
export const SECONDS_PER_HEATING_TIME_TYPE = 3;

// ==========================================
// Cart & Payment Limits
// ==========================================
export const MAX_CART_ITEMS = 4;
export const PAYMENT_COUNTDOWN_SECONDS = 180;
export const POINTS_COUNTDOWN_SECONDS = 10;
export const NUMPAD_COUNTDOWN_SECONDS = 60;
export const NFC_BLOCK_DURATION_MS = 5000;
export const PAYMENT_POLL_INTERVAL_MS = 1000;
export const PAYMENT_POLL_MAX_ATTEMPTS = 120;
export const PAYMENT_TIMEOUT_MS = 60000;

// ==========================================
// Machine Config
// ==========================================
export const DEFAULT_MACHINE_CODE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MACHINE_CODE) || "MP1-001";

// ==========================================
// Test Cards (for NFC simulation)
// ==========================================
export const TEST_CARDS: Record<TestCardBrand, { name: string; number: string }> = {
  visa: { name: "Test Visa Machine", number: "4242424242424242" },
  mastercard: { name: "Test Mastercard Machine", number: "5555555555554444" },
  unionpay: { name: "Test UnionPay Machine", number: "6250947000000006" },
};

// ==========================================
// Shared Styles
// ==========================================
export const testBtnStyle: React.CSSProperties = {
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
