import type { AppliedCoupon, CartItem, PaymentMethod } from "../types";
import { PENDING_PAYMENT_SESSION_TTL_MS } from "../constants";

const STORAGE_KEY = "kiosk_pending_payment_session";

export type PendingPaymentSession = {
  chargeId: string;
  machineCode: string;
  paymentMethod: PaymentMethod | null;
  qrCode?: string | null;
  cart?: CartItem[];
  appliedCoupon?: AppliedCoupon | null;
  payableTotal?: number;
  savedAt: number;
};

export function savePendingPaymentSession(
  machineCode: string,
  chargeId: string,
  paymentMethod: PaymentMethod | null,
  options?: {
    qrCode?: string | null;
    cart?: CartItem[];
    appliedCoupon?: AppliedCoupon | null;
    payableTotal?: number;
  },
): void {
  if (typeof window === "undefined") return;
  const payload: PendingPaymentSession = {
    chargeId,
    machineCode,
    paymentMethod,
    qrCode: options?.qrCode ?? null,
    cart: options?.cart,
    appliedCoupon: options?.appliedCoupon ?? null,
    payableTotal: options?.payableTotal,
    savedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readPendingPaymentSession(
  machineCode: string,
): PendingPaymentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingPaymentSession;
    if (data.machineCode !== machineCode || !data.chargeId) return null;
    if (Date.now() - data.savedAt > PENDING_PAYMENT_SESSION_TTL_MS) {
      clearPendingPaymentSession();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingPaymentSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** แปลง payment_method จาก DB เป็น UI method (กู้หลังรีเฟรช) */
export function paymentMethodFromDb(
  dbMethod: string | undefined | null,
): PaymentMethod | null {
  if (!dbMethod) return null;
  if (dbMethod === "qr_code") return "promptpay";
  if (dbMethod === "credit_card") return "card";
  return null;
}
