import { apiFetch } from "./client";
import type { FulfillmentMode } from "@/lib/config";

export interface AppliedCoupon {
  code: string;
  promotion_id: number;
  type: string;
  subtotal_thb: number;
  discount_thb: number;
  final_thb: number;
  points_cost: number;
  label_th: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  reason?: string;
  message?: string;
  code?: string;
  promotion_id?: number;
  type?: string;
  subtotal_thb?: number;
  discount_thb?: number;
  final_thb?: number;
  points_cost?: number;
  label_th?: string;
}

export interface CheckoutResponse {
  status: string;
  charge_id?: string;
  qr_code?: string | null;
  authorize_uri?: string | null;
  message?: string;
}

export interface PaymentStatusResponse {
  status: string;
}

export async function validateCoupon(payload: {
  code: string;
  machine_code: string;
  cart: { product_id: number; quantity: number }[];
}): Promise<ValidateCouponResponse> {
  return apiFetch("/api/buy/validate-coupon", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkout(payload: {
  machine_code: string;
  cart: { product_id: number; quantity: number }[];
  amount: number;
  payment_type: "source" | "truemoney";
  payment_id: string;
  coupon_code?: string;
  fulfillment_mode: FulfillmentMode;
}): Promise<CheckoutResponse> {
  return apiFetch("/api/buy/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPaymentStatus(
  chargeId: string,
): Promise<PaymentStatusResponse> {
  return apiFetch(`/api/buy/status/${encodeURIComponent(chargeId)}`);
}

export async function cancelPayment(chargeId: string): Promise<void> {
  await apiFetch("/api/buy/cancel", {
    method: "POST",
    body: JSON.stringify({ charge_id: chargeId }),
  });
}

export async function mockPay(chargeId: string): Promise<void> {
  await apiFetch("/api/buy/mock-pay", {
    method: "POST",
    body: JSON.stringify({ charge_id: chargeId }),
  });
}
