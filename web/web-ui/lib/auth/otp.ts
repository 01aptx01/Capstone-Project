import { apiFetch } from "@/lib/api/client";

export async function sendOtp(_phone: string): Promise<void> {
  // TODO: integrate SMS provider
  try {
    await apiFetch("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone_number: _phone }),
    });
  } catch {
    // Stub endpoint may return 501 — ignore until implemented
  }
}

export async function verifyOtp(_phone: string, _code: string): Promise<void> {
  // TODO: verify OTP code
  try {
    await apiFetch("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone_number: _phone, code: _code }),
    });
  } catch {
    // Stub endpoint may return 501 — ignore until implemented
  }
}
