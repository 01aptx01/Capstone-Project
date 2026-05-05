"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import MachineCard from "@/components/machines/MachineCard";
import { ADMIN_MACHINES_REFRESH_EVENT } from "@/components/machines/AddMachineModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAdminAlerts, listMachines } from "@/lib/admin-api";
import { apiMachineToCard, type UiMachineCard } from "@/lib/admin-mappers";

function MachinesPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openAddMachine, openExportModal } = useUI();
  const [machines, setMachines] = useState<UiMachineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const q = listQuery.trim();
      const [{ items }, alerts] = await Promise.all([
        listMachines({
          page: 1,
          per_page: 200,
          ...(q ? { q } : {}),
        }),
        getAdminAlerts().catch(() => null),
      ]);
      setMachines(items.map(apiMachineToCard));
      if (alerts) {
        setAlertCount(
          (alerts.low_stock?.length ?? 0) + (alerts.machine_errors?.length ?? 0)
        );
      } else {
        setAlertCount(null);
      }
    } catch (e) {
      console.error(e);
      setMachines([]);
      setAlertCount(null);
      setLoadError(
        e instanceof Error ? e.message : "โหลดรายการตู้ไม่สำเร็จ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onRefresh = () => {
      void load();
    };
    window.addEventListener(ADMIN_MACHINES_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_MACHINES_REFRESH_EVENT, onRefresh);
  }, [load]);

  const machineSections: ExportSection[] = useMemo(
    () => [
      {
        id: "machines_list",
        label: "รายชื่อตู้ทั้งหมด (All Machines)",
        description: "ข้อมูลตู้สินค้าทั้งหมดในระบบ",
        columns: [
          { key: "id", label: "รหัสตู้" },
          { key: "name", label: "ชื่อตู้" },
          { key: "location", label: "สถานที่" },
          { key: "status", label: "สถานะ" },
        ],
        fetchData: async () => {
          const { items } = await listMachines({ page: 1, per_page: 500 });
          return items.map((m) => ({
            id: m.machine_code,
            name: m.machine_code,
            location: m.location || "",
            status: m.status,
          })) as Record<string, unknown>[];
        },
      },
    ],
    []
  );

  const operationalOnlineCount = machines.filter(
    (m) => (m.status || "online").toLowerCase() === "online"
  ).length;
  const socketConnectedCount = machines.filter((m) => m.is_online === true).length;

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8 animate-in opacity-0">
        <div>
          <h1 className="text-3xl font-black text-[#334155] tracking-tight mb-2">
            จัดการตู้สินค้า
          </h1>
          <p className="text-slate-400 font-medium">
            ติดตามสถานะ สต็อกสินค้า และประสิทธิภาพของตู้จำหน่ายสินค้าอัตโนมัติแบบ Real-time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold text-sm"
          >
            รีเฟรช
          </button>
          <button
            onClick={() => openExportModal(machineSections, "จัดการตู้สินค้า")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800"
        >
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in opacity-0 delay-600">
        {[
          {
            label: "ตู้ทั้งหมด",
            value: loading ? "…" : machines.length,
            icon: "fi-rr-vending-machine",
            color: "bg-blue-500",
            shadow: "shadow-blue-200",
          },
          {
            label: "พร้อมขาย (status=online)",
            value: loading ? "…" : operationalOnlineCount,
            icon: "fi-rr-check-circle",
            color: "bg-emerald-500",
            shadow: "shadow-emerald-200",
          },
          {
            label: "เชื่อมต่อ Socket (is_online)",
            value: loading ? "…" : socketConnectedCount,
            icon: "fi-rr-wifi",
            color: "bg-sky-500",
            shadow: "shadow-sky-200",
          },
          {
            label: "แจ้งเตือน (สต็อกต่ำ + ERROR)",
            value:
              loading ? "…" : alertCount === null ? "—" : String(alertCount),
            icon: "fi-rr-bell",
            color: "bg-rose-500",
            shadow: "shadow-rose-200",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="vibrant-card p-6 flex items-center gap-5 hover:translate-y-[-4px] transition-transform duration-300"
          >
            <div
              className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center text-xl text-white shadow-lg ${stat.shadow}`}
            >
              <i className={`fi ${stat.icon}`}></i>
            </div>
            <div>
              <div className="text-slate-400 font-bold text-[12px] uppercase tracking-widest">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-[#334155]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#334155] tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-[#f47b2a] rounded-full"></span>
            รายชื่อตู้ทั้งหมด
          </h2>
          <button
            onClick={openAddMachine}
            className="px-5 py-2.5 bg-[#f47b2a] text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-plus text-sm"></i>
            <span>เพิ่มตู้สินค้า</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-16 min-h-[420px]">
          {loading ? (
            <div className="col-span-full flex min-h-[380px] items-stretch justify-center">
              <div className="w-full max-w-md">
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <>
              {machines.map((machine, index: number) => (
                <div
                  key={machine.id}
                  className="animate-scale-in opacity-0"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <MachineCard {...machine} />
                </div>
              ))}

              {!loading && machines.length === 0 && (
                <div className="col-span-full flex min-h-[200px] flex-col items-center justify-center rounded-[40px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                  <p className="text-lg font-black text-slate-600">ยังไม่มีตู้ในระบบ</p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    เพิ่มตู้ใหม่จากปุ่มด้านบน หรือตรวจสอบการเชื่อมต่อ API
                  </p>
                </div>
              )}

          <div
            onClick={openAddMachine}
            className="group relative border-4 border-dashed border-slate-100 rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[380px] hover:border-[#f47b2a]/30 hover:bg-orange-50/30 transition-all duration-700 cursor-pointer animate-scale-in opacity-0"
            style={{
              animationDelay: `${200 + (loading ? 0 : machines.length) * 100}ms`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]"></div>
            <div className="relative z-10 w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl shadow-slate-200/50 border border-slate-50 group-hover:border-orange-200">
              <i className="fi fi-rr-plus text-[40px] text-slate-200 group-hover:text-[#f47b2a] transition-colors duration-500"></i>
            </div>
            <div className="relative z-10 text-center">
              <div className="text-[22px] font-black text-slate-300 group-hover:text-[#f47b2a] tracking-tight transition-colors duration-500">
                เพิ่มตู้สินค้าใหม่
              </div>
              <p className="text-slate-300 font-bold text-sm mt-3 max-w-[200px] mx-auto leading-relaxed group-hover:text-orange-400 transition-colors duration-500">
                คลิกเพื่อเชื่อมต่อและจัดการตู้ใหม่เข้ากับระบบส่วนกลาง
              </p>
            </div>
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-slate-100 rounded-tl-xl group-hover:border-[#f47b2a]/20 transition-colors"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-slate-100 rounded-br-xl group-hover:border-[#f47b2a]/20 transition-colors"></div>
          </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default function MachinesPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <p className="px-4 py-16 text-center text-sm font-bold text-slate-400">กำลังโหลด…</p>
        </PageWrapper>
      }
    >
      <MachinesPageClient />
    </Suspense>
  );
}
