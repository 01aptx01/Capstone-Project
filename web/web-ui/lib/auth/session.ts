const PHONE_COOKIE = "member_phone";
const TOKEN_COOKIE = "token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function saveSession(phone: string, token: string) {
  if (!token) {
    throw new Error("access_token is required");
  }
  document.cookie = `${PHONE_COOKIE}=${encodeURIComponent(phone)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getPhoneFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${PHONE_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));
  if (!match) return null;
  const raw = match.slice(TOKEN_COOKIE.length + 1);
  return decodeURIComponent(raw);
}

export function clearSession() {
  document.cookie = `${PHONE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function isLoggedIn(): boolean {
  const token = getTokenFromCookie();
  return Boolean(
    token &&
      !token.startsWith("session-") &&
      !token.startsWith("dev-"),
  );
}
