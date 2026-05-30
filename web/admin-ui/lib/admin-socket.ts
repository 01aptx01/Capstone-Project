import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function socketBaseUrl(): string {
  const u =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_URL ||
    "http://localhost:8000";
  return u.replace(/\/$/, "");
}

/**
 * Singleton Socket.IO client for admin dashboard.
 * Auth: ส่ง JWT ของ admin (จาก localStorage `admin_token`) ไปทาง auth.admin_token
 * ฝั่ง server จะ decode + ตรวจ JWT ก่อนให้เข้าห้อง admin (ดู _verify_admin_auth)
 */
export function getAdminSocket(): Socket {
  if (socket?.connected) return socket;

  const url = socketBaseUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  // ส่ง JWT เสมอ (ถ้าไม่มี token จะถูก server ปฏิเสธ — ถูกต้องเพราะต้อง login ก่อน)
  const auth = { admin_token: token || "" };

  socket = io(url, {
    path: "/socket.io/",
    auth,
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectAdminSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
