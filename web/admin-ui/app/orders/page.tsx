"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listOrders } from "@/lib/admin-api";
import type { ApiOrderListItem } from "@/lib/admin-api";
import { apiOrderToUiRow } from "@/lib/admin-mappers";

export default function OrdersPage() {
  const { openExportModal } = useUI();
  const [rows, setRows] = useState<ReturnType<typeof apiOrderToUiRow>[]>([]);
  const [rawItems, setRawItems] = useState<ApiOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrders({ page: 1, per_page: 500 });
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
  }, []);

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
        label: "สรุปคำสั่งซื้อ (Orders Summary)",
        description: "จำนวนออเดอร์ตามสถานะ (จากชุดข้อมูลที่โหลด)",
        columns: [
          { key: "metric", label: "สถานะ" },
          { key: "value", label: "จำนวน" },
        ],
        fetchData: async () => [
          { metric: "ออเดอร์ทั้งหมด (API)", value: String(total) },
          { metric: "รอดำเนินการ / ยกเลิก", value: String(summary.pending) },
          { metric: "สำเร็จแล้ว", value: String(summary.completed) },
          {
            metric: "ยอดรวมในหน้า (ประมาณ)",
            value: `฿${summary.revenue.toFixed(2)}`,
          },
        ],
      },
      {
        id: "orders_list",
        label: "รายการออเดอร์ (Order List)",
        description: "รายละเอียดคำสั่งซื้อ",
        columns: [
          { key: "id", label: "เลขออเดอร์" },
          { key: "time", label: "เวลา" },
          { key: "machine_code", label: "ตู้" },
          { key: "customer_phone", label: "ลูกค้า" },
          { key: "payment_method", label: "ช่องทางจ่าย" },
          { key: "items", label: "สินค้า" },
          { key: "amount", label: "ยอดเงิน (฿)" },
          { key: "status", label: "สถานะ" },
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
              items: r.items,
              amount: r.amount,
              status: r.status,
            };
          }) as Record<string, unknown>[];
        },
      },
    ],
    [total, summary.pending, summary.completed, summary.revenue]
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed")
      return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
          Completed
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
          Refunded
        </span>
      );
    return (
      <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-100">
        {status}
      </span>
    );
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            ประวัติการสั่งซื้อ
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">
            ตรวจสอบและจัดการรายการธุรกรรมทั้งหมดในระบบ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-[#334155]"
          >
            รีเฟรช
          </button>
          <button
            onClick={() => openExportModal(orderSections, "คำสั่งซื้อ (Orders)")}
            className="btn-primary"
          >
            <i className="fi fi-rr-download flex items-center"></i>
            Export รายงาน
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard
            title="ออเดอร์ทั้งหมด"
            value={loading ? "…" : String(total)}
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard
            title="รอดำเนินการ / ยกเลิก"
            value={loading ? "…" : String(summary.pending)}
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="#FFF7ED"
            iconColor="#F59E0B"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard
            title="สำเร็จแล้ว"
            value={loading ? "…" : String(summary.completed)}
            icon={<i className="fi fi-rr-check-circle"></i>}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>
        <div className="animate-in opacity-0 delay-400">
          <ReportCard
            title="ยอดเงินรวม (ชุดที่โหลด)"
            value={loading ? "…" : `฿${summary.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="#FDF2F8"
            iconColor="#DB2777"
          />
        </div>
      </div>

      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-500 min-h-[320px]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[#334155]">รายการออเดอร์ล่าสุด</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  Order ID
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  เวลา
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  ตู้
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  ลูกค้า
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  ช่องทางจ่าย
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  สินค้า
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  Total
                </th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
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
                    <p className="text-lg font-black text-slate-500">ไม่มีออเดอร์ในชุดที่โหลด</p>
                    <p className="mt-2 text-sm font-medium text-slate-400">
                      ลองรีเฟรชหรือตรวจสอบการเชื่อมต่อกับเซิร์ฟเวอร์
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-[#334155]">{o.id}</span>
                    </td>
                    <td className="px-8 py-5 text-[14px] font-semibold text-[#64748B] max-w-[200px] truncate">
                      {o.time}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold font-mono text-slate-600">
                      {o.machine_code || "—"}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-600">
                      {o.customer_phone || "—"}
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-slate-600 uppercase">
                      {o.payment_method || "—"}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[14px] font-bold text-slate-600">{o.items}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[16px] font-black text-[#334155]">
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
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-400">
            แสดง {rows.length} รายการ (ทั้งหมดในระบบ {total} ตาม API)
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
