"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
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

const SALES_REPORT_DAYS = 30;

export default function Home() {
  const { openExportModal } = useUI();
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
      setError(e instanceof Error ? e.message : "โหลดแดชบอร์ดไม่สำเร็จ");
      setStats(null);
      setRechartsData([]);
      setLiveBuckets(null);
      setTopProductNames([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        label: "ข้อมูลภาพรวม (Overview Stats)",
        description: "ยอดขายรวม, จำนวนคำสั่งซื้อ, และตู้ที่พร้อมใช้งาน",
        columns: [
          { key: "metric", label: "หัวข้อ" },
          { key: "value", label: "ค่าที่ได้" },
        ],
        fetchData: async () => [
          {
            metric: "ยอดขายวันนี้ (สำเร็จ)",
            value: s?.salesTodayLabel ?? "—",
          },
          {
            metric: "จำนวนออเดอร์วันนี้ (สำเร็จ)",
            value: s != null ? String(s.ordersToday) : "—",
          },
          {
            metric: "ตู้ออนไลน์ / ทั้งหมด",
            value: s != null ? `${s.machinesOnline} / ${s.machinesTotal}` : "—",
          },
          {
            metric: "แจ้งเตือนสต็อกต่ำ (ช่อง)",
            value: s != null ? String(s.lowStockCount) : "—",
          },
        ],
      },
      {
        id: "sales_series",
        label: "ยอดขายรายวัน (Sales series)",
        description: `ช่วง ${SALES_REPORT_DAYS} วันล่าสุดจาก /api/admin/reports/sales`,
        columns: [
          { key: "date", label: "วันที่" },
          { key: "revenue", label: "รายได้ (฿)" },
          { key: "orders", label: "ออเดอร์" },
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
        label: "สินค้าขายดี (จาก summary)",
        description: "Top จาก /api/admin/dashboard/summary",
        columns: [{ key: "rank", label: "#" }, { key: "name", label: "ชื่อ" }],
        fetchData: async () =>
          topProductNames.map((name, i) => ({ rank: String(i + 1), name })),
      },
    ];
  }, [stats, rechartsData, topProductNames]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#334155] mb-1">
            แดชบอร์ดภาพรวม
          </h1>
          <p className="text-[#64748B] text-[15px]">
            ภาพรวมข้อมูลการทำงานของตู้ทั้งหมด รายงานและสถิติวิเคราะห์ประสิทธิภาพการทำงานและแนวโน้มยอดขายเชิงลึก
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-[#334155] disabled:opacity-50"
          >
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={() => openExportModal(dashboardSections, "ภาพรวม Dashboard")}
            className="flex items-center gap-2 bg-[#f47b2a] hover:bg-[#d35e11] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(244,123,42,0.15)] transition-all"
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
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 text-amber-900 text-sm font-bold">
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="mb-6 text-slate-500 font-bold text-sm">กำลังโหลดข้อมูลแดชบอร์ด…</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        <div className="animate-scale-in opacity-0">
          <DashboardCard
            title="ยอดขายวันนี้"
            value={stats?.salesTodayLabel ?? "—"}
            icon={<i className="fi fi-rr-stats"></i>}
            accentColor="#3b82f6"
            href="/sales"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-100">
          <DashboardCard
            title="จำนวนคำสั่งซื้อ (วันนี้)"
            value={stats != null ? stats.ordersToday : "—"}
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            accentColor="#10b981"
            href="/orders"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <DashboardCard
            title="ตู้ที่พร้อมใช้งาน"
            value={stats != null ? stats.machinesOnline : "—"}
            subValue={stats != null ? `/ ${stats.machinesTotal}` : undefined}
            icon={<i className="fi fi-rr-vending-machine"></i>}
            accentColor="#f59e0b"
            href="/machines"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <DashboardCard
            title="แจ้งเตือนสต็อกต่ำ"
            value={stats != null ? stats.lowStockCount : "—"}
            icon={<i className="fi fi-rr-warning"></i>}
            accentColor="#ef4444"
            href="/alerts"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <RevenueChart data={rechartsData} loading={loading && rechartsData.length === 0} />
        <DashboardChart liveBuckets={liveBuckets} />
      </div>
    </PageWrapper>
  );
}
