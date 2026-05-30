"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only: surfaces when the browser reports offline (e.g. DevTools Network → Offline).
 */
export function DevNetworkGuard() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-[var(--z-toast)] bg-destructive text-white text-center text-xs font-bold px-3 py-2 md:hidden"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      เบราว์เซอร์อยู่โหมด Offline — ปิด DevTools → Network → Offline แล้วรีเฟรช
    </div>
  );
}
