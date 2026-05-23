import { apiFetch, ApiError } from "./client";

export interface MemberProfile {
  found: boolean;
  user_id?: number;
  phone_number?: string;
  display_name?: string | null;
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

export interface RedeemResponse {
  status: string;
  message: string;
  code?: string;
  points_remaining?: number;
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

export async function registerMember(displayName: string): Promise<MemberProfile> {
  return apiFetch("/api/members/register", {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function updateMemberProfile(
  phone: string,
  displayName: string,
): Promise<void> {
  await apiFetch(`/api/members/${encodeURIComponent(phone)}`, {
    method: "PATCH",
    body: JSON.stringify({ display_name: displayName }),
  });
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
): Promise<RedeemResponse> {
  return apiFetch(`/api/members/${encodeURIComponent(phone)}/redeem`, {
    method: "POST",
    body: JSON.stringify({ promotion_id: promotionId }),
  });
}
