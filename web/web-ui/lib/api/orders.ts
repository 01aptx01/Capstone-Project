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
