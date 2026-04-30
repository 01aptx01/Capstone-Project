// lib/auth.ts

export const saveToken = (token: string) => {
  // เซ็ต cookie ให้ middleware อ่านได้ (ไม่ใช้ localStorage)
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const getToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
};

export const removeToken = () => {
  document.cookie = "token=; path=/; max-age=0";
};

export const isLoggedIn = () => !!getToken();