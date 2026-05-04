"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import ReportCard from "@/components/dashboard/ReportCard";
import CouponTable, { ADMIN_COUPON_CREATE_OPEN_EVENT } from "@/components/customers/CouponTable";
import CustomerTable from "@/components/customers/CustomerTable";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { listCoupons, listCustomers, type ApiCustomer } from "@/lib/admin-api";
import { apiCouponToUiRow, summarizeCustomers } from "@/lib/admin-mappers";

function CustomersPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openExportModal } = useUI();
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
      setError(e instanceof Error ? e.message : "โหลดข้อมูลลูกค้าไม่สำเร็จ");
      setMemberCount(null);
      setTotalPoints(null);
      setActiveCoupons(null);
      setCustomerItems([]);
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const customerSections: ExportSection[] = useMemo(
    () => [
      {
        id: "customer_metrics",
        label: "สรุปข้อมูลลูกค้า (Customer Metrics)",
        description: "จำนวนสมาชิกและพอยท์จาก API (รายการที่โหลด)",
        columns: [
          { key: "metric", label: "หัวข้อ" },
          { key: "value", label: "ค่า" },
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
            { metric: "สมาชิกทั้งหมด (API total)", value: `${custRes.total.toLocaleString()} คน` },
            { metric: "พอยท์รวม (จากรายการที่โหลด)", value: `${tp.toLocaleString()} Pts` },
            { metric: "คูปองที่ใช้ได้ (active + ยังไม่หมดอายุ)", value: `${active} รายการ` },
            { metric: "คูปองถูกใช้ (เดือนนี้)", value: "— (ยังไม่มี endpoint)" },
          ];
        },
      },
      {
        id: "coupons_list",
        label: "รายการคูปอง (Coupons)",
        description: "คูปองทั้งหมดในระบบ",
        columns: [
          { key: "id", label: "รหัสคูปอง" },
          { key: "name", label: "ชื่อคูปอง" },
          { key: "type", label: "ประเภท" },
          { key: "points_cost", label: "แต้มที่ใช้แลก" },
          { key: "usage", label: "ถูกใช้แล้ว" },
          { key: "maxUsage", label: "ใช้ได้สูงสุด" },
          { key: "expiry", label: "วันหมดอายุ" },
          { key: "status", label: "สถานะ" },
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
    []
  );

  const fmt = (n: number | null) => (loading || n === null ? "…" : n.toLocaleString());

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            ลูกค้า & คูปอง
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">
            ดูรายชื่อสมาชิก แต้มสะสม และจัดการคูปองส่วนลด (รวมแต้มที่ใช้แลกคูปอง)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => load()}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={() => openExportModal(customerSections, "ลูกค้า & คูปอง")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export ข้อมูล</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.dispatchEvent(new Event(ADMIN_COUPON_CREATE_OPEN_EVENT))}
          >
            <i className="fi fi-rr-plus flex items-center"></i>
            สร้างคูปองใหม่
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-scale-in opacity-0 delay-100">
          <ReportCard
            title="สมาชิกทั้งหมด"
            value={fmt(memberCount)}
            subValue="คน"
            icon={<i className="fi fi-rr-users"></i>}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <ReportCard
            title="พอยท์ในระบบ"
            value={fmt(totalPoints)}
            subValue="Pts (จากรายการที่โหลด)"
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="#FFF7ED"
            iconColor="#f47b2a"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <ReportCard
            title="คูปองถูกใช้ (เดือนนี้)"
            value="—"
            subValue="ยังไม่มีใน API"
            icon={<i className="fi fi-rr-ticket"></i>}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-400">
          <ReportCard
            title="คูปองที่ใช้ได้"
            value={fmt(activeCoupons)}
            subValue="รายการ"
            icon={<i className="fi fi-rr-gift"></i>}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
          />
        </div>
      </div>

      <div className="space-y-8 animate-in opacity-0 delay-500 pb-12">
        <CustomerTable customers={customerItems} loading={loading} error={error} />
        <div className="glass !rounded-[40px] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white overflow-hidden">
          <CouponTable />
        </div>
      </div>
    </PageWrapper>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <p className="px-4 py-16 text-center text-sm font-bold text-slate-400">กำลังโหลด…</p>
        </PageWrapper>
      }
    >
      <CustomersPageClient />
    </Suspense>
  );
}
