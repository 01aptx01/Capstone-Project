import { apiFetch } from "./client";

export interface MemberOrder {
  id: string;
  orderNumber: string;
  charge_id: string;
  datetime: string;
  items: string;
  total: number;
  status: "ready_to_scan" | "completed";
}

export interface UserCoupon {
  id: string;
  promotion_id: number;
  code: string;
  title: string;
  description: string;
  discount_amount: number;
  type: string;
  status: "active" | "used" | "expired";
  expiry: string | null;
  redeemed_at: string;
}

export async function fetchMemberOrders(
  phone: string,
): Promise<MemberOrder[]> {

  const data = await apiFetch<{ orders: MemberOrder[] }>(
    `/api/members/${encodeURIComponent(phone)}/orders`,
  );
  return data.orders ?? [];
}

export async function pickupOrder(
  chargeId: string,
  phone: string,
): Promise<{ status: string; message?: string }> {
  return apiFetch(`/api/orders/${encodeURIComponent(chargeId)}/pickup`, {
    method: "POST",
    body: JSON.stringify({ phone_number: phone }),
  });
}

export async function fetchMemberCoupons(
  phone: string,
): Promise<UserCoupon[]> {
  const data = await apiFetch<{ coupons: UserCoupon[] }>(
    `/api/members/${encodeURIComponent(phone)}/coupons`,
  );
  return data.coupons ?? [];
}
