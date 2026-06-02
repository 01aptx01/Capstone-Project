"use client";

import { api } from "./axios";

/** key เดียวกับที่ axios interceptor ใช้แนบ Bearer token */
export const TOKEN_KEY = "admin_token";

export type AdminInfo = {
  id: number;
  email: string;
  roles: string[];
};

// ─────────────────────────── token storage ───────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─────────────────────────── API ───────────────────────────

/** เข้าสู่ระบบด้วย email + password → เก็บ JWT ลง localStorage แล้วคืนข้อมูล admin */
export async function adminLogin(email: string, password: string): Promise<AdminInfo> {
  const { data } = await api.post<{ token: string; admin: AdminInfo }>(
    "/api/admin/login",
    { email, password }
  );
  setToken(data.token);
  return data.admin;
}

/** ดึงข้อมูล admin ปัจจุบัน (ใช้ตรวจว่า token ยังใช้ได้ — 401 จะถูก interceptor เด้งไป /login) */
export async function getMe(): Promise<AdminInfo> {
  const { data } = await api.get<{ admin: AdminInfo }>("/api/admin/me");
  return data.admin;
}

/** ออกจากระบบ — JWT เป็น stateless จึงแค่ลบ token ทิ้ง (เรียก API เผื่ออนาคต) */
export async function adminLogout(): Promise<void> {
  try {
    await api.post("/api/admin/logout");
  } catch {
    /* ignore — ออกจากระบบฝั่ง client พอ */
  } finally {
    clearToken();
  }
}

// ─────────────────────────── Invite / Register ───────────────────────────

export type InviteResult = {
  email: string;
  roles: string[];
  invite_link: string;
  emailed: boolean;
};

/** (superadmin) เชิญ admin ใหม่ผ่าน email → คืนลิงก์คำเชิญ + สถานะการส่งอีเมล */
export async function createInvite(email: string, roles: string[] = ["admin"]): Promise<InviteResult> {
  const { data } = await api.post<InviteResult>("/api/admin/invites", { email, roles });
  return data;
}

/** (superadmin) สร้างบัญชี admin ตรงๆ พร้อมรหัสผ่านชั่วคราว — ใช้งานได้ทันที */
export async function createAdmin(
  email: string,
  password: string,
  roles: string[] = ["admin"]
): Promise<{ email: string; roles: string[] }> {
  const { data } = await api.post<{ email: string; roles: string[] }>("/api/admin/admins", {
    email,
    password,
    roles,
  });
  return data;
}

/** ตรวจ invite token + คืนอีเมลที่ถูกเชิญ (หน้า register เรียกตอนเปิด) */
export async function verifyInvite(token: string): Promise<{ email: string; roles: string[] }> {
  const { data } = await api.get<{ email: string; roles: string[] }>(
    "/api/admin/invites/accept",
    { params: { token } }
  );
  return data;
}

/** ตั้งรหัสผ่านจาก invite token → สร้างบัญชี + auto-login (เก็บ token) */
export async function acceptInvite(token: string, password: string): Promise<AdminInfo> {
  const { data } = await api.post<{ token: string; admin: AdminInfo }>(
    "/api/admin/register",
    { token, password }
  );
  setToken(data.token);
  return data.admin;
}
