// lib/payment/omise.ts
// ─── OMISE PAYMENT INTEGRATION ───────────────────────────────────────────────
// จัดการเชื่อมต่อกับระบบชำระเงินผู้ให้บริการภายนอก (Omise Gateway)
// ใช้สำหรับสร้างแหล่งการชำระเงินประเภท PromptPay QR Code บน Client-side

import { OMISE_PUBLIC_KEY } from "@/lib/config";

// ประกาศประเภทข้อมูลแบบ Global เพื่อให้ TypeScript รู้จักออบเจกต์ window.Omise ที่ดึงมาจากสคริปต์ภายนอก
declare global {
  interface Window {
    Omise?: {
      setPublicKey: (key: string) => void; // กำหนด Public Key ของร้านค้า
      createSource: (
        type: string,                      // ประเภทของช่องทางชำระ เช่น "promptpay"
        params: { amount: number; currency: string }, // ยอดเงินและสกุลเงิน
        callback: (statusCode: number, response: { id?: string; message?: string }) => void, // Callback ตอบกลับจาก Omise
      ) => void;
    };
  }
}

/**
 * ensureOmise
 * ตรวจสอบความพร้อมใช้งานของไลบรารี Omise.js บน Browser 
 * พร้อมกับตั้งค่า OMISE_PUBLIC_KEY เพื่อเริ่มต้นใช้งาน
 */
export function ensureOmise(): NonNullable<Window["Omise"]> {
  if (!window.Omise) {
    throw new Error("ระบบชำระเงิน (Omise.js) ยังไม่พร้อม");
  }
  window.Omise.setPublicKey(OMISE_PUBLIC_KEY);
  return window.Omise;
}

/**
 * createPromptPaySource
 * ฟังก์ชันสร้าง PromptPay Source ID จาก Omise สำหรับนำไปสร้าง QR Code บนตู้สินค้า
 * @param amountSatang ยอดเงินในหน่วยสตางค์ (เช่น 1000 สตางค์ = 10 บาท)
 */
export function createPromptPaySource(amountSatang: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. ตรวจสอบความพร้อมของ Omise.js
    const Omise = ensureOmise();
    
    // 2. เรียกฟังก์ชันสร้าง Source สำหรับช่องทาง PromptPay
    Omise.createSource(
      "promptpay",
      { amount: amountSatang, currency: "THB" },
      (statusCode, response) => {
        // 3. จัดการผลลัพธ์: หากสำเร็จ (Status 200) ส่ง Source ID กลับไป
        if (statusCode === 200 && response.id) {
          resolve(response.id);
        } else {
          // 4. หากล้มเหลว ส่งข้อผิดพลาดกลับไป
          reject(new Error(response.message || "ไม่สามารถสร้าง PromptPay ได้"));
        }
      },
    );
  });
}

