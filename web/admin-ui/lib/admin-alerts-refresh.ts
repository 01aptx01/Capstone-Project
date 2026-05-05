/** ชื่อ event บน window — Header ฟังเพื่อ refetch รายการแจ้งเตือนจาก API */
export const ADMIN_ALERTS_REFRESH_EVENT = "modpao:admin-alerts-refresh";

export function dispatchAdminAlertsRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_ALERTS_REFRESH_EVENT));
}
