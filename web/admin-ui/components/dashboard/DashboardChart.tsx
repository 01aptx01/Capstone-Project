"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LiveChartBuckets, RechartsSalesDatum } from "@/lib/admin-mappers";
import { getSalesReport } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `฿${(n / 1_000).toFixed(1)}k`;
  return `฿${Math.round(n)}`;
}

function localYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function shortDate(iso: string) {
  if (iso.length >= 10) {
    const d = parseInt(iso.slice(8, 10), 10);
    const m = parseInt(iso.slice(5, 7), 10);
    return `${d}/${m}`;
  }
  return iso;
}

function shortMonthYear(iso: string) {
  if (iso.length >= 7) {
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const m = parseInt(iso.slice(5, 7), 10) - 1;
    const y = iso.slice(2, 4);
    return `${monthNames[m] ?? ""}'${y}`;
  }
  return iso;
}

// ─── types ───────────────────────────────────────────────────────────────────

type ChartPoint = { x: number; y: number; v: number };

// ─── props ───────────────────────────────────────────────────────────────────

interface DashboardChartProps {
  liveBuckets?: LiveChartBuckets | null;
  /** 30-day series already loaded by the parent page */
  salesSeriesData?: RechartsSalesDatum[];
}

// ─── catmull-rom to bezier ────────────────────────────────────────────────────

function catmullRom2bezier(pts: { x: number; y: number }[]): string {
  if (!pts || pts.length < 2) return "";
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    if (i === 0)
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    else
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardChart({
  liveBuckets,
  salesSeriesData = [],
}: DashboardChartProps) {
  const { t } = useLang();

  // ── view state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"realtime" | "historical">("realtime");
  const [realtimePeriod, setRealtimePeriod] = useState("Day");
  const [historicalPeriod, setHistoricalPeriod] = useState("Day");

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [monthRange, setMonthRange] = useState({ start: "", end: "" });
  const [yearRange, setYearRange] = useState({
    start: String(new Date().getFullYear()),
    end: String(new Date().getFullYear()),
  });

  // ── historical API data ──────────────────────────────────────────────────────
  const [histLoading, setHistLoading] = useState(false);
  const [histValues, setHistValues] = useState<number[]>([]);
  const [histLabels, setHistLabels] = useState<string[]>([]);

  // ── fetch historical from real API ──────────────────────────────────────────
  const fetchHistorical = useCallback(async () => {
    if (viewMode !== "historical") return;

    setHistLoading(true);
    try {
      let daysToFetch = 30;
      const valuesOut: number[] = [];
      const labelsOut: string[] = [];

      if (historicalPeriod === "Day" && dateRange.start && dateRange.end) {
        const s = new Date(dateRange.start);
        const e = new Date(dateRange.end);
        const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
        daysToFetch = Math.max(1, Math.min(diff, 365));

        const report = await getSalesReport(daysToFetch + 2); // +2 buffer
        const byDate = new Map(report.series.map((r) => [r.date, r.revenue]));

        for (let i = 0; i < diff; i++) {
          const d = new Date(s);
          d.setDate(d.getDate() + i);
          const iso = localYMD(d);
          valuesOut.push(byDate.get(iso) ?? 0);
          labelsOut.push(shortDate(iso));
        }
      } else if (historicalPeriod === "Month" && monthRange.start && monthRange.end) {
        const s = new Date(monthRange.start + "-01");
        const e = new Date(monthRange.end + "-01");
        const diffMonths =
          (e.getFullYear() - s.getFullYear()) * 12 +
          e.getMonth() -
          s.getMonth() + 1;
        daysToFetch = Math.max(1, Math.min(diffMonths, 24)) * 31 + 5;

        const report = await getSalesReport(daysToFetch);
        const byMonth = new Map<string, number>();
        for (const row of report.series) {
          const ym = row.date.slice(0, 7); // YYYY-MM
          byMonth.set(ym, (byMonth.get(ym) ?? 0) + row.revenue);
        }

        const months = Math.max(1, Math.min(diffMonths, 24));
        for (let i = 0; i < months; i++) {
          const d = new Date(s);
          d.setMonth(d.getMonth() + i);
          const ym = localYMD(d).slice(0, 7);
          valuesOut.push(byMonth.get(ym) ?? 0);
          labelsOut.push(shortMonthYear(ym + "-01"));
        }
      } else if (historicalPeriod === "Year" && yearRange.start && yearRange.end) {
        const sy = parseInt(yearRange.start, 10);
        const ey = parseInt(yearRange.end, 10);
        daysToFetch = Math.max(1, Math.min(ey - sy + 1, 10)) * 366 + 5;

        const report = await getSalesReport(Math.min(daysToFetch, 3650));
        const byYear = new Map<number, number>();
        for (const row of report.series) {
          const yr = parseInt(row.date.slice(0, 4), 10);
          byYear.set(yr, (byYear.get(yr) ?? 0) + row.revenue);
        }

        const years = Math.max(1, Math.min(ey - sy + 1, 10));
        for (let i = 0; i < years; i++) {
          const yr = sy + i;
          valuesOut.push(byYear.get(yr) ?? 0);
          labelsOut.push(String(yr));
        }
      } else {
        // Default: use parent's 30-day series
        const sorted = [...salesSeriesData].sort((a, b) => a.date.localeCompare(b.date));
        for (const row of sorted) {
          valuesOut.push(row.revenue);
          labelsOut.push(shortDate(row.date));
        }
      }

      setHistValues(valuesOut.length ? valuesOut : [0]);
      setHistLabels(labelsOut.length ? labelsOut : ["—"]);
    } catch {
      // fallback to parent series on error
      const sorted = [...salesSeriesData].sort((a, b) => a.date.localeCompare(b.date));
      setHistValues(sorted.map((r) => r.revenue));
      setHistLabels(sorted.map((r) => shortDate(r.date)));
    } finally {
      setHistLoading(false);
    }
  }, [viewMode, historicalPeriod, dateRange, monthRange, yearRange, salesSeriesData]);

  useEffect(() => {
    void fetchHistorical();
  }, [fetchHistorical]);

  // When switching to historical without a range yet → load from parent series
  useEffect(() => {
    if (viewMode === "historical" && histValues.length === 0 && salesSeriesData.length > 0) {
      const sorted = [...salesSeriesData].sort((a, b) => a.date.localeCompare(b.date));
      setHistValues(sorted.map((r) => r.revenue));
      setHistLabels(sorted.map((r) => shortDate(r.date)));
    }
  }, [viewMode, histValues.length, salesSeriesData]);

  // Listen to header selector events
  useEffect(() => {
    function onPeriodChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.period && viewMode === "realtime") {
        setRealtimePeriod(detail.period);
      }
    }
    window.addEventListener("dashboard-period-change", onPeriodChange as EventListener);
    return () => window.removeEventListener("dashboard-period-change", onPeriodChange as EventListener);
  }, [viewMode]);

  // ── active series ─────────────────────────────────────────────────────────
  const liveRealtimeSeries =
    liveBuckets && viewMode === "realtime"
      ? realtimePeriod === "Day"
        ? liveBuckets.day
        : realtimePeriod === "Week"
          ? liveBuckets.week
          : liveBuckets.month
      : null;

  const active: number[] = useMemo(() => {
    if (viewMode === "historical") {
      return histValues.length ? histValues : [0];
    }
    if (liveRealtimeSeries && liveRealtimeSeries.length > 0) return liveRealtimeSeries;
    // Fallback from salesSeriesData
    if (salesSeriesData.length > 0) {
      const sorted = [...salesSeriesData].sort((a, b) => a.date.localeCompare(b.date));
      if (realtimePeriod === "Week") return sorted.slice(-7).map((r) => r.revenue);
      if (realtimePeriod === "Month") {
        // aggregate into 4 weekly buckets
        const tail = sorted.slice(-28);
        const buckets = [0, 0, 0, 0];
        tail.forEach((r, i) => { buckets[Math.min(Math.floor(i / 7), 3)] += r.revenue; });
        return buckets;
      }
      return sorted.slice(-8).map((r) => r.revenue);
    }
    return [0];
  }, [viewMode, histValues, liveRealtimeSeries, salesSeriesData, realtimePeriod]);

  const labels: string[] = useMemo(() => {
    if (viewMode === "historical") return histLabels.length ? histLabels : ["—"];
    if (liveBuckets && viewMode === "realtime") {
      if (realtimePeriod === "Day" && liveBuckets.labelsDay.length === active.length) return liveBuckets.labelsDay;
      if (realtimePeriod === "Week" && liveBuckets.labelsWeek.length === active.length) return liveBuckets.labelsWeek;
      if (realtimePeriod === "Month" && liveBuckets.labelsMonth.length === active.length) return liveBuckets.labelsMonth;
    }
    if (salesSeriesData.length > 0) {
      const sorted = [...salesSeriesData].sort((a, b) => a.date.localeCompare(b.date));
      if (realtimePeriod === "Week") return sorted.slice(-7).map((r) => shortDate(r.date));
      if (realtimePeriod === "Month") return ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];
      return sorted.slice(-8).map((r) => shortDate(r.date));
    }
    return active.map((_, i) => `T${i + 1}`);
  }, [viewMode, histLabels, liveBuckets, realtimePeriod, active, salesSeriesData]);

  // ── chart geometry ────────────────────────────────────────────────────────
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 260;

  useEffect(() => {
    function measure() {
      if (chartRef.current) setChartWidth(chartRef.current.clientWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (chartRef.current) ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  const maxValueRaw = Math.max(...active, 1);
  const step = Math.max(Math.ceil(maxValueRaw / 4 / 50) * 50, 1);
  const maxValue = step * 4;
  const yLabels = [maxValue, step * 3, step * 2, step, 0].map(formatCurrency);

  const points: ChartPoint[] = useMemo(() => {
    if (chartWidth <= 0) return [];
    const padding = 16;
    const innerWidth = Math.max(chartWidth - padding * 2, 10);
    const n = active.length;
    return active.map((v, i) => ({
      x: n === 1 ? padding + innerWidth / 2 : padding + (i / (n - 1)) * innerWidth,
      y: (1 - Math.min(v / maxValue, 1)) * chartHeight,
      v,
    }));
  }, [chartWidth, active, maxValue, chartHeight]);

  const pathD = useMemo(() => catmullRom2bezier(points), [points]);
  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return "";
    return `${pathD} L ${points[points.length - 1].x.toFixed(2)} ${chartHeight} L ${points[0].x.toFixed(2)} ${chartHeight} Z`;
  }, [pathD, points, chartHeight]);

  // ── tooltip ───────────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState<{
    show: boolean; x: number; y: number; label: string; value: number;
  }>({ show: false, x: 0, y: 0, label: "", value: 0 });

  function handleSvgMove(e: React.MouseEvent<SVGElement>) {
    if (!points.length) return;
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - mx);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    const p = points[nearest];
    setTooltip({ show: true, x: p.x, y: p.y, label: labels[nearest] ?? "", value: p.v });
  }

  function handleSvgLeave() {
    setTooltip((prev) => ({ ...prev, show: false }));
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] w-full">
      {/* Header row */}
      <div className="flex flex-col mb-10 gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[18px] font-bold text-[var(--text)]">
              {t("chart.dashboardTitle")}
            </h3>
            {/* Real-time / Historical toggle */}
            <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl">
              {(["realtime", "historical"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${
                    viewMode === mode
                      ? "bg-[var(--surface-1)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {mode === "realtime" ? "Real-time" : "Historical"}
                </button>
              ))}
            </div>
          </div>

          {/* Period filter */}
          <div className="flex bg-[var(--surface-2)] p-1 rounded-xl">
            {(viewMode === "realtime"
              ? ["Day", "Week", "Month"]
              : ["Day", "Month", "Year"]
            ).map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (viewMode === "realtime") {
                    setRealtimePeriod(p);
                    try {
                      window.dispatchEvent(
                        new CustomEvent("dashboard-period-change", { detail: { period: p } })
                      );
                    } catch { /* ignore */ }
                  } else {
                    setHistoricalPeriod(p);
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  (viewMode === "realtime" ? realtimePeriod : historicalPeriod) === p
                    ? "bg-[var(--surface-1)] text-[var(--text)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Historical date range pickers */}
        <AnimatePresence>
          {viewMode === "historical" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-4 pt-3 border-t border-[var(--border)] overflow-hidden flex-wrap"
            >
              <span className="text-[14px] font-medium text-[var(--text-muted)]">
                {t("chart.rangeLabel")}
              </span>

              {historicalPeriod === "Day" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] text-[var(--text)]"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((s) => ({ ...s, start: e.target.value }))}
                  />
                  <span className="text-[var(--text-muted)] text-[13px]">{t("datePicker.through")}</span>
                  <input
                    type="date"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] text-[var(--text)]"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((s) => ({ ...s, end: e.target.value }))}
                  />
                  <button
                    onClick={() => void fetchHistorical()}
                    disabled={!dateRange.start || !dateRange.end || histLoading}
                    className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-[13px] font-bold disabled:opacity-50"
                  >
                    {histLoading ? "…" : "ดู"}
                  </button>
                </div>
              )}

              {historicalPeriod === "Month" && (
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] text-[var(--text)]"
                    value={monthRange.start}
                    onChange={(e) => setMonthRange((s) => ({ ...s, start: e.target.value }))}
                  />
                  <span className="text-[var(--text-muted)] text-[13px]">{t("datePicker.through")}</span>
                  <input
                    type="month"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] text-[var(--text)]"
                    value={monthRange.end}
                    onChange={(e) => setMonthRange((s) => ({ ...s, end: e.target.value }))}
                  />
                  <button
                    onClick={() => void fetchHistorical()}
                    disabled={!monthRange.start || !monthRange.end || histLoading}
                    className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-[13px] font-bold disabled:opacity-50"
                  >
                    {histLoading ? "…" : "ดู"}
                  </button>
                </div>
              )}

              {historicalPeriod === "Year" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="YYYY"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] w-24 text-[var(--text)]"
                    value={yearRange.start}
                    onChange={(e) => setYearRange((s) => ({ ...s, start: e.target.value }))}
                  />
                  <span className="text-[var(--text-muted)] text-[13px]">{t("datePicker.through")}</span>
                  <input
                    type="number"
                    placeholder="YYYY"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-2)] rounded-lg text-[13px] outline-none focus:border-[var(--primary)] w-24 text-[var(--text)]"
                    value={yearRange.end}
                    onChange={(e) => setYearRange((s) => ({ ...s, end: e.target.value }))}
                  />
                  <button
                    onClick={() => void fetchHistorical()}
                    disabled={!yearRange.start || !yearRange.end || histLoading}
                    className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-[13px] font-bold disabled:opacity-50"
                  >
                    {histLoading ? "…" : "ดู"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <div className="relative h-[300px] w-full flex">
        {/* Y-axis */}
        <div className="flex flex-col justify-between text-[12px] font-medium text-[var(--text-muted)] pr-4 pb-6 h-[260px] shrink-0">
          {yLabels.map((lbl) => (
            <div key={lbl}>{lbl}</div>
          ))}
        </div>

        {/* Chart canvas */}
        <div className="flex-1 relative h-[260px] min-w-0">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-[var(--border)]" />
            ))}
          </div>

          <div ref={chartRef} className="absolute inset-0">
            {chartWidth > 0 && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                onMouseMove={handleSvgMove}
                onMouseLeave={handleSvgLeave}
              >
                <defs>
                  <linearGradient id="areaGradDC" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                  <filter id="shadowDC" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="var(--primary)" floodOpacity="0.1" />
                  </filter>
                </defs>

                {areaD && (
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    d={areaD}
                    fill="url(#areaGradDC)"
                  />
                )}
                {pathD && (
                  <motion.path
                    key={pathD}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    d={pathD}
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#shadowDC)"
                  />
                )}

                {/* Markers */}
                {points.map((p, i) => (
                  <motion.g
                    key={`m-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3, type: "spring" }}
                  >
                    <circle cx={p.x} cy={p.y} r={8} fill="var(--primary)" opacity={0.1} />
                    <circle cx={p.x} cy={p.y} r={4} fill="var(--surface-1)" stroke="var(--primary)" strokeWidth={2} />
                  </motion.g>
                ))}
              </svg>
            )}

            {/* X-axis bar labels */}
            {points.map((p, i) => {
              const barW = Math.max(16, Math.min(48, (chartWidth / (points.length || 1)) * 0.6));
              const v = active[i];
              const heightPercent = Math.max((v / maxValue) * 100, 4);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, type: "spring" }}
                  style={{
                    position: "absolute",
                    left: p.x - barW / 2,
                    bottom: 0,
                    width: barW,
                    height: chartHeight,
                  }}
                  className="flex items-end justify-center group"
                >
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.04 }}
                    className="w-full rounded-t-md bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition-colors duration-200"
                  />
                  {/* X label */}
                  <div
                    style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)" }}
                    className="whitespace-nowrap text-[11px] font-semibold text-[var(--text-muted)]"
                  >
                    {labels[i]}
                  </div>
                </motion.div>
              );
            })}

            {/* Tooltip */}
            {tooltip.show && (
              <div
                className="chart-tooltip pointer-events-none z-20"
                style={{
                  position: "absolute",
                  left: Math.min(tooltip.x + 12, chartWidth - 100),
                  top: Math.max(tooltip.y - 48, 0),
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "6px 12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div className="text-[11px] font-semibold text-[var(--text-muted)]">{tooltip.label}</div>
                <div className="text-[13px] font-black text-[var(--text)]">{formatCurrency(tooltip.value)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
