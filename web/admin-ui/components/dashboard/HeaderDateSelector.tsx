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
        className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#f47b2a] hover:shadow-md transition-all active:scale-95"
      >
        <i className="fi fi-rr-calendar text-[#f47b2a]"></i>
        <span className={`text-[14px] font-bold ${appliedRange.start || appliedRange.end ? 'text-[#f47b2a]' : 'text-[#334155]'}`}>
          {displayString}
        </span>
        <i className={`fi fi-rr-angle-small-down text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <i className="fi fi-rr-calendar-clock text-[#f47b2a]"></i>
            <h3 className="font-bold text-[#334155]">เลือกช่วงเวลา</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ตั้งแต่เดือน</label>
              <input 
                type="month" 
                className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-[14px] font-bold text-[#334155] outline-none focus:bg-white focus:border-orange-100 transition-all"
                value={tempRange.start}
                onChange={(e) => setTempRange(s => ({...s, start: e.target.value}))}
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ถึงเดือน</label>
              <input 
                type="month" 
                className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-[14px] font-bold text-[#334155] outline-none focus:bg-white focus:border-orange-100 transition-all"
                value={tempRange.end}
                onChange={(e) => setTempRange(s => ({...s, end: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button 
              onClick={handleClear}
              className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-colors"
            >
              ล้าง
            </button>
            <button 
              onClick={handleApply}
              className="flex-1 py-2 bg-[#f47b2a] text-white rounded-xl font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
