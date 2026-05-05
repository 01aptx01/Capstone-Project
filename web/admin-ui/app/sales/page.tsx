"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import salesData from "@/lib/mock/sales.json";
import { useUI } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";
import { useMemo } from "react";
import { useLang } from "@/lib/i18n/lang";

export default function SalesPage() {
  const { openExportModal } = useUI();
  const { t } = useLang();
  const data = salesData;

  const salesSections = useMemo(
    () => [
      {
        id: "sales_summary",
        label: t("page.sales.exportTitle"),
        description: t("page.sales.subtitle"),
        columns: [
          { key: "metric", label: t("page.orders.export.col.metric") },
          { key: "value", label: t("page.orders.export.col.value") },
        ],
        fetchData: async () => [
          { metric: t("page.sales.card.today"), value: String(salesData.summary.today) },
          { metric: t("page.sales.card.yesterday"), value: String(salesData.summary.yesterday) },
          { metric: "%", value: String(salesData.summary.change_percent) },
        ],
      },
      {
        id: "transactions",
        label: t("page.sales.tableTitle"),
        description: t("page.sales.subtitle"),
        columns: [
          { key: "orderId", label: t("page.sales.col.transactionId") },
          { key: "time", label: t("page.sales.col.time") },
          { key: "machine", label: t("page.sales.col.machine") },
          { key: "amount", label: t("page.sales.col.amount") },
          { key: "status", label: t("page.sales.col.status") },
        ],
        fetchData: async () => salesData.transactions as Record<string, unknown>[],
      },
    ],
    [t]
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="px-3 py-1 bg-[var(--success-bg)] text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
            {t("page.sales.badge.paid")}
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
            {t("page.sales.badge.processing")}
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
            {t("page.sales.badge.failed")}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text)] text-[11px] font-black uppercase tracking-wider rounded-lg border border-[var(--border)]">
            {status}
          </span>
        );
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[var(--text)] mb-2 tracking-tight">
            {t("page.sales.title")}
          </h1>
          <p className="text-[var(--text-muted)] text-[16px] font-medium">{t("page.sales.subtitle")}</p>
        </div>
        <button onClick={() => openExportModal(salesSections, t("page.sales.exportTitle"))} className="btn-primary">
          <i className="fi fi-rr-download flex items-center"></i>
          {t("page.sales.export")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard
            title={t("page.sales.card.today")}
            value={`฿${data.summary.today.toLocaleString()}`}
            icon={<i className="fi fi-rr-stats"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
            trend={`${data.summary.change_percent}%`}
            trendDirection={data.summary.change_percent >= 0 ? "up" : "down"}
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard
            title={t("page.sales.card.yesterday")}
            value={`฿${data.summary.yesterday.toLocaleString()}`}
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard
            title={t("page.sales.card.avgOrder")}
            value="฿42.50"
            icon={<i className="fi fi-rr-receipt"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
            trend="2.4%"
          />
        </div>
      </div>

      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-400">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[var(--text)]">{t("page.sales.tableTitle")}</h2>
          <div className="flex gap-4">
            <div className="relative">
              <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
              <select className="pl-11 pr-10 py-2.5 bg-[var(--surface-2)] border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer min-w-[200px]">
                <option>{t("page.sales.allLocations")}</option>
                <option>MOD PAO Building LX</option>
                <option>MOD PAO Building N7</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"></i>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-2)]/50">
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.sales.col.transactionId")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.sales.col.time")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.sales.col.machine")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.sales.col.amount")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.sales.col.status")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right whitespace-nowrap">
                  {t("page.sales.col.details")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.transactions.map(
                (tx: { orderId: string; time: string; machine: string; amount: number; status: string }) => (
                  <tr key={tx.orderId} className="group hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-[var(--text)]">{tx.orderId}</span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-semibold text-[var(--text-muted)]">{tx.time}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-vending-machine text-[var(--text-muted)]"></i>
                        <span className="text-[14px] font-bold text-[var(--text)]">{tx.machine}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[16px] font-black text-[var(--text)]">
                        ฿{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(tx.status)}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="w-10 h-10 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-orange-200 transition-all shadow-sm">
                        <i className="fi fi-rr-arrow-right text-lg"></i>
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-[var(--surface-2)]/30 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[13px] font-black text-[var(--text-muted)] uppercase tracking-wider">
            {t("page.sales.pagination").replace("{current}", "1").replace("{total}", "42")}
          </p>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-[13px] font-black text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-all">
              {t("page.sales.previous")}
            </button>
            <button className="px-5 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-[13px] font-black text-[var(--text)] hover:bg-[var(--surface-2)] transition-all">
              {t("page.sales.next")}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
