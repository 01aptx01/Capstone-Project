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
import { useLang } from "@/lib/i18n/lang";

function MachinesPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openAddMachine, openExportModal } = useUI();
  const { t } = useLang();
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
        e instanceof Error ? e.message : t("page.machines.error.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [listQuery, t]);

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
        label: t("page.machines.listTitle"),
        description: t("page.machines.export.desc"),
        columns: [
          { key: "id", label: t("page.machines.export.col.id") },
          { key: "name", label: t("page.machines.export.col.name") },
          { key: "location", label: t("page.machines.export.col.location") },
          { key: "status", label: t("page.machines.export.col.status") },
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
    [t]
  );

  const operationalOnlineCount = machines.filter(
    (m) => (m.status || "online").toLowerCase() === "online"
  ).length;
  const socketConnectedCount = machines.filter((m) => m.is_online === true).length;

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-8 animate-in opacity-0">
        <div>
          <h1 className="text-3xl font-black text-[var(--text)] tracking-tight mb-2">
            {t("page.machines.title")}
          </h1>
          <p className="text-[var(--text-muted)] font-medium">
            {t("page.machines.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold text-sm"
          >
            {t("common.refresh")}
          </button>
          <button
            onClick={() => openExportModal(machineSections, t("page.machines.exportTitle"))}
            className="px-6 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>{t("page.machines.export")}</span>
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
            label: t("page.machines.stat.total"),
            value: loading ? "…" : machines.length,
            icon: "fi-rr-vending-machine",
            color: "bg-[var(--surface-2)]0",
            shadow: "shadow-blue-200",
          },
          {
            label: t("page.machines.stat.online"),
            value: loading ? "…" : operationalOnlineCount,
            icon: "fi-rr-check-circle",
            color: "bg-[var(--success-bg)]0",
            shadow: "shadow-emerald-200",
          },
          {
            label: t("page.machines.stat.socket"),
            value: loading ? "…" : socketConnectedCount,
            icon: "fi-rr-wifi",
            color: "bg-sky-500",
            shadow: "shadow-sky-200",
          },
          {
            label: t("page.machines.stat.alerts"),
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
              className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center text-xl text-[var(--primary-contrast)] shadow-lg ${stat.shadow}`}
            >
              <i className={`fi ${stat.icon}`}></i>
            </div>
            <div>
              <div className="text-[var(--text-muted)] font-bold text-[12px] uppercase tracking-widest">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-[var(--text)]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-[var(--primary)] rounded-full"></span>
            {t("page.machines.listTitle")}
          </h2>
          <button
            onClick={openAddMachine}
            className="px-5 py-2.5 bg-[var(--primary)] text-[var(--primary-contrast)] rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-plus text-sm"></i>
            <span>{t("page.machines.addMachine")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 pb-16 min-h-[420px]">
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
                <div className="col-span-full flex min-h-[200px] flex-col items-center justify-center rounded-[40px] border border-dashed border-[var(--border)] bg-[var(--surface-2)]/50 px-6 py-12 text-center">
                  <p className="text-lg font-black text-[var(--text)]">{t("page.machines.emptyTitle")}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--text)]0">
                    {t("page.machines.emptyHint")}
                  </p>
                </div>
              )}

          <div
            onClick={openAddMachine}
            className="group relative border-4 border-dashed border-[var(--border)] rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[380px] hover:border-[var(--primary)]/30 hover:bg-orange-50/30 transition-all duration-700 cursor-pointer animate-scale-in opacity-0"
            style={{
              animationDelay: `${200 + (loading ? 0 : machines.length) * 100}ms`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]"></div>
            <div className="relative z-10 w-24 h-24 bg-[var(--surface-1)] rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl /50 border border-[var(--border)] group-hover:border-orange-200">
              <i className="fi fi-rr-plus text-[40px] text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-500"></i>
            </div>
            <div className="relative z-10 text-center">
              <div className="text-[22px] font-black text-[var(--text-muted)] group-hover:text-[var(--primary)] tracking-tight transition-colors duration-500">
                {t("page.machines.addTileTitle")}
              </div>
              <p className="text-[var(--text-muted)] font-bold text-sm mt-3 max-w-[200px] mx-auto leading-relaxed group-hover:text-orange-400 transition-colors duration-500">
                {t("page.machines.addTileHint")}
              </p>
            </div>
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[var(--border)] rounded-tl-xl group-hover:border-[var(--primary)]/20 transition-colors"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[var(--border)] rounded-br-xl group-hover:border-[var(--primary)]/20 transition-colors"></div>
          </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

function MachinesPageFallback() {
  const { t } = useLang();
  return (
    <PageWrapper>
      <p className="px-4 py-16 text-center text-sm font-bold text-[var(--text-muted)]">{t("common.loading")}</p>
    </PageWrapper>
  );
}

export default function MachinesPage() {
  return (
    <Suspense fallback={<MachinesPageFallback />}>
      <MachinesPageClient />
    </Suspense>
  );
}
