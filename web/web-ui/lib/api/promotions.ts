import { apiFetch } from "./client";

export interface RedeemableCoupon {
  promotion_id: number;
  code: string;
  title: string;
  description: string;
  points_cost: number;
  discount_amount: number;
  type: string;
  expiry: string | null;
}

export async function fetchRedeemableCoupons(): Promise<RedeemableCoupon[]> {
  const data = await apiFetch<{ coupons: RedeemableCoupon[] }>(
    "/api/promotions/redeemable",
  );
  return data.coupons ?? [];
}
