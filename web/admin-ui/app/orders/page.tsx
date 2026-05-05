"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { listOrders } from "@/lib/admin-api";
import type { ApiOrderListItem } from "@/lib/admin-api";
import { apiOrderToUiRow } from "@/lib/admin-mappers";
import { useLang } from "@/lib/i18n/lang";

function OrdersPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openExportModal } = useUI();
  const { t } = useLang();
  const [rows, setRows] = useState<ReturnType<typeof apiOrderToUiRow>[]>([]);
  const [rawItems, setRawItems] = useState<ApiOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = listQuery.trim();
      const res = await listOrders({
        page: 1,
        per_page: 500,
        ...(q ? { q } : {}),
      });
      setTotal(res.total);
      setRawItems(res.items);
      setRows(res.items.map(apiOrderToUiRow));
    } catch (e) {
      console.error(e);
      setRows([]);
      setRawItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const summary = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let revenue = 0;
    for (const o of rawItems) {
      const s = o.status.toLowerCase();
      revenue += Number(o.total_price) || 0;
      if (
        s === "pending_payment" ||
        s === "cancelled" ||
        s === "payment_failed"
      )
        pending++;
      if (s === "completed") completed++;
    }
    return { pending, completed, revenue };
  }, [rawItems]);

  const orderSections: ExportSection[] = useMemo(
    () => [
      {
        id: "orders_summary",
        label: t("page.orders.export.summaryLabel"),
        description: t("page.orders.export.summaryDesc"),
        columns: [
          { key: "metric", label: t("page.orders.export.col.metric") },
          { key: "value", label: t("page.orders.export.col.value") },
        ],
        fetchData: async () => [
          { metric: t("page.orders.export.metric.totalApi"), value: String(total) },
          { metric: t("page.orders.export.metric.pendingCancelled"), value: String(summary.pending) },
          { metric: t("page.orders.export.metric.completed"), value: String(summary.completed) },
          {
            metric: t("page.orders.export.metric.revenueApprox"),
            value: `฿${summary.revenue.toFixed(2)}`,
          },
        ],
      },
      {
        id: "orders_list",
        label: t("page.orders.export.listLabel"),
        description: t("page.orders.export.listDesc"),
        columns: [
          { key: "id", label: t("page.orders.col.orderId") },
          { key: "time", label: t("page.orders.col.time") },
          { key: "machine_code", label: t("page.orders.col.machine") },
          { key: "customer_phone", label: t("page.orders.col.customer") },
          { key: "payment_method", label: t("page.orders.col.payment") },
          { key: "items", label: t("page.orders.col.items") },
          { key: "amount", label: t("page.orders.col.total") },
          { key: "status", label: t("page.orders.col.status") },
        ],
        fetchData: async () => {
          const res = await listOrders({ page: 1, per_page: 500 });
          return res.items.map((o) => {
            const r = apiOrderToUiRow(o);
            return {
              id: r.id,
              time: r.time,
              machine_code: r.machine_code ?? "",
              customer_phone: r.customer_phone ?? "",
              payment_method: r.payment_method ?? "",
              items:
                r.lineCount > 0
                  ? t("page.orders.itemsLabel")
                      .replace("{lines}", String(r.lineCount))
                      .replace("{qty}", String(r.qtySum))
                  : "—",
              amount: r.amount,
              status: r.status,
            };
          }) as Record<string, unknown>[];
        },
      },
    ],
    [total, summary.pending, summary.completed, summary.revenue, t]
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed")
      return (
        <span className="px-3 py-1 bg-[var(--success-bg)] text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
          {t("page.orders.badge.completed")}
        </span>
      );
    if (s === "pending_payment" || s === "cancelled" || s === "payment_failed")
      return (
        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
          {status}
        </span>
      );
    if (s === "refunded")
      return (
        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
          {t("page.orders.badge.refunded")}
        </span>
      );
    return (
      <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text)] text-[11px] font-black uppercase tracking-wider rounded-lg border border-[var(--border)]">
        {status}
      </span>
    );
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[var(--text)] mb-2 tracking-tight">
            {t("page.orders.title")}
          </h1>
          <p className="text-[var(--text-muted)] text-[16px] font-medium">
            {t("page.orders.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl font-bold text-sm text-[var(--text)]"
          >
            {t("common.refresh")}
          </button>
          <button
            onClick={() => openExportModal(orderSections, t("page.orders.exportTitle"))}
            className="btn-primary"
          >
            <i className="fi fi-rr-download flex items-center"></i>
            {t("page.orders.export")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard
            title={t("page.orders.card.total")}
            value={loading ? "…" : String(total)}
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard
            title={t("page.orders.card.pending")}
            value={loading ? "…" : String(summary.pending)}
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="var(--surface-1)7ED"
            iconColor="var(--warn)"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard
            title={t("page.orders.card.completed")}
            value={loading ? "…" : String(summary.completed)}
            icon={<i className="fi fi-rr-check-circle"></i>}
            iconBg="var(--success-bg)"
            iconColor="var(--success)"
          />
        </div>
        <div className="animate-in opacity-0 delay-400">
          <ReportCard
            title={t("page.orders.card.revenue")}
            value={loading ? "…" : `฿${summary.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
      </div>

      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-500 min-h-[320px]">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[var(--text)]">{t("page.orders.tableTitle")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-2)]/50">
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.orderId")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.time")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.machine")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.customer")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.payment")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.items")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.total")}
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest text-left whitespace-nowrap">
                  {t("page.orders.col.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <div className="min-h-[320px]">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <p className="text-lg font-black text-[var(--text)]">{t("page.orders.empty")}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
                      {t("page.orders.emptyHint")}
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id} className="group hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-[var(--text)]">{o.id}</span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-semibold text-[var(--text-muted)] max-w-[200px] truncate">
                      {o.time}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold font-mono text-[var(--text)]">
                      {o.machine_code || "—"}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-[var(--text)]">
                      {o.customer_phone || "—"}
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-[var(--text)] uppercase">
                      {o.payment_method || "—"}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[14px] font-bold text-[var(--text)]">
                        {o.lineCount > 0
                          ? t("page.orders.itemsLabel")
                              .replace("{lines}", String(o.lineCount))
                              .replace("{qty}", String(o.qtySum))
                          : "—"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[16px] font-black text-[var(--text)]">
                        ฿{Number(o.amount).toFixed(2)}
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
            {t("page.orders.footer").replace("{loaded}", String(rows.length)).replace("{total}", String(total))}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

function OrdersPageFallback() {
  const { t } = useLang();
  return (
    <PageWrapper>
      <p className="px-4 py-16 text-center text-sm font-bold text-[var(--text-muted)]">{t("common.loading")}</p>
    </PageWrapper>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrdersPageClient />
    </Suspense>
  );
}
