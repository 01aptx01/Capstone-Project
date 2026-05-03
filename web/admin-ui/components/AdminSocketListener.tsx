"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { getAdminSocket } from "@/lib/admin-socket";

/**
 * Mounts once in the app shell: connects admin Socket.IO and listens for server events.
 */
export default function AdminSocketListener() {
  useEffect(() => {
    const s = getAdminSocket();

    const onDashboardUpdate = (payload: unknown) => {
      if (process.env.NODE_ENV === "development") {
        toast("dashboard_update", { id: "dashboard_update", duration: 2000 });
        console.debug("[admin-socket] dashboard_update", payload);
      }
    };

    const onConnect = () => {
      if (process.env.NODE_ENV === "development") {
        console.debug("[admin-socket] connected", s.id);
      }
    };

    const onConnectError = (err: Error) => {
      console.warn("[admin-socket] connect_error", err.message);
    };

    s.on("dashboard_update", onDashboardUpdate);
    s.on("connect", onConnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("dashboard_update", onDashboardUpdate);
      s.off("connect", onConnect);
      s.off("connect_error", onConnectError);
    };
  }, []);

  return null;
}
