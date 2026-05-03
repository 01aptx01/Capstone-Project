"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import ReportCard from "@/components/dashboard/ReportCard";
import CouponTable from "@/components/customers/CouponTable";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { useEffect, useMemo, useState, useCallback } from "react";
import { listCoupons, listCustomers } from "@/lib/admin-api";
import { apiCouponToUiRow, summarizeCustomers } from "@/lib/admin-mappers";

export default function CustomersPage() {
  const { openExportModal } = useUI();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, coupRes] = await Promise.all([
        listCustomers({ page: 1, per_page: 2000 }),
        listCoupons({ page: 1, per_page: 500 }),
      ]);
      const { totalPoints: tp } = summarizeCustomers(custRes.items);
      setMemberCount(custRes.total);
      setTotalPoints(tp);
      const now = new Date();
      const active = coupRes.items.filter((c) => {
        if (!c.is_active) return false;
        if (!c.expire_date) return true;
        return new Date(c.expire_date) >= now;
      }).length;
      setActiveCampaigns(active);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "โหลดข้อมูลลูกค้าไม่สำเร็จ");
      setMemberCount(null);
      setTotalPoints(null);
      setActiveCampaigns(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
            { metric: "แคมเปญที่กำลังเปิด (คูปอง active + ยังไม่หมดอายุ)", value: `${active} แคมเปญ` },
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
          { key: "points", label: "พอยท์ที่ใช้" },
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
              points: r.points,
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
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            ลูกค้า & โปรโมชัน
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">
            จัดการข้อมูลสมาชิก คูปองส่วนลด และแคมเปญสะสมพอยท์เพื่อกระตุ้นยอดขาย
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => load()}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={() => openExportModal(customerSections, "ลูกค้า & โปรโมชัน")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export ข้อมูล</span>
          </button>
          <button type="button" className="btn-primary">
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
            title="แคมเปญเปิดอยู่"
            value={fmt(activeCampaigns)}
            subValue="แคมเปญ"
            icon={<i className="fi fi-rr-gift"></i>}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
          />
        </div>
      </div>

      <div className="animate-in opacity-0 delay-500 pb-12">
        <div className="glass !rounded-[40px] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white overflow-hidden">
          <CouponTable />
        </div>
      </div>
    </PageWrapper>
  );
}
