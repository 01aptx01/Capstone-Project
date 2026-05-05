"use client";

import { useState, useRef, useEffect } from "react";

export default function HeaderDateSelector() {
  const [isOpen, setIsOpen] = useState(false);

  const [appliedRange, setAppliedRange] = useState({ start: "", end: "" });
  const [tempRange, setTempRange] = useState({ start: "", end: "" });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setTempRange(appliedRange); // Copy current to temp when opening
    setIsOpen(!isOpen);
  };

  const handleApply = () => {
    setAppliedRange(tempRange);
    setIsOpen(false);
  };

  const handleClear = () => {
    const empty = { start: "", end: "" };
    setTempRange(empty);
    setAppliedRange(empty);
    setIsOpen(false);
  };

  // Helper to format "YYYY-MM" -> "MM/YYYY" for display
  const formatDisplay = (val: string) => {
    if (!val) return "";
    const [year, month] = val.split("-");
    return `${month}/${year}`;
  };

  const displayString = (appliedRange.start || appliedRange.end)
    ? `${appliedRange.start ? formatDisplay(appliedRange.start) : '...'} ถึง ${appliedRange.end ? formatDisplay(appliedRange.end) : '...'}`
    : "ระบุช่วงเวลา";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-3 px-5 py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all active:scale-95"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border)",
        }}
      >
        <i className="fi fi-rr-calendar" style={{ color: "var(--primary)" }}></i>
        <span
          className="text-[14px] font-bold"
          style={{ color: appliedRange.start || appliedRange.end ? "var(--primary)" : "var(--text)" }}
        >
          {displayString}
        </span>
        <i className={`fi fi-rr-angle-small-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: "var(--text-muted)" }}></i>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl border z-50 p-5 animate-in fade-in zoom-in-95 duration-200"
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <i className="fi fi-rr-calendar-clock" style={{ color: "var(--primary)" }}></i>
            <h3 className="font-bold" style={{ color: "var(--text)" }}>เลือกช่วงเวลา</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>ตั้งแต่เดือน</label>
              <input
                type="month"
                className="w-full px-3 py-2 border-2 rounded-xl text-[14px] font-bold outline-none transition-all"
                style={{
                  background: "var(--input-bg)",
                  borderColor: "transparent",
                  color: "var(--text)",
                }}
                value={tempRange.start}
                onChange={(e) => setTempRange(s => ({ ...s, start: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>ถึงเดือน</label>
              <input
                type="month"
                className="w-full px-3 py-2 border-2 rounded-xl text-[14px] font-bold outline-none transition-all"
                style={{
                  background: "var(--input-bg)",
                  borderColor: "transparent",
                  color: "var(--text)",
                }}
                value={tempRange.end}
                onChange={(e) => setTempRange(s => ({ ...s, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleClear}
              className="flex-1 py-2 rounded-xl font-bold transition-colors border"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                borderColor: "var(--border)",
              }}
            >
              ล้าง
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-xl font-bold transition-all"
              style={{
                background: "var(--primary)",
                color: "var(--primary-contrast)",
                boxShadow: "var(--shadow-primary)",
              }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
