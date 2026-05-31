// lib/auth/session.ts
// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
// โมดูลสำหรับจัดการคุกกี้ (Cookies) เพื่อบันทึกเบอร์โทรศัพท์และ JWT Token ของผู้ใช้ 
// ทำให้สมาชิกยังคงอยู่ในระบบได้แม้ปิดแท็บหรือรีโหลดหน้าเว็บ

const PHONE_COOKIE = "member_phone";        // ชื่อคุกกี้สำหรับเก็บเบอร์โทรศัพท์
const TOKEN_COOKIE = "token";               // ชื่อคุกกี้สำหรับเก็บ JWT Token
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;    // อายุของคุกกี้ (7 วัน ในหน่วยวินาที)

/**
 * saveSession
 * บันทึกเบอร์โทรศัพท์และ JWT Access Token ลงในคุกกี้เพื่อเริ่มการล็อกอินเข้าสู่ระบบ
 */
export function saveSession(phone: string, token: string) {
  if (!token) {
    throw new Error("access_token is required");
  }
  // กำหนดคุกกี้พร้อมตั้งค่า Max-Age และความปลอดภัยแบบ SameSite=Lax
  document.cookie = `${PHONE_COOKIE}=${encodeURIComponent(phone)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * getPhoneFromCookie
 * ดึงหมายเลขโทรศัพท์ของสมาชิกจากคุกกี้ (เฉพาะ Client-side)
 */
export function getPhoneFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${PHONE_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

/**
 * getTokenFromCookie
 * ดึง JWT Token จากคุกกี้ เพื่อนำไปใช้ระบุตัวตนในการยิง API (เฉพาะ Client-side)
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));
  if (!match) return null;
  const raw = match.slice(TOKEN_COOKIE.length + 1);
  return decodeURIComponent(raw);
}

/**
 * clearSession
 * ล้างข้อมูลในคุกกี้ทิ้งโดยตั้งค่าวันหมดอายุให้กลายเป็นอดีต (Epoch Time) เมื่อกดออกจากระบบ
 */
export function clearSession() {
  document.cookie = `${PHONE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * isLoggedIn
 * ตรวจสอบว่ามีผู้ใช้อยู่ในระบบหรือไม่ โดยพิจารณาจากความถูกต้องของ JWT Token ในปัจจุบัน
 */
export function isLoggedIn(): boolean {
  const token = getTokenFromCookie();
  return Boolean(
    token &&
      !token.startsWith("session-") &&
      !token.startsWith("dev-"),
  );
}

