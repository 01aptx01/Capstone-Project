"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import {
  getAdminAlerts,
  getDashboardSummary,
  getSalesReport,
  listMachines,
} from "@/lib/admin-api";
import {
  mapDashboardStats,
  mapSalesReportToRechartsSeries,
  mapSalesSeriesToChartBuckets,
  type LiveChartBuckets,
  type RechartsSalesDatum,
  type UiDashboardStatCards,
} from "@/lib/admin-mappers";
import { useLang } from "@/lib/i18n/lang";
import { AlertTriangle, ShoppingCart, Store, TrendingUp } from "lucide-react";

const SALES_REPORT_DAYS = 30;

export default function Home() {
  const { openExportModal } = useUI();
  const { t, href } = useLang();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UiDashboardStatCards | null>(null);
  const [rechartsData, setRechartsData] = useState<RechartsSalesDatum[]>([]);
  const [liveBuckets, setLiveBuckets] = useState<LiveChartBuckets | null>(null);
  const [topProductNames, setTopProductNames] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, sales, machinesRes, alerts] = await Promise.all([
        getDashboardSummary(),
        getSalesReport(SALES_REPORT_DAYS),
        listMachines({ page: 1, per_page: 100 }),
        getAdminAlerts(),
      ]);

      setStats(
        mapDashboardStats({
          summary,
          salesReport: sales,
          machinesTotal: machinesRes.total,
          lowStockCount: alerts.low_stock.length,
        })
      );
      setRechartsData(mapSalesReportToRechartsSeries(sales));
      setLiveBuckets(mapSalesSeriesToChartBuckets(sales));
      setTopProductNames(summary.top_products.map((p) => p.name).slice(0, 5));
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("page.dashboard.errorLoad"));
      setStats(null);
      setRechartsData([]);
      setLiveBuckets(null);
      setTopProductNames([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const dashboardSections: ExportSection[] = useMemo(() => {
    const s = stats;
    return [
      {
        id: "overview",
        label: t("page.dashboard.export.overview"),
        description: t("page.dashboard.export.overviewDesc"),
        columns: [
          { key: "metric", label: t("page.dashboard.export.col.topic") },
          { key: "value", label: t("page.dashboard.export.col.value") },
        ],
        fetchData: async () => [
          {
            metric: t("page.dashboard.export.metric.salesToday"),
            value: s?.salesTodayLabel ?? "—",
          },
          {
            metric: t("page.dashboard.export.metric.ordersToday"),
            value: s != null ? String(s.ordersToday) : "—",
          },
          {
            metric: t("page.dashboard.export.metric.machinesOnline"),
            value: s != null ? `${s.machinesOnline} / ${s.machinesTotal}` : "—",
          },
          {
            metric: t("page.dashboard.export.metric.lowStock"),
            value: s != null ? String(s.lowStockCount) : "—",
          },
        ],
      },
      {
        id: "sales_series",
        label: t("page.dashboard.export.salesSeries"),
        description: t("page.dashboard.export.salesSeriesDesc").replace(
          "{days}",
          String(SALES_REPORT_DAYS)
        ),
        columns: [
          { key: "date", label: t("page.dashboard.export.col.date") },
          { key: "revenue", label: t("page.dashboard.export.col.revenue") },
          { key: "orders", label: t("page.dashboard.export.col.orders") },
        ],
        fetchData: async () =>
          rechartsData.map((row) => ({
            date: row.date,
            revenue: String(row.revenue),
            orders: String(row.count),
          })),
      },
      {
        id: "top_products",
        label: t("page.dashboard.export.topProducts"),
        description: t("page.dashboard.export.topProductsDesc"),
        columns: [
          { key: "rank", label: t("page.dashboard.export.col.rank") },
          { key: "name", label: t("page.dashboard.export.col.name") },
        ],
        fetchData: async () =>
          topProductNames.map((name, i) => ({ rank: String(i + 1), name })),
      },
    ];
  }, [stats, rechartsData, topProductNames, t]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text)] mb-1">
            {t("page.dashboard.title")}
          </h1>
          <p className="text-[var(--text-muted)] text-[15px]">
            {t("page.dashboard.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl font-bold text-sm text-[var(--text)] disabled:opacity-50"
          >
            {t("common.refresh")}
          </button>
          <button
            type="button"
            onClick={() => openExportModal(dashboardSections, t("page.dashboard.exportModalTitle"))}
            className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-contrast)] px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(244,123,42,0.15)] transition-all"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {t("common.export")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 text-amber-900 text-sm font-bold">
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="mb-6 text-[var(--text)] font-bold text-sm">{t("page.dashboard.loading")}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 items-stretch">
        <div className="animate-scale-in opacity-0">
          <DashboardCard
            title={t("page.dashboard.card.salesToday")}
            value={stats?.salesTodayLabel ?? "—"}
            icon={
              <TrendingUp className="size-7 shrink-0" strokeWidth={2.25} aria-hidden />
            }
            accentColor="var(--chart-series-1)"
            href={href("/sales")}
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-100">
          <DashboardCard
            title={t("page.dashboard.card.ordersToday")}
            value={stats != null ? stats.ordersToday : "—"}
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            accentColor="var(--success)"
            href={href("/orders")}
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <DashboardCard
            title={t("page.dashboard.card.machinesReady")}
            value={stats != null ? stats.machinesOnline : "—"}
            subValue={stats != null ? `/ ${stats.machinesTotal}` : undefined}
            icon={<Store className="size-7 shrink-0" strokeWidth={2.25} aria-hidden />}
            accentColor="var(--warn)"
            href={href("/machines")}
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <DashboardCard
            title={t("page.dashboard.card.lowStock")}
            value={stats != null ? stats.lowStockCount : "—"}
            icon={
              <AlertTriangle className="size-7 shrink-0" strokeWidth={2.25} aria-hidden />
            }
            accentColor="var(--danger)"
            href={href("/alerts")}
          />
        </div>
      </div>

      <div className="mb-8">
        <DashboardChart liveBuckets={liveBuckets} salesSeriesData={rechartsData} />
      </div>
    </PageWrapper>
  );
}
