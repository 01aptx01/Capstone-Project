"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import ReportCard from "@/components/dashboard/ReportCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesByLocation from "@/components/dashboard/SalesByLocation";
import SalesByFlavor from "@/components/dashboard/SalesByFlavor";
import HeaderDateSelector from "@/components/dashboard/HeaderDateSelector";
import { useUI } from "@/lib/context/UIContext";
import { useMemo } from "react";
import { useLang } from "@/lib/i18n/lang";

export default function ReportsPage() {
  const { openExportModal } = useUI();
  const { t } = useLang();

  const reportSections = useMemo(
    () => [
      {
        id: "reports_kpi",
        label: "KPI",
        description: t("page.reports.subtitle"),
        columns: [
          { key: "metric", label: t("page.orders.export.col.metric") },
          { key: "value", label: t("page.orders.export.col.value") },
          { key: "trend", label: "Trend" },
        ],
        fetchData: async () => [
          { metric: t("page.reports.card.totalSales"), value: "124,500", trend: "+18.5%" },
          { metric: t("page.reports.card.avgMachine"), value: "24,900", trend: "+5.2%" },
          { metric: t("page.reports.card.totalOrders"), value: "3,842", trend: "+12.0%" },
          { metric: t("page.reports.card.issues"), value: "12", trend: "↓" },
        ],
      },
      {
        id: "reports_by_location",
        label: t("salesByLocation.title"),
        description: t("salesByLocation.subtitle"),
        columns: [
          { key: "location", label: t("salesByLocation.title") },
          { key: "sales", label: t("page.reports.card.totalSales") },
          { key: "orders", label: t("page.reports.card.totalOrders") },
        ],
        fetchData: async () => [
          { location: "MOD PAO Building LX", sales: "52,300", orders: "1,540" },
          { location: "MOD PAO Building N7", sales: "41,200", orders: "1,245" },
          { location: "MOD PAO Canteen KFC", sales: "31,000", orders: "1,057" },
        ],
      },
    ],
    [t]
  );

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between animate-in opacity-0">
          <div>
            <h1 className="text-[32px] font-black text-[var(--text)] mb-2 tracking-tight">
              {t("page.reports.title")}
            </h1>
            <p className="text-[var(--text-muted)] text-[15px] font-medium">{t("page.reports.subtitle")}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openExportModal(reportSections, t("page.reports.exportTitle"))}
              className="btn-primary !py-3 !px-6"
            >
              <i className="fi fi-rr-download flex items-center"></i>
              {t("page.reports.export")}
            </button>
          </div>
        </div>
        <div className="flex justify-end animate-in opacity-0 delay-100 relative z-50">
          <HeaderDateSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="animate-in opacity-0 delay-100 h-full">
          <ReportCard
            isFeatured={true}
            title={t("page.reports.card.totalSales")}
            value="฿124,500"
            trend="18.5%"
            subValue={t("page.reports.card.totalSalesSub")}
          />
        </div>
        <div className="animate-in opacity-0 delay-200 h-full">
          <ReportCard
            title={t("page.reports.card.avgMachine")}
            value="฿24,900"
            subValue={t("page.reports.card.avgMachineSub")}
            trend="5.2%"
            icon={<i className="fi fi-rr-box-open"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-in opacity-0 delay-300 h-full">
          <ReportCard
            title={t("page.reports.card.totalOrders")}
            value="3,842"
            subValue={t("page.reports.card.ordersSub")}
            trend="12.0%"
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            iconBg="var(--success-bg)"
            iconColor="var(--success)"
          />
        </div>
        <div className="animate-in opacity-0 delay-400 h-full">
          <ReportCard
            title={t("page.reports.card.issues")}
            value="12"
            subValue={t("page.reports.card.issuesSub")}
            trend="2"
            trendDirection="down"
            icon={<i className="fi fi-rr-bolt"></i>}
            iconBg="var(--danger-bg)"
            iconColor="var(--danger)"
          />
        </div>
      </div>

      <div className="mb-8 animate-in opacity-0 delay-500">
        <RevenueChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8 animate-in opacity-0 delay-700 pb-16">
        <SalesByLocation />
        <SalesByFlavor />
      </div>
    </PageWrapper>
  );
}
