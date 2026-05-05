"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import ReportCard from "@/components/dashboard/ReportCard";
import CouponTable from "@/components/customers/CouponTable";
import CustomerTable from "@/components/customers/CustomerTable";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { listCoupons, listCustomers, type ApiCustomer } from "@/lib/admin-api";
import { apiCouponToUiRow, summarizeCustomers } from "@/lib/admin-mappers";
import { useLang } from "@/lib/i18n/lang";

function CustomersPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openExportModal, openCreateCoupon } = useUI();
  const { t } = useLang();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [activeCoupons, setActiveCoupons] = useState<number | null>(null);
  const [customerItems, setCustomerItems] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = listQuery.trim();
      const [custRes, coupRes] = await Promise.all([
        listCustomers({
          page: 1,
          per_page: 2000,
          ...(q ? { q } : {}),
        }),
        listCoupons({ page: 1, per_page: 500 }),
      ]);
      const { totalPoints: tp } = summarizeCustomers(custRes.items);
      setMemberCount(custRes.total);
      setTotalPoints(tp);
      setCustomerItems(custRes.items);
      const now = new Date();
      const active = coupRes.items.filter((c) => {
        if (!c.is_active) return false;
        if (!c.expire_date) return true;
        return new Date(c.expire_date) >= now;
      }).length;
      setActiveCoupons(active);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("page.customers.error.loadFailed"));
      setMemberCount(null);
      setTotalPoints(null);
      setActiveCoupons(null);
      setCustomerItems([]);
    } finally {
      setLoading(false);
    }
  }, [listQuery, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const customerSections: ExportSection[] = useMemo(
    () => [
      {
        id: "customer_metrics",
        label: t("page.customers.export.metricsTitle"),
        description: t("page.customers.export.metricsDesc"),
        columns: [
          { key: "metric", label: t("page.dashboard.export.col.topic") },
          { key: "value", label: t("page.dashboard.export.col.value") },
        ],
        fetchData: async () => {
          const custRes = await listCustomers({ page: 1, per_page: 2000 });
          const coupRes = await listCoupons({ page: 1, per_page: 500 });
          const { totalPoints: tp } = summarizeCustomers(custRes.items);
          const now = new Date();
          const active = coupRes.items.filter((c) => {
            if (!c.is_active) return false;
            if (!c.expire_date) return true;
            return new Date(c.expire_date) >= now;
          }).length;
          return [
            {
              metric: t("page.customers.export.metric.totalMembers"),
              value: `${custRes.total.toLocaleString()} ${t("page.customers.export.units.people")}`,
            },
            {
              metric: t("page.customers.export.metric.totalPoints"),
              value: `${tp.toLocaleString()} Pts`,
            },
            {
              metric: t("page.customers.export.metric.activeCoupons"),
              value: `${active} ${t("page.customers.export.units.items")}`,
            },
            {
              metric: t("page.customers.export.metric.couponsUsedMonth"),
              value: t("page.customers.export.units.notInApi"),
            },
          ];
        },
      },
      {
        id: "coupons_list",
        label: t("page.customers.export.couponsTitle"),
        description: t("page.customers.export.couponsDesc"),
        columns: [
          { key: "id", label: t("page.customers.export.col.couponId") },
          { key: "name", label: t("page.customers.export.col.couponName") },
          { key: "type", label: t("page.customers.export.col.couponType") },
          { key: "points_cost", label: t("page.customers.export.col.couponPoints") },
          { key: "usage", label: t("page.customers.export.col.couponUsage") },
          { key: "maxUsage", label: t("page.customers.export.col.couponMaxUsage") },
          { key: "expiry", label: t("page.customers.export.col.couponExpiry") },
          { key: "status", label: t("page.customers.export.col.couponStatus") },
        ],
        fetchData: async () => {
          const res = await listCoupons({ page: 1, per_page: 500 });
          return res.items.map((c) => {
            const r = apiCouponToUiRow(c);
            return {
              id: r.id,
              name: r.name,
              type: r.type,
              points_cost: r.points_cost,
              usage: r.usage,
              maxUsage: r.maxUsage || "∞",
              expiry: r.expiry || "",
              status: r.status,
            };
          }) as Record<string, unknown>[];
        },
      },
    ],
    [t]
  );

  const fmt = (n: number | null) => (loading || n === null ? "…" : n.toLocaleString());

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[var(--text)] mb-2 tracking-tight">
            {t("page.customers.title")}
          </h1>
          <p className="text-[var(--text-muted)] text-[16px] font-medium">
            {t("page.customers.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => load()}
            className="px-6 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            {t("common.refresh")}
          </button>
          <button
            type="button"
            onClick={() => openExportModal(customerSections, t("page.customers.exportTitle"))}
            className="px-6 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>{t("page.customers.export")}</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateCoupon}
          >
            <i className="fi fi-rr-plus flex items-center"></i>
            {t("page.customers.createCoupon")}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-bold border"
          style={{ background: "var(--warn-bg)", color: "var(--text)", borderColor: "var(--border)" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-scale-in opacity-0 delay-100">
          <ReportCard
            title={t("page.customers.report.memberTotal")}
            value={fmt(memberCount)}
            subValue={t("page.customers.report.sub.people")}
            icon={<i className="fi fi-rr-users"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <ReportCard
            title={t("page.customers.report.points")}
            value={fmt(totalPoints)}
            subValue={t("page.customers.report.sub.pointsFromLoaded")}
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--primary)"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <ReportCard
            title={t("page.customers.report.couponUsedMonth")}
            value="—"
            subValue={t("page.customers.report.couponUsedMonthSub")}
            icon={<i className="fi fi-rr-ticket"></i>}
            iconBg="var(--success-bg)"
            iconColor="var(--success)"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-400">
          <ReportCard
            title={t("page.customers.report.couponAvailable")}
            value={fmt(activeCoupons)}
            subValue={t("page.customers.report.items")}
            icon={<i className="fi fi-rr-gift"></i>}
            iconBg="var(--surface-2)"
            iconColor="var(--chart-series-1)"
          />
        </div>
      </div>

      <div className="space-y-8 animate-in opacity-0 delay-500 pb-12">
        <CustomerTable customers={customerItems} loading={loading} error={error} />
        <div
          className="surface-card !rounded-[40px] overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <CouponTable />
        </div>
      </div>
    </PageWrapper>
  );
}

function CustomersPageFallback() {
  const { t } = useLang();
  return (
    <PageWrapper>
      <p className="px-4 py-16 text-center text-sm font-bold text-[var(--text-muted)]">{t("common.loading")}</p>
    </PageWrapper>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersPageFallback />}>
      <CustomersPageClient />
    </Suspense>
  );
}
