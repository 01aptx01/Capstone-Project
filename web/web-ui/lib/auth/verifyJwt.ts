// lib/auth/verifyJwt.ts
// ─── JWT VERIFICATION (SERVER-SIDE) ─────────────────────────────────────────
// โมดูลสำหรับถอดรหัสและตรวจสอบความถูกต้องของ JWT Token (JSON Web Token) ฝั่ง Server
// ใช้สำหรับยืนยันความปลอดภัยและดึงเบอร์โทรศัพท์จาก payload ของ Token

import { jwtVerify } from "jose";

// กำหนดประเภทข้อมูลที่ถอดรหัสได้จาก JWT Payload (ในระบบเราคือเบอร์โทรศัพท์ของสมาชิก)
export type MemberJwtPayload = {
  phone_number: string;
};

/**
 * isLegacyClientToken
 * ตรวจสอบว่าคุกกี้ Token เป็นรูปแบบดั้งเดิมที่ใช้จำลองในฝั่ง Client หรือไม่ (เช่น session- หรือ dev-)
 * เพื่อทำการปฏิเสธ Token จำลองในระบบจริง
 */
export function isLegacyClientToken(token: string): boolean {
  return token.startsWith("session-") || token.startsWith("dev-");
}

/**
 * verifyMemberJwt
 * ฟังก์ชันสำหรับถอดรหัสและตรวจสอบความถูกต้องของ JWT Token
 * โดยเปรียบเทียบกับ JWT_SECRET คีย์ลับที่เซิร์ฟเวอร์หลังบ้านกำหนดไว้
 */
export async function verifyMemberJwt(
  token: string,
): Promise<MemberJwtPayload | null> {
  // ดึงค่าคีย์ลับของ JWT จาก Environment Variable
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || !token || isLegacyClientToken(token)) {
    return null;
  }

  try {
    // ใช้ไลบรารี jose ถอดรหัสลับด้วยอัลกอริทึม HS256
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );

    // ตรวจสอบว่า Token นี้ถูกสร้างขึ้นมาสำหรับสมาชิกทั่วไป (type === "member")
    if (payload.type !== "member") return null;
    
    // ตรวจสอบความถูกต้องของโครงสร้างเบอร์โทรศัพท์ (ความยาว 10 หลัก)
    const phone = payload.phone_number;
    if (typeof phone !== "string" || phone.length !== 10) return null;

    // คืนค่าเบอร์โทรศัพท์ที่ถอดรหัสสำเร็จ
    return { phone_number: phone };
  } catch (error) {
    // หากเกิดข้อผิดพลาดในการถอดรหัส (เช่น Token หมดอายุ หรือ Secret ไม่ตรง) จะส่งคืนค่า null
    console.error("JWT Verification failed:", error);
    return null;
  }
}

