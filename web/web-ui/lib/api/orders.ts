import { apiFetch } from "./client";

export interface MemberOrder {
  id: string;
  machine_code: string;
  orderNumber: string;
  charge_id: string;
  datetime: string;
  items: string;
  total: number;
  status: string;
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

export async function fetchMemberCoupons(
  phone: string,
): Promise<UserCoupon[]> {
  const data = await apiFetch<{ coupons: UserCoupon[] }>(
    `/api/members/${encodeURIComponent(phone)}/coupons`,
  );
  return data.coupons ?? [];
}
