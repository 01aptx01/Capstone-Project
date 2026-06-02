"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n/lang";
import { listOrders, listMachines, ApiOrderListItem, ApiMachineSummary } from "@/lib/admin-api";

export default function SalesPage() {
  const { openExportModal } = useUI();
  const { t } = useLang();
  
  const [loading, setLoading] = useState(true);
  const [rawItems, setRawItems] = useState<ApiOrderListItem[]>([]);
  const [machines, setMachines] = useState<ApiMachineSummary[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (machines.length === 0) {
        const machRes = await listMachines({ page: 1, per_page: 200 });
        setMachines(machRes.items);
      }

      const res = await listOrders({
        page: 1,
        per_page: 500,
        ...(selectedMachine !== "all" ? { machine_code: selectedMachine } : {}),
      });
      setRawItems(res.items);
    } catch (e) {
      console.error(e);
      setRawItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMachine, machines.length]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const stats = useMemo(() => {
    const getLocalDateString = (isoString: string | null) => {
      if (!isoString) return "";
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) {
          return isoString.split("T")[0];
        }
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      } catch {
        return isoString.split("T")[0];
      }
    };

    const today = new Date();
    const todayStr = getLocalDateString(today.toISOString());

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday.toISOString());

    let todaySales = 0;
    let yesterdaySales = 0;
    let totalSales = 0;
    let completedCount = 0;

    for (const order of rawItems) {
      if (order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "paid") {
        const amount = Number(order.total_price) || 0;
        totalSales += amount;
        completedCount++;

        if (order.created_at) {
          const orderDateStr = getLocalDateString(order.created_at);
          if (orderDateStr === todayStr) {
            todaySales += amount;
          } else if (orderDateStr === yesterdayStr) {
            yesterdaySales += amount;
          }
        }
      }
    }

    const avgOrder = completedCount > 0 ? totalSales / completedCount : 0;

    let changePercent = 0;
    if (yesterdaySales > 0) {
      changePercent = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
    } else if (todaySales > 0) {
      changePercent = 100;
    }

    return {
      todaySales,
      yesterdaySales,
      avgOrder,
      changePercent,
    };
  }, [rawItems]);

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
          { metric: t("page.sales.card.today"), value: `฿${stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { metric: t("page.sales.card.yesterday"), value: `฿${stats.yesterdaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { metric: "%", value: `${stats.changePercent.toFixed(1)}%` },
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
          rawItems.map((o) => ({
            orderId: `O${String(o.order_id).padStart(4, "0")}`,
            time: o.created_at || "—",
            machine: o.machine_code || "—",
            amount: o.total_price,
            status: o.status,
          })),
      },
    ],
    [t, stats, rawItems]
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
      case "paid":
        return (
          <span className="px-3 py-1 bg-[var(--success-bg)] text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
            {t("page.sales.badge.paid")}
          </span>
        );
      case "dispensing":
      case "pending_payment":
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
            {t("page.sales.badge.processing")}
          </span>
        );
      case "cancelled":
      case "payment_failed":
      case "dispense_failed":
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
            {t("page.sales.badge.failed")}
          </span>
        );
      case "refunded":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-gray-200">
            REFUNDED
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

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      
      const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
      const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${dateStr} ${timeStr}`;
    } catch {
      return isoString;
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
            value={loading ? "…" : `฿${stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<i className="fi fi-rr-stats"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
            trend={`${stats.changePercent.toFixed(1)}%`}
            trendDirection={stats.changePercent >= 0 ? "up" : "down"}
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard
            title={t("page.sales.card.yesterday")}
            value={loading ? "…" : `฿${stats.yesterdaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard
            title={t("page.sales.card.avgOrder")}
            value={loading ? "…" : `฿${stats.avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<i className="fi fi-rr-receipt"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
      </div>

      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-400">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[var(--text)]">{t("page.sales.tableTitle")}</h2>
          <div className="flex gap-4">
            <div className="relative">
              <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
              <select 
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="pl-11 pr-10 py-2.5 bg-[var(--surface-2)] border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">{t("page.sales.allLocations")}</option>
                {machines.map((m) => (
                  <option key={m.machine_code} value={m.machine_code}>
                    {m.location ? `${m.location} (${m.machine_code})` : m.machine_code}
                  </option>
                ))}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="min-h-[320px]">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : rawItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <p className="text-lg font-black text-[var(--text)]">{t("page.orders.empty")}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
                      {t("page.orders.emptyHint")}
                    </p>
                  </td>
                </tr>
              ) : (
                rawItems.map((tx) => (
                  <tr key={tx.order_id} className="group hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-[var(--text)]">
                        {`O${String(tx.order_id).padStart(4, "0")}`}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-semibold text-[var(--text-muted)]">
                      {formatTime(tx.created_at)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-vending-machine text-[var(--text-muted)]"></i>
                        <span className="text-[14px] font-bold text-[var(--text)]">
                          {tx.machine_code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[16px] font-black text-[var(--text)]">
                        ฿{Number(tx.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(tx.status)}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="w-10 h-10 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-orange-200 transition-all shadow-sm">
                        <i className="fi fi-rr-arrow-right text-lg"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-[var(--surface-2)]/30 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[13px] font-black text-[var(--text-muted)] uppercase tracking-wider">
            {t("page.sales.pagination").replace("{current}", "1").replace("{total}", String(Math.ceil(rawItems.length / 500) || 1))}
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
