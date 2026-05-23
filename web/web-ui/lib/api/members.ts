import { apiFetch, ApiError } from "./client";

export interface MemberProfile {
  found: boolean;
  user_id?: number;
  phone_number?: string;
  points?: number;
  registered_at?: string;
  last_use?: string | null;
  message?: string;
}

export interface EarnPointsResponse {
  status: string;
  is_new_member?: boolean;
  phone_number?: string;
  points_earned?: number;
  total_points?: number;
  message?: string;
}

export async function getMember(phone: string): Promise<MemberProfile> {
  try {
    return await apiFetch<MemberProfile>(
      `/api/members/${encodeURIComponent(phone)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return { found: false, message: "ไม่พบสมาชิก" };
    }
    throw e;
  }
}

export async function earnPoints(payload: {
  phone_number: string;
  total_price: number;
  charge_id?: string;
}): Promise<EarnPointsResponse> {
  return apiFetch("/api/members/earn", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function redeemCoupon(
  phone: string,
  promotionId: number,
): Promise<void> {
  await apiFetch(`/api/members/${encodeURIComponent(phone)}/redeem`, {
    method: "POST",
    body: JSON.stringify({ promotion_id: promotionId }),
  });
}
