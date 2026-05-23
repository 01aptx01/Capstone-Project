import { apiFetch } from "@/lib/api/client";

export interface SendOtpResponse {
  status: string;
  expires_in: number;
  delivery?: string;
}

export interface VerifyOtpResponse {
  status: string;
  access_token: string;
  token_type: string;
  phone_number: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  return apiFetch<SendOtpResponse>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone }),
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResponse> {
  return apiFetch<VerifyOtpResponse>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone, code }),
  });
}
