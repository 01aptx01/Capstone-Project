"use client";

import type { ApiCustomer } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

type Props = {
  customers: ApiCustomer[];
  loading?: boolean;
  error?: string | null;
};

export default function CustomerTable({ customers, loading, error }: Props) {
  const { t, lang } = useLang();
  const dateLocale = lang === "en" ? "en-GB" : "th-TH";
  return (
    <div className="bg-[var(--surface-1)]/40 backdrop-blur-3xl border border-[var(--border)]/60 rounded-[40px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.04)] animate-in fade-in duration-700">
      <div className="px-10 py-8 border-b border-[var(--border)]/40 bg-gradient-to-b from-[var(--surface-1)]/50 to-transparent">
        <h2 className="text-[22px] font-black text-[var(--text)] tracking-tight mb-1">{t("customer.table.title")}</h2>
        <p className="text-[var(--text-muted)] text-sm font-bold">
          {t("customer.table.apiNote")}{" "}
          <code className="text-xs font-mono bg-[var(--surface-2)] px-1 rounded">/api/admin/customers</code>
        </p>
      </div>
      {error && (
        <div className="mx-10 my-4 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)]/40 border-b border-[var(--border)]/40">
              <th className="px-10 py-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("customer.table.col.phone")}</th>
              <th className="px-6 py-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("customer.table.col.points")}</th>
              <th className="px-6 py-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("customer.table.col.status")}</th>
              <th className="px-10 py-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("customer.table.col.registered")}</th>
              <th className="px-10 py-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("customer.table.col.lastUse")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/30">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-10 py-14 text-center text-[var(--text-muted)] font-bold">
                  {t("common.loading")}
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-10 py-14 text-center text-[var(--text-muted)] font-bold">
                  {t("customer.table.empty")}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.user_id} className="hover:bg-[var(--surface-1)]/70 transition-colors">
                  <td className="px-10 py-4 font-black text-[var(--text)]">{c.phone_number}</td>
                  <td className="px-6 py-4 font-bold text-[var(--primary)]">{c.points?.toLocaleString?.() ?? c.points}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black uppercase px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-10 py-4 text-sm font-bold text-[var(--text)]">
                    {c.registered_at ? new Date(c.registered_at).toLocaleString(dateLocale) : "—"}
                  </td>
                  <td className="px-10 py-4 text-sm font-bold text-[var(--text)]">
                    {c.last_use ? new Date(c.last_use).toLocaleString(dateLocale) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-10 py-5 bg-[var(--surface-2)]/40 border-t border-[var(--border)]/40 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
        {t("customer.table.footer").replace("{n}", String(customers.length))}
      </div>
    </div>
  );
}
