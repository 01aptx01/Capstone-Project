"use client";

import { useState } from "react";

export default function HeaderDateSelector() {
  const [monthRange, setMonthRange] = useState({ start: "", end: "" });

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-sm">
      <span className="text-[14px] font-medium text-[#64748B] flex items-center gap-2">
        <i className="fi fi-rr-calendar"></i>
        ระบุช่วงเวลา:
      </span>
      <div className="flex items-center gap-2">
        <input 
          type="month" 
          className="px-2 py-1 bg-transparent text-[13px] font-bold text-[#334155] outline-none cursor-pointer hover:text-[#f47b2a] transition-colors"
          value={monthRange.start}
          onChange={(e) => setMonthRange(s => ({...s, start: e.target.value}))}
        />
        <span className="text-[#94A3B8] text-[13px] font-medium">-</span>
        <input 
          type="month" 
          className="px-2 py-1 bg-transparent text-[13px] font-bold text-[#334155] outline-none cursor-pointer hover:text-[#f47b2a] transition-colors"
          value={monthRange.end}
          onChange={(e) => setMonthRange(s => ({...s, end: e.target.value}))}
        />
      </div>
    </div>
  );
}
