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
 * Auth: when server sets ADMIN_SOCKET_SECRET, send auth.admin_token matching that value
 * (often stored in localStorage as `admin_token`). Otherwise dev mode accepts { role: "admin" }.
 */
export function getAdminSocket(): Socket {
  if (socket?.connected) return socket;

  const url = socketBaseUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const auth = token ? { admin_token: token } : { role: "admin" as const };

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
