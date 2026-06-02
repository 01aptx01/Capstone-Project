import type { AdminAlertsResponse } from "./admin-api";
import type { DictKey } from "./i18n/dictionaries";

export const HEADER_ALERTS_MAX_ITEMS = 18;

export type HeaderNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export function mapAdminAlertsToHeaderNotifications(
  data: AdminAlertsResponse,
  t: (key: DictKey) => string,
): HeaderNotification[] {
  const errs = [...(data.machine_errors ?? [])].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });

  const lows = [...(data.low_stock ?? [])].sort((a, b) => {
    const mc = a.machine_code.localeCompare(b.machine_code);
    if (mc !== 0) return mc;
    return a.slot - b.slot;
  });

  const out: HeaderNotification[] = [];

  for (const ev of errs) {
    let title =
      [ev.event_type, ev.state].filter(Boolean).join(" · ") || t("page.alerts.sectionErrors");
    let body =
      `${t("page.alerts.machinePrefix")}${ev.machine_code}`.trim() +
      (ev.job_id ? ` · job ${ev.job_id}` : "");

    if (ev.event_type === "Machine Modified") {
      title = "การเปลี่ยนแปลงตู้สินค้า";
      const adminName = ev.payload?.admin_name || "Admin";
      body = `${adminName} ได้มีการเปลี่ยนแปลงตู้ ${ev.machine_code}`;
    }

    out.push({
      id: `err-${ev.id}`,
      title,
      body,
      time: ev.created_at ?? "",
      read: false,
    });
  }

  for (const r of lows) {
    const slotLine = t("page.alerts.slotLine")
      .replace("{machine}", r.machine_code)
      .replace("{slot}", String(r.slot));
    const qtyLine =
      r.quantity === 0
        ? t("manageStock.status.out")
        : t("page.alerts.remain").replace("{n}", String(r.quantity));
    out.push({
      id: `low-${r.machine_code}-${r.slot}-${r.product_id}`,
      title: r.product_name,
      body: `${slotLine} — ${qtyLine}`,
      time: "",
      read: false,
    });
  }

  return out.slice(0, HEADER_ALERTS_MAX_ITEMS);
}
