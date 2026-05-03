"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { getAdminAlerts, resolveAlert, type AdminAlertsResponse } from "@/lib/admin-api";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export default function AlertsPage() {
  const { openExportModal } = useUI();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminAlertsResponse | null>(null);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAlerts({ include_resolved: includeResolved });
      setData(res);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [includeResolved]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const onResolve = async (eventId: number) => {
    setResolvingId(eventId);
    try {
      await resolveAlert(eventId);
      toast.success("ทำเครื่องหมายว่าแก้ไขแล้ว");
      await load();
    } catch (e) {
      console.error(e);
      const msg = isAxiosError(e)
        ? String(
            (e.response?.data as { error?: string; message?: string })?.error ||
              (e.response?.data as { message?: string })?.message ||
              e.message
          )
        : e instanceof Error
          ? e.message
          : "Resolve ไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setResolvingId(null);
    }
  };

  const alertSections: ExportSection[] = useMemo(() => {
    const errs = data?.machine_errors ?? [];
    const low = data?.low_stock ?? [];
    return [
      {
        id: "machine_errors",
        label: "ข้อผิดพลาดจากตู้ (Machine ERROR)",
        description: includeResolved ? "รวมที่ resolve แล้ว" : "เฉพาะที่ยังไม่ resolve",
        columns: [
          { key: "id", label: "Event ID" },
          { key: "machine", label: "ตู้" },
          { key: "event_type", label: "ประเภท" },
          { key: "state", label: "สถานะ" },
          { key: "created_at", label: "เวลา" },
          { key: "is_resolved", label: "แก้แล้ว" },
        ],
        fetchData: async () =>
          errs.map((r) => ({
            id: String(r.id),
            machine: r.machine_code,
            event_type: r.event_type,
            state: r.state,
            created_at: r.created_at ?? "",
            is_resolved: r.is_resolved ? "yes" : "no",
          })),
      },
      {
        id: "low_stock",
        label: "สต็อกต่ำ (Low stock)",
        description: `เกณฑ์ quantity < ${data?.stock_threshold ?? 5}`,
        columns: [
          { key: "machine_code", label: "ตู้" },
          { key: "slot", label: "ช่อง" },
          { key: "product_name", label: "สินค้า" },
          { key: "quantity", label: "จำนวน" },
        ],
        fetchData: async () =>
          low.map((r) => ({
            machine_code: r.machine_code,
            slot: String(r.slot),
            product_name: r.product_name,
            quantity: String(r.quantity),
          })),
      },
    ];
  }, [data, includeResolved]);

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in opacity-0">
        <div>
          <h1 className="text-[32px] font-black text-[#334155] tracking-tight">การแจ้งเตือน</h1>
          <p className="text-[#64748B] font-medium">
            สต็อกต่ำและเหตุการณ์ ERROR จากตู้ (อัปเดตจาก API)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeResolved}
              onChange={(e) => setIncludeResolved(e.target.checked)}
              className="rounded border-slate-300"
            />
            แสดง ERROR ที่ resolve แล้ว
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold text-sm disabled:opacity-50"
          >
            รีเฟรช
          </button>
          <button
            type="button"
            onClick={() => openExportModal(alertSections, "การแจ้งเตือน (Alerts)")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export รายงาน</span>
          </button>
        </div>
      </div>

      <div className="glass !rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white animate-in opacity-0 delay-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <i className="fi fi-rr-cross-circle text-lg"></i>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">ข้อผิดพลาดจากตู้ (ERROR)</h2>
        </div>

        {loading && !data ? (
          <p className="text-slate-500 font-bold">กำลังโหลด…</p>
        ) : (data?.machine_errors?.length ?? 0) === 0 ? (
          <p className="text-slate-500 font-medium">ไม่มีรายการในขณะนี้</p>
        ) : (
          <div className="space-y-4">
            {data!.machine_errors.map((ev, index) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white/50 border border-white/80 hover:border-orange-200 hover:bg-white/80 transition-all animate-slide-left opacity-0"
                style={{ animationDelay: `${100 + index * 80}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-red-600 bg-red-50">
                    <i className="fi fi-rr-cross-circle text-xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-lg">
                        {ev.event_type}
                      </span>
                      <span className="text-slate-400 font-medium text-sm">
                        · ตู้ {ev.machine_code}
                      </span>
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {ev.state}
                      </span>
                      {ev.is_resolved && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          แก้แล้ว
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      job_id: {ev.job_id ?? "—"} · id: {ev.id}
                    </div>
                    <div className="text-sm font-semibold text-[#94A3B8] mt-1">
                      {ev.created_at
                        ? new Date(ev.created_at).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                  {!ev.is_resolved && (
                    <button
                      type="button"
                      disabled={resolvingId === ev.id}
                      onClick={() => void onResolve(ev.id)}
                      className="shrink-0 px-5 py-2.5 rounded-xl bg-[#f47b2a] text-white font-bold text-sm hover:bg-[#d35e11] disabled:opacity-50 transition-colors"
                    >
                      {resolvingId === ev.id ? "กำลังดำเนินการ…" : "Resolve"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass !rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white animate-in opacity-0 delay-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <i className="fi fi-rr-box-open text-lg"></i>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            สต็อกต่ำ (ต่ำกว่า {data?.stock_threshold ?? 5})
          </h2>
        </div>
        {loading && !data ? (
          <p className="text-slate-500 font-bold">กำลังโหลด…</p>
        ) : (data?.low_stock?.length ?? 0) === 0 ? (
          <p className="text-slate-500 font-medium">ไม่มีช่องที่ต่ำกว่าเกณฑ์</p>
        ) : (
          <div className="space-y-3">
            {data!.low_stock.map((r) => (
              <div
                key={`${r.machine_code}-${r.slot}-${r.product_id}`}
                className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-amber-50/80 border border-amber-100"
              >
                <div className="font-bold text-slate-800">
                  {r.product_name}{" "}
                  <span className="text-slate-500 font-medium text-sm">
                    ({r.machine_code} · ช่อง {r.slot})
                  </span>
                </div>
                <div className="text-amber-800 font-black">คงเหลือ {r.quantity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
