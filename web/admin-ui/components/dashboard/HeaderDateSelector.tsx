"use client";

import { useEffect, useRef, useState } from "react";

const OPTIONS = [
  { key: "Day", label: "วันนี้ (Today)" },
  { key: "Week", label: "สัปดาห์ (Week)" },
  { key: "Month", label: "เดือน (Month)" },
];

export default function HeaderDateSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(OPTIONS[0]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // listen to programmatic period changes (e.g., chart buttons)
  useEffect(() => {
    function onPeriodChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.period) {
        const opt = OPTIONS.find((o) => o.key === detail.period);
        if (opt) setSelected(opt);
      }
    }
    window.addEventListener("dashboard-period-change", onPeriodChange as EventListener);
    return () => window.removeEventListener("dashboard-period-change", onPeriodChange as EventListener);
  }, []);

  function choose(option: { key: string; label: string }) {
    setSelected(option);
    setOpen(false);
    // broadcast to chart(s)
    try {
      window.dispatchEvent(new CustomEvent("dashboard-period-change", { detail: { period: option.key } }));
    } catch (e) {
      // ignore in non-window environments
    }
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-sm cursor-pointer hover:bg-[#F8FAFC] transition-all"
        onClick={() => setOpen((s) => !s)}
        role="button"
        tabIndex={0}
      >
        <span className="text-lg">📅</span>
        <span className="text-[14px] font-bold text-[#334155]">{selected.label}</span>
        <span className="text-[#64748B] ml-1">▼</span>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E6E9EF] rounded-lg shadow-lg z-50">
          {OPTIONS.map((o) => (
            <div
              key={o.key}
              className={`px-4 py-2 cursor-pointer hover:bg-[#F8FAFC] ${o.key === selected.key ? "font-bold" : "text-[#64748B]"}`}
              onClick={() => choose(o)}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

