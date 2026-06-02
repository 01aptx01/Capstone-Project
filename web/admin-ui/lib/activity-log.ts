import { jwtDecode } from "jwt-decode";

export interface AdminActivity {
  icon: string;
  color: string;
  bg: string;
  title: string;
  machine: string;
  time: string;
  timestamp: number;
  formattedTime: string;
}

export function logAdminActivity(action: {
  icon: string;
  color: string;
  bg: string;
  title: string;
  machine: string;
  time: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const token = localStorage.getItem("admin_token");
    let email = "default";
    if (token) {
      const decoded = jwtDecode<{ email?: string }>(token);
      email = decoded.email || "default";
    }
    const key = `admin_activities_${email}`;
    const existing: AdminActivity[] = JSON.parse(localStorage.getItem(key) || "[]");
    
    const now = new Date();
    const entry: AdminActivity = {
      ...action,
      timestamp: now.getTime(),
      formattedTime: now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    };
    
    existing.unshift(entry);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export function getAdminActivities(): AdminActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const token = localStorage.getItem("admin_token");
    let email = "default";
    if (token) {
      const decoded = jwtDecode<{ email?: string }>(token);
      email = decoded.email || "default";
    }
    const key = `admin_activities_${email}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
