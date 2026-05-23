const PHONE_COOKIE = "member_phone";
const TOKEN_COOKIE = "token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function saveSession(phone: string, token?: string) {
  document.cookie = `${PHONE_COOKIE}=${encodeURIComponent(phone)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${TOKEN_COOKIE}=${token ?? `session-${phone}`}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getPhoneFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${PHONE_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function clearSession() {
  document.cookie = `${PHONE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => row.startsWith(`${TOKEN_COOKIE}=`));
}
