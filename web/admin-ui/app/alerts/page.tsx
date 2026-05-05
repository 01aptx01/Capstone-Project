"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { getAdminAlerts, resolveAlert, type AdminAlertsResponse } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

function AlertsPageClient() {
  const { openExportModal } = useUI();
  const { t } = useLang();
  const searchParams = useSearchParams();
  void searchParams; // lang param picked up by LangProvider

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
      toast.success(t("alerts.toast.resolved"));
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
          : "Resolve failed";
      toast.error(msg);
    } finally {
      setResolvingId(null);
    }
  };

  const alertSections: ExportSection[] = useMemo(() => {
    const errs = data?.machine_errors ?? [];
    const low = data?.low_stock ?? [];
    const threshold = data?.stock_threshold ?? 5;
    return [
      {
        id: "machine_errors",
        label: t("page.alerts.sectionErrors"),
        description: includeResolved
          ? t("page.alerts.export.errorsIncl")
          : t("page.alerts.export.errorsOnly"),
        columns: [
          { key: "id", label: "Event ID" },
          { key: "machine", label: t("page.alerts.machineLabel") },
          { key: "event_type", label: t("page.alerts.export.col.eventType") },
          { key: "state", label: t("page.alerts.export.col.state") },
          { key: "created_at", label: t("page.orders.col.time") },
          { key: "is_resolved", label: t("page.alerts.export.col.resolved") },
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
        label: t("page.alerts.sectionLowStock").replace("{n}", String(threshold)),
        description: t("page.alerts.export.lowThreshold").replace("{n}", String(threshold)),
        columns: [
          { key: "machine_code", label: t("page.alerts.machineLabel") },
          { key: "slot", label: t("page.alerts.slotLabel") },
          { key: "product_name", label: t("machine.detail.col.product") },
          { key: "quantity", label: t("machine.detail.col.qty") },
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
  }, [data, includeResolved, t]);

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in opacity-0">
        <div>
          <h1 className="text-[32px] font-black text-[var(--text)] tracking-tight">{t("page.alerts.title")}</h1>
          <p className="text-[var(--text-muted)] font-medium">{t("page.alerts.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] cursor-pointer">
            <input
              type="checkbox"
              checked={includeResolved}
              onChange={(e) => setIncludeResolved(e.target.checked)}
              className="rounded border-[var(--border)]"
            />
            {t("page.alerts.includeResolved")}
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {t("common.refresh")}
          </button>
          <button
            type="button"
            onClick={() => openExportModal(alertSections, t("page.alerts.exportTitle"))}
            className="px-6 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>{t("page.alerts.export")}</span>
          </button>
        </div>
      </div>

      <div className="glass !rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-[var(--border)] animate-in opacity-0 delay-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <i className="fi fi-rr-cross-circle text-lg"></i>
          </div>
          <h2 className="text-xl font-extrabold text-[var(--text)]">{t("page.alerts.sectionErrors")}</h2>
        </div>

        {loading && !data ? (
          <p className="text-[var(--text-muted)] font-bold">{t("page.alerts.loading")}</p>
        ) : (data?.machine_errors?.length ?? 0) === 0 ? (
          <p className="text-[var(--text-muted)] font-medium">{t("page.alerts.empty")}</p>
        ) : (
          <div className="space-y-4">
            {data!.machine_errors.map((ev, index) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-[var(--surface-1)]/50 border border-[var(--border)]/80 hover:border-orange-200 hover:bg-[var(--surface-1)]/80 transition-all animate-slide-left opacity-0"
                style={{ animationDelay: `${100 + index * 80}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-red-600 bg-red-50">
                    <i className="fi fi-rr-cross-circle text-xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-[var(--text)] text-lg">{ev.event_type}</span>
                      <span className="text-[var(--text-muted)] font-medium text-sm">
                        {t("page.alerts.machinePrefix")}{ev.machine_code}
                      </span>
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {ev.state}
                      </span>
                      {ev.is_resolved && (
                        <span className="text-xs font-bold text-emerald-700 bg-[var(--success-bg)] px-2 py-0.5 rounded">
                          {t("page.alerts.badgeResolved")}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--text-muted)] font-medium">
                      job_id: {ev.job_id ?? "—"} · id: {ev.id}
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-muted)] mt-1">
                      {ev.created_at ? new Date(ev.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                  {!ev.is_resolved && (
                    <button
                      type="button"
                      disabled={resolvingId === ev.id}
                      onClick={() => void onResolve(ev.id)}
                      className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)] font-bold text-sm hover:bg-[var(--primary)] disabled:opacity-50 transition-colors"
                    >
                      {resolvingId === ev.id ? t("page.alerts.resolving") : t("page.alerts.resolve")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass !rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-[var(--border)] animate-in opacity-0 delay-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <i className="fi fi-rr-box-open text-lg"></i>
          </div>
          <h2 className="text-xl font-extrabold text-[var(--text)]">
            {t("page.alerts.lowStockTitle").replace("{n}", String(data?.stock_threshold ?? 5))}
          </h2>
        </div>
        {loading && !data ? (
          <p className="text-[var(--text-muted)] font-bold">{t("page.alerts.loading")}</p>
        ) : (data?.low_stock?.length ?? 0) === 0 ? (
          <p className="text-[var(--text-muted)] font-medium">{t("page.alerts.emptyLow")}</p>
        ) : (
          <div className="space-y-3">
            {data!.low_stock.map((r) => (
              <div
                key={`${r.machine_code}-${r.slot}-${r.product_id}`}
                className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-amber-50/80 border border-amber-100"
              >
                <div className="font-bold text-[var(--text)]">
                  {r.product_name}{" "}
                  <span className="text-[var(--text-muted)] font-medium text-sm">
                    {t("page.alerts.slotLine")
                      .replace("{machine}", r.machine_code)
                      .replace("{slot}", String(r.slot))}
                  </span>
                </div>
                <div className="text-amber-800 font-black">
                  {t("page.alerts.remain").replace("{n}", String(r.quantity))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function AlertsPageFallback() {
  return (
    <PageWrapper>
      <p className="px-4 py-16 text-center text-sm font-bold text-[var(--text-muted)]">Loading…</p>
    </PageWrapper>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<AlertsPageFallback />}>
      <AlertsPageClient />
    </Suspense>
  );
}
