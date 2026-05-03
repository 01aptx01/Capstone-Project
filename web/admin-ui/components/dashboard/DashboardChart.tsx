"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fallbackDay = [20, 40, 120, 240, 310, 210, 140, 80];
const fallbackWeek = [800, 920, 760, 1100, 1300, 1250, 1480];
const fallbackMonth = [3200, 4100, 3800, 4500];

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export default function DashboardChart() {
  const [viewMode, setViewMode] = useState<"realtime" | "historical">("realtime");
  const [realtimePeriod, setRealtimePeriod] = useState("Day");
  const [historicalPeriod, setHistoricalPeriod] = useState("Day");
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [monthRange, setMonthRange] = useState({ start: "", end: "" });
  const [yearRange, setYearRange] = useState({ start: new Date().getFullYear().toString(), end: new Date().getFullYear().toString() });
  
  const [histData, setHistData] = useState<number[]>([1200, 2400, 1800, 3200, 2800]);
  const [histLabels, setHistLabels] = useState<string[]>(["T1", "T2", "T3", "T4", "T5"]);

  const [data, setData] = useState({ day: fallbackDay, week: fallbackWeek, month: fallbackMonth });

  useEffect(() => {
    if (viewMode !== "historical") return;
    let count = 0;
    let newLabels: string[] = [];
    
    if (historicalPeriod === "Day" && dateRange.start && dateRange.end) {
       const s = new Date(dateRange.start);
       const e = new Date(dateRange.end);
       const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
       count = Math.max(1, Math.min(diffDays, 31));
       for (let i = 0; i < count; i++) {
          const d = new Date(s);
          d.setDate(d.getDate() + i);
          newLabels.push(`${d.getDate()}/${d.getMonth()+1}`);
       }
    } else if (historicalPeriod === "Month" && monthRange.start && monthRange.end) {
       const s = new Date(monthRange.start);
       const e = new Date(monthRange.end);
       const diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth() + 1;
       count = Math.max(1, Math.min(diffMonths, 24));
       for(let i = 0; i < count; i++) {
          const d = new Date(s);
          d.setMonth(d.getMonth() + i);
          const m = d.toLocaleString('default', { month: 'short' });
          newLabels.push(`${m} '${d.getFullYear().toString().slice(2)}`);
       }
    } else if (historicalPeriod === "Year" && yearRange.start && yearRange.end) {
       const s = parseInt(yearRange.start);
       const e = parseInt(yearRange.end);
       count = Math.max(1, Math.min(e - s + 1, 10));
       for (let i = 0; i < count; i++) {
          newLabels.push(`${s + i}`);
       }
    } else {
       count = 5;
       newLabels = Array.from({length: 5}, (_, i) => `T${i+1}`);
    }

    const newData = Array.from({length: count}, () => Math.floor(Math.random() * 4000) + 500);
    queueMicrotask(() => {
      setHistData(newData);
      setHistLabels(newLabels);
    });
  }, [viewMode, historicalPeriod, dateRange, monthRange, yearRange]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setData({
          day: Array.isArray(j.day) ? j.day : Array.isArray(j.realtime) ? j.realtime : fallbackDay,
          week: Array.isArray(j.week) ? j.week : fallbackWeek,
          month: Array.isArray(j.month) ? j.month : fallbackMonth,
        });
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen to header selector events
  useEffect(() => {
    function onPeriodChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.period && viewMode === "realtime") {
        setRealtimePeriod(detail.period);
      }
    }
    window.addEventListener("dashboard-period-change", onPeriodChange as EventListener);
    return () => window.removeEventListener("dashboard-period-change", onPeriodChange as EventListener);
  }, [viewMode]);

  const active = viewMode === "historical" 
    ? histData 
    : (realtimePeriod === "Day" ? data.day : realtimePeriod === "Week" ? data.week : data.month);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 260;

  useEffect(() => {
    function measure() {
      if (chartRef.current) setChartWidth(chartRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // compute max+steps for grid before plotting points
  const maxValueRaw = Math.max(...active, 1);
  // round up to nearest 50 or 100 for nice grid
  const step = Math.ceil(maxValueRaw / 4 / 50) * 50;
  const maxValue = step * 4;

  const yLabels = [maxValue, step * 3, step * 2, step, 0].map((v) => formatCurrency(v));

  // Compute points for SVG plotting (memoized)
  const points = useMemo(() => {
    if (chartWidth <= 0) return [];
    const padding = 16;
    const innerWidth = Math.max(chartWidth - padding * 2, 10);
    const n = active.length;
    return active.map((v, i) => {
      const x = n === 1 ? padding + innerWidth / 2 : padding + (i / (n - 1)) * innerWidth;
      const y = (1 - Math.min(v / maxValue, 1)) * chartHeight;
      return { x, y, v };
    });
  }, [chartWidth, active, maxValue, chartHeight]);

  // Smooth path generator (Catmull-Rom -> cubic Bezier)
  function catmullRom2bezier(pts: { x: number; y: number }[]) {
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
      if (i === 0) d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      else d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  const pathD = useMemo(() => catmullRom2bezier(points), [points]);
  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return "";
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    return `${pathD} L ${lastX.toFixed(2)} ${chartHeight} L ${firstX.toFixed(2)} ${chartHeight} Z`;
  }, [pathD, points, chartHeight]);

  // Projection for Month (memoized)
  const { projPath, projPoint } = useMemo(() => {
    if (viewMode === "historical" || realtimePeriod !== "Month" || points.length < 2) return { projPath: null, projPoint: null };
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const projectedV = Math.max(0, Math.round(last.v + (last.v - prev.v) * 0.6));
    const padding = 16;
    const innerWidth = Math.max(chartWidth - padding * 2, 10);
    const projX = padding + innerWidth; // next slot
    const projY = (1 - Math.min(projectedV / maxValue, 1)) * chartHeight;
    return { projPath: `M ${last.x.toFixed(2)} ${last.y.toFixed(2)} L ${projX.toFixed(2)} ${projY.toFixed(2)}`, projPoint: { x: projX, y: projY, v: projectedV } };
  }, [viewMode, realtimePeriod, points, chartWidth, maxValue, chartHeight]);

  // Tooltip state & handlers
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; label: string | number; value: number | null; index: number }>({ show: false, x: 0, y: 0, label: "", value: null, index: 0 });

  function handleSvgMove(e: React.MouseEvent<SVGElement>) {
    if (!points || points.length === 0) return;
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - mx);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    const p = points[nearestIdx];
    setTooltip({ show: true, x: p.x, y: p.y, label: labels[nearestIdx], value: p.v, index: nearestIdx });
  }

  function handleSvgLeave() {
    setTooltip((t) => ({ ...t, show: false }));
  }

  // Dynamic labels depending on period and data length
  const labels = (() => {
    if (viewMode === "historical") {
      return histLabels;
    }
    if (realtimePeriod === "Day") {
      const dayLabels = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];
      return active.length === dayLabels.length ? dayLabels : active.map((_, i) => `T${i + 1}`);
    }
    if (realtimePeriod === "Week") {
      const wk = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return active.length === wk.length ? wk : active.map((_, i) => `D${i + 1}`);
    }
    // Month
    if (active.length === 4) return ["Week 1", "Week 2", "Week 3", "Week 4"];
    return active.map((_, i) => `W${i + 1}`);
  })();

  

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex flex-col mb-10 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-[18px] font-bold text-[#334155]">
              แนวโน้มยอดขาย
            </h3>
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl">
              <button
                onClick={() => setViewMode("realtime")}
                className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${
                  viewMode === "realtime" ? "bg-white text-[#334155] shadow-sm" : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                Real-time
              </button>
              <button
                onClick={() => setViewMode("historical")}
                className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${
                  viewMode === "historical" ? "bg-white text-[#334155] shadow-sm" : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                Historical
              </button>
            </div>
          </div>
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
            {(viewMode === "realtime" ? ["Day", "Week", "Month"] : ["Day", "Month", "Year"]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (viewMode === "realtime") {
                    setRealtimePeriod(p);
                    try {
                      window.dispatchEvent(new CustomEvent("dashboard-period-change", { detail: { period: p } }));
                    } catch {
                      /* ignore */
                    }
                  } else {
                    setHistoricalPeriod(p);
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  (viewMode === "realtime" ? realtimePeriod : historicalPeriod) === p ? "bg-white text-[#334155] shadow-sm" : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <AnimatePresence>
        {viewMode === "historical" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 pt-2 border-t border-[#E2E8F0] overflow-hidden"
          >
            <span className="text-[14px] font-medium text-[#64748B]">ระบุช่วงเวลา:</span>
            {historicalPeriod === "Day" && (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a]"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(s => ({...s, start: e.target.value}))}
                />
                <span className="text-[#64748B] text-[13px] font-medium">ถึง</span>
                <input 
                  type="date" 
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a]"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(s => ({...s, end: e.target.value}))}
                />
              </div>
            )}
            {historicalPeriod === "Month" && (
              <div className="flex items-center gap-2">
                <input 
                  type="month" 
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a]"
                  value={monthRange.start}
                  onChange={(e) => setMonthRange(s => ({...s, start: e.target.value}))}
                />
                <span className="text-[#64748B] text-[13px] font-medium">ถึง</span>
                <input 
                  type="month" 
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a]"
                  value={monthRange.end}
                  onChange={(e) => setMonthRange(s => ({...s, end: e.target.value}))}
                />
              </div>
            )}
            {historicalPeriod === "Year" && (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="YYYY"
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a] w-24"
                  value={yearRange.start}
                  onChange={(e) => setYearRange(s => ({...s, start: e.target.value}))}
                />
                <span className="text-[#64748B] text-[13px] font-medium">ถึง</span>
                <input 
                  type="number" 
                  placeholder="YYYY"
                  className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#f47b2a] w-24"
                  value={yearRange.end}
                  onChange={(e) => setYearRange(s => ({...s, end: e.target.value}))}
                />
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="relative h-[300px] w-full flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[12px] font-medium text-[#94A3B8] pr-6 pb-6 h-[260px]">
          {yLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative h-[260px]">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-[#E2E8F0]" />
            ))}
          </div>

          {/* Chart SVG (line + area + markers) and Bars positioned to match points */}
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
                  <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f47b2a" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#f47b2a" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FF8A3D" />
                    <stop offset="100%" stopColor="#f47b2a" />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#f47b2a" floodOpacity="0.12" />
                  </filter>
                </defs>

                {areaD && <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} d={areaD} fill="url(#areaGrad)" stroke="none" />}
                {pathD && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={pathD}
                    className="chart-line"
                    stroke="url(#strokeGrad)"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {projPath && <path d={projPath} fill="none" stroke="#f47b2a" strokeWidth={2} strokeDasharray="6 6" opacity={0.9} />}

                {/* markers */}
                {points.map((p, i) => (
                  <motion.g 
                    key={`m-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                  >
                    <circle cx={p.x} cy={p.y} r={10} fill="#f47b2a" opacity={0.12} />
                    <circle cx={p.x} cy={p.y} r={6} fill="#FFFFFF" stroke="#f47b2a" strokeWidth={2} />
                  </motion.g>
                ))}

                {projPoint && (
                  <g key="proj">
                    <circle cx={projPoint.x} cy={projPoint.y} r={10} fill="#f47b2a" opacity={0.06} />
                    <circle cx={projPoint.x} cy={projPoint.y} r={6} fill="#FFFFFF" stroke="#f47b2a" strokeWidth={2} strokeDasharray="2 2" />
                  </g>
                )}
              </svg>
            )}

            {/* Bars positioned to match computed points (use memoized points) */}
            {points.length > 0 &&
              points.map((p, i) => {
                const v = active[i];
                const rawPercent = (v / maxValue) * 100;
                const minPercent = 6;
                const heightPercent = Math.max(rawPercent, minPercent);
                const heightPx = (heightPercent / 100) * chartHeight;
                const barW = 48;
                const isHighlighted = labels[i] === "2pm" || labels[i] === "Week 4";
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                    style={{ position: "absolute", left: p.x - barW / 2, bottom: 0, width: barW, height: chartHeight }} className="flex items-end justify-center group"
                  >
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      style={{ position: "absolute", bottom: heightPx + 10, left: "50%", transform: "translateX(-50%)" }} className="text-[12px] font-bold text-[#334155] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {typeof v === "number" ? `฿${v}` : v}
                    </motion.div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                      className={`w-full rounded-lg transition-colors duration-300 ${
                        isHighlighted ? "bg-gradient-to-t from-[#FF8A3D] to-[#f47b2a] border-[#f47b2a] shadow-lg shadow-orange-500/20" : "bg-gradient-to-t from-[#FFE6CC] to-[#FFDAB5] hover:from-[#FFDAB5] hover:to-[#FFC58F]"
                      }`}
                    />
                    <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)" }} className="whitespace-nowrap text-[12px] font-bold text-[#64748B]">
                      {labels[i]}
                    </div>
                  </motion.div>
                );
              })}

            {/* Tooltip */}
            {tooltip.show && (
              <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                <div style={{ fontSize: 12 }}>{tooltip.label}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{tooltip.value !== null ? `฿${tooltip.value}` : ""}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
