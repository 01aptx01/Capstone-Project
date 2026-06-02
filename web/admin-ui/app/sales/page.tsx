"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { useRouter } from "next/navigation";
import ReportCard from "@/components/dashboard/ReportCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardSummary, getSalesReport, listOrders } from "@/lib/admin-api";
import type { ApiOrderListItem } from "@/lib/admin-api";
import { localDateISO } from "@/lib/admin-mappers";
import { useLang } from "@/lib/i18n/lang";

export default function SalesPage() {
  const { openExportModal } = useUI();
  const { t } = useLang();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [yesterdaySales, setYesterdaySales] = useState<number>(0);
  const [todayOrderCount, setTodayOrderCount] = useState<number>(0);
  const [allOrders, setAllOrders] = useState<ApiOrderListItem[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");

  const todayISO = localDateISO();
  const yesterdayISO = localDateISO(new Date(Date.now() - 86_400_000));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, report, ordersRes] = await Promise.all([
        getDashboardSummary(),
        getSalesReport(2),
        listOrders({ page: 1, per_page: 500 }),
      ]);

      setTodaySales(summary.total_sales_today);

      const yRow = report.series.find((r) => r.date === yesterdayISO);
      const tRow = report.series.find((r) => r.date === todayISO);
      setYesterdaySales(yRow?.revenue ?? 0);
      setTodayOrderCount(tRow?.count ?? 0);

      setAllOrders(ordersRes.items);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("page.dashboard.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [todayISO, yesterdayISO, t]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const todayOrders = useMemo(
    () => allOrders.filter((o) => o.created_at?.startsWith(todayISO)),
    [allOrders, todayISO]
  );

  const machineCodes = useMemo(() => {
    const codes = new Set(todayOrders.map((o) => o.machine_code).filter(Boolean));
    return Array.from(codes).sort();
  }, [todayOrders]);

  const filteredOrders = useMemo(
    () =>
      selectedMachine === "all"
        ? todayOrders
        : todayOrders.filter((o) => o.machine_code === selectedMachine),
    [todayOrders, selectedMachine]
  );

  const changePercent = useMemo(() => {
    if (!yesterdaySales) return null;
    return ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  }, [todaySales, yesterdaySales]);

  const avgOrder = useMemo(
    () => (todayOrderCount > 0 ? todaySales / todayOrderCount : 0),
    [todaySales, todayOrderCount]
  );

  const salesSections: ExportSection[] = useMemo(
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
          { metric: t("page.sales.card.today"), value: `฿${todaySales.toFixed(2)}` },
          { metric: t("page.sales.card.yesterday"), value: `฿${yesterdaySales.toFixed(2)}` },
          {
            metric: "%",
            value: changePercent !== null ? `${changePercent.toFixed(1)}%` : "—",
          },
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
        fetchData: async () =>
          filteredOrders.map((o) => ({
            orderId: String(o.order_id),
            time: o.created_at ?? "—",
            machine: o.machine_code ?? "—",
            amount: o.total_price,
            status: o.status,
          })) as Record<string, unknown>[],
      },
    ],
    [todaySales, yesterdaySales, changePercent, filteredOrders, t]
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "paid")
      return (
        <span className="px-3 py-1 bg-[var(--success-bg)] text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
          {t("page.sales.badge.paid")}
        </span>
      );
    if (s === "dispensing" || s === "pending_payment")
      return (
        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
          {t("page.sales.badge.processing")}
        </span>
      );
    if (s === "refunded")
      return (
        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
          REFUNDED
        </span>
      );
    if (s === "cancelled" || s === "payment_failed" || s === "dispense_failed")
      return (
        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
          {t("page.sales.badge.failed")}
        </span>
      );
    return (
      <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text)] text-[11px] font-black uppercase tracking-wider rounded-lg border border-[var(--border)]">
        {status}
      </span>
    );
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between animate-in opacity-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[var(--text)] hover:border-[var(--primary)]/30 transition-all active:scale-95 shrink-0"
            aria-label="ย้อนกลับ"
          >
            <i className="fi fi-rr-arrow-small-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-[36px] font-black text-[var(--text)] mb-2 tracking-tight">
              {t("page.sales.title")}
            </h1>
            <p className="text-[var(--text-muted)] text-[16px] font-medium">
              {t("page.sales.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl font-bold text-sm text-[var(--text)] disabled:opacity-50"
          >
            {t("common.refresh")}
          </button>
          <button
            onClick={() => openExportModal(salesSections, t("page.sales.exportTitle"))}
            className="btn-primary"
          >
            <i className="fi fi-rr-download flex items-center"></i>
            {t("page.sales.export")}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-900 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard
            title={t("page.sales.card.today")}
            value={
              loading
                ? "…"
                : `฿${todaySales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
            }
            icon={<i className="fi fi-rr-stats"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
            trend={
              changePercent !== null
                ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`
                : undefined
            }
            trendDirection={
              changePercent !== null
                ? changePercent >= 0
                  ? "up"
                  : "down"
                : undefined
            }
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard
            title={t("page.sales.card.yesterday")}
            value={
              loading
                ? "…"
                : `฿${yesterdaySales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
            }
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard
            title={t("page.sales.card.avgOrder")}
            value={
              loading
                ? "…"
                : `฿${avgOrder.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
            }
            icon={<i className="fi fi-rr-receipt"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
      </div>

      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-400">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[var(--text)]">
            {t("page.sales.tableTitle")}
          </h2>
          <div className="relative">
            <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
            <select
              className="pl-11 pr-10 py-2.5 bg-[var(--surface-2)] border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer min-w-[200px] text-[var(--text)]"
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
              <option value="all">{t("page.sales.allLocations")}</option>
              {machineCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"></i>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-2)]/50">
                {[
                  t("page.sales.col.transactionId"),
                  t("page.sales.col.time"),
                  t("page.sales.col.machine"),
                  t("page.sales.col.amount"),
                  t("page.sales.col.status"),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="min-h-[320px]">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <p className="text-lg font-black text-[var(--text)]">
                      {t("page.orders.empty")}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
                      {t("page.orders.emptyHint")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.order_id}
                    className="group hover:bg-[var(--surface-2)]/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-[var(--text)]">
                        {String(o.order_id).padStart(5, "0")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-semibold text-[var(--text-muted)]">
                      {formatTime(o.created_at)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-box-alt text-[var(--text-muted)]"></i>
                        <span className="text-[14px] font-bold text-[var(--text)]">
                          {o.machine_code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[16px] font-black text-[var(--text)]">
                        ฿{Number(o.total_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(o.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-[var(--surface-2)]/30 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[13px] font-bold text-[var(--text-muted)]">
            {t("page.orders.footer")
              .replace("{loaded}", String(filteredOrders.length))
              .replace("{total}", String(todayOrders.length))}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
