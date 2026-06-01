"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { getAdminSocket } from "@/lib/admin-socket";
import { dispatchAdminAlertsRefresh } from "@/lib/admin-alerts-refresh";
import { useLang } from "@/lib/i18n/lang";

type DashboardPayload = {
  type?: string;
  state?: string;
  machine_code?: string;
  job_id?: string;
  event_id?: number;
  ts?: number;
};

type ForceLogoutPayload = {
  admin_id?: number;
  email?: string;
};

function isDashboardPayload(p: unknown): p is DashboardPayload {
  return typeof p === "object" && p !== null;
}

export default function AdminSocketListener() {
  const { t } = useLang();

  useEffect(() => {
    const s = getAdminSocket();

    const onDashboardUpdate = (payload: unknown) => {
      if (!isDashboardPayload(payload)) return;

      if (payload.type === "machine_event" && payload.state === "ERROR") {
        dispatchAdminAlertsRefresh();
        const mc = payload.machine_code ?? "—";
        const jid = payload.job_id ?? "";
        const eid = payload.event_id;
        const dedupeKey =
          eid != null
            ? `admin-err-${eid}`
            : `admin-err-${mc}-${jid}-${payload.ts ?? ""}`;
        toast.error(
          <span>
            <strong>{t("alerts.toast.machineErrorTitle").replace("{code}", mc)}</strong>
            <br />
            <span className="text-sm opacity-90">
              {t("alerts.toast.openAlerts")}
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

    const onForceLogout = (payload: unknown) => {
      if (typeof payload !== "object" || payload === null) return;
      const data = payload as ForceLogoutPayload;

      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const jwtPayload = JSON.parse(atob(token.split(".")[1]));
        const myAdminId = jwtPayload.sub;

        if (data.admin_id === myAdminId) {
          localStorage.removeItem("admin_token");
          sessionStorage.removeItem("reg_token");

          toast.error("Your admin access has been revoked.", {
            id: "force-logout",
            duration: 5000,
          });

          setTimeout(() => {
            window.location.assign("/login");
          }, 1500);
        }
      } catch {
        // ignore
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
    s.on("admin_force_logout", onForceLogout);
    s.on("connect", onConnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("dashboard_update", onDashboardUpdate);
      s.off("admin_force_logout", onForceLogout);
      s.off("connect", onConnect);
      s.off("connect_error", onConnectError);
    };
  }, [t]);

  return null;
}
