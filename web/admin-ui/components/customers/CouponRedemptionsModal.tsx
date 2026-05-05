"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listCouponRedemptions, type ApiCouponRedemption } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

type Props = {
  open: boolean;
  onClose: () => void;
  promotionId: number | null;
  code: string;
};

export default function CouponRedemptionsModal({ open, onClose, promotionId, code }: Props) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<ApiCouponRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMounted(true);
    else {
      const tmr = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(tmr);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !promotionId) return;
    setLoading(true);
    setError(null);
    listCouponRedemptions(promotionId)
      .then((res) => setItems(res.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [open, promotionId]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] w-full max-w-3xl max-h-[85vh] rounded-[28px] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[var(--text)]">{t("coupon.redemptionsTitle")}</h3>
            <p className="text-sm font-bold text-[var(--text-muted)] mt-1">
              <span className="font-mono text-[var(--text)]">{code}</span> · {t("coupon.redemptionsSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-4 py-2 rounded-xl border border-[var(--border)] font-black text-sm text-[var(--text)] hover:border-[var(--primary)]"
          >
            {t("coupon.redemptionsClose")}
          </button>
        </div>
        <div className="overflow-auto flex-1 p-6">
          {loading && <p className="text-sm font-bold text-[var(--text-muted)] text-center py-8">{t("coupon.loading")}</p>}
          {error && <p className="text-sm font-bold text-rose-600 text-center py-4">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-sm font-bold text-[var(--text-muted)] text-center py-8">{t("coupon.redemptionsEmpty")}</p>
          )}
          {!loading && !error && items.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="pb-3 pr-2">{t("coupon.redemptionsColUser")}</th>
                  <th className="pb-3 pr-2">{t("coupon.redemptionsColOrder")}</th>
                  <th className="pb-3 pr-2">{t("coupon.redemptionsColDate")}</th>
                  <th className="pb-3 pr-2">{t("coupon.redemptionsColAmount")}</th>
                  <th className="pb-3">{t("coupon.redemptionsColStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((row) => (
                  <tr key={`${row.order_id}-${row.charge_id ?? ""}`} className="font-semibold text-[var(--text)]">
                    <td className="py-3 pr-2">
                      {row.user_label === "unknown" ? (
                        <span className="text-[var(--text-muted)] italic">unknown</span>
                      ) : (
                        row.user_label
                      )}
                    </td>
                    <td className="py-3 pr-2 font-mono text-xs">{row.order_id}</td>
                    <td className="py-3 pr-2 text-xs">{row.created_at ? row.created_at.slice(0, 19).replace("T", " ") : "—"}</td>
                    <td className="py-3 pr-2">฿{Number(row.total_price).toFixed(2)}</td>
                    <td className="py-3 text-xs uppercase">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
