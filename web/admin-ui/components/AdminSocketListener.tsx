"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { getAdminSocket } from "@/lib/admin-socket";

type DashboardPayload = {
  type?: string;
  state?: string;
  machine_code?: string;
  job_id?: string;
  event_id?: number;
  ts?: number;
};

function isDashboardPayload(p: unknown): p is DashboardPayload {
  return typeof p === "object" && p !== null;
}

/**
 * Mounts once in the app shell: connects admin Socket.IO and listens for server events.
 */
export default function AdminSocketListener() {
  useEffect(() => {
    const s = getAdminSocket();

    const onDashboardUpdate = (payload: unknown) => {
      if (!isDashboardPayload(payload)) return;

      if (payload.type === "machine_event" && payload.state === "ERROR") {
        const mc = payload.machine_code ?? "ตู้";
        const jid = payload.job_id ?? "";
        const eid = payload.event_id;
        const dedupeKey =
          eid != null
            ? `admin-err-${eid}`
            : `admin-err-${mc}-${jid}-${payload.ts ?? ""}`;
        toast.error(
          <span>
            <strong>ข้อผิดพลาดจากตู้ {mc}</strong>
            <br />
            <span className="text-sm opacity-90">
              เปิดหน้า Alerts เพื่อตรวจสอบและ Resolve
              {jid ? ` (job: ${jid})` : ""}
            </span>
          </span>,
          {
            id: dedupeKey,
            duration: 6000,
          }
        );
      }

      if (process.env.NODE_ENV === "development") {
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
