import { OMISE_PUBLIC_KEY } from "@/lib/config";

declare global {
  interface Window {
    Omise?: {
      setPublicKey: (key: string) => void;
      createSource: (
        type: string,
        params: { amount: number; currency: string },
        callback: (statusCode: number, response: { id?: string; message?: string }) => void,
      ) => void;
    };
  }
}

export function ensureOmise(): NonNullable<Window["Omise"]> {
  if (!window.Omise) {
    throw new Error("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
  }
  window.Omise.setPublicKey(OMISE_PUBLIC_KEY);
  return window.Omise;
}

export function createPromptPaySource(amountSatang: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const Omise = ensureOmise();
    Omise.createSource(
      "promptpay",
      { amount: amountSatang, currency: "THB" },
      (statusCode, response) => {
        if (statusCode === 200 && response.id) {
          resolve(response.id);
        } else {
          reject(new Error(response.message || "ไม่สามารถสร้าง PromptPay ได้"));
        }
      },
    );
  });
}
