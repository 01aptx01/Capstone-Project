"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import couponsData from "@/lib/mock/coupons.json";
import { useUI } from "@/lib/context/UIContext";

// ── Portal Wrapper ────────────────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function CouponTable() {
  const { openCreateCoupon } = useUI();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    expiryDate: ""
  });

  const tabs = ["ทั้งหมด", "กำลังใช้งาน (Active)", "หมดอายุ"];

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const q = search.trim().toLowerCase();
    
    return couponsData.filter((coupon) => {
      // Tab Filtering
      let tabMatch = true;
      const expiry = coupon.expiry ? new Date(coupon.expiry) : null;
      if (activeTab === "กำลังใช้งาน (Active)") {
        tabMatch = coupon.status === "active" && (!expiry || expiry >= now);
      } else if (activeTab === "หมดอายุ") {
        tabMatch = !!expiry && expiry < now;
      }

      // Search Filtering
      const searchMatch =
        q === "" ||
        (coupon.name && coupon.name.toLowerCase().includes(q)) ||
        (coupon.id && coupon.id.toLowerCase().includes(q));

      // Advanced Filters
      const statusMatch = filters.status === "all" || coupon.status === filters.status;
      const typeMatch = filters.type === "all" || coupon.type === filters.type;
      const dateMatch = !filters.expiryDate || (coupon.expiry && coupon.expiry === filters.expiryDate);

      return tabMatch && searchMatch && statusMatch && typeMatch && dateMatch;
    });
  }, [activeTab, search, filters]);

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({ status: "all", type: "all", expiryDate: "" });
    setIsFilterOpen(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.04)] animate-in fade-in duration-700">
      {/* Table Header Section */}
      <div className="px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-gradient-to-b from-white/60 to-transparent">
        <div>
          <h3 className="text-[28px] font-black text-[#334155] tracking-tight mb-2">Promotions & Coupons</h3>
          <p className="text-[#64748B] font-bold text-[15px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f47b2a] animate-pulse"></span>
            Manage and track active marketing campaigns
          </p>
        </div>
        
        <div className="flex bg-slate-100/60 p-1.5 rounded-[22px] border border-white shadow-inner backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[13px] font-black tracking-[0.05em] uppercase transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                activeTab === tab
                  ? "bg-white text-[#f47b2a] shadow-[0_8px_16px_rgba(0,0,0,0.08)] scale-100 translate-y-[-1px]"
                  : "text-[#94A3B8] hover:text-[#334155] hover:bg-white/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar - Refined */}
      <div className="px-12 py-6 border-y border-white/40 bg-white/10 flex items-center gap-4">
        <div className="relative flex-1 group">
          <i className="fi fi-rr-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors text-lg"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, IDs, or keywords..."
            className="w-full pl-14 pr-8 py-5 rounded-[24px] border-2 border-slate-200 bg-white shadow-sm focus:bg-white focus:border-[#f47b2a] focus:ring-8 focus:ring-orange-500/5 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`w-14 h-14 rounded-[22px] border-2 flex items-center justify-center text-xl transition-all duration-300 ${
              filters.status !== "all" || filters.type !== "all" || filters.expiryDate 
                ? "bg-[#f47b2a] border-[#f47b2a] text-white shadow-lg shadow-orange-500/20" 
                : "bg-white border-slate-200 text-slate-400 hover:border-[#f47b2a] hover:text-[#f47b2a] shadow-sm"
            }`}
          >
            <i className="fi fi-rr-filter"></i>
          </button>
          
          <button 
            onClick={openCreateCoupon}
            className="h-14 px-8 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white rounded-[22px] text-[15px] font-black shadow-[0_12px_24px_rgba(244,123,42,0.2)] hover:shadow-[0_15px_30px_rgba(244,123,42,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3 active:translate-y-0 active:scale-95 whitespace-nowrap"
          >
            <i className="fi fi-rr-plus flex items-center"></i>
            สร้างคูปองใหม่
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 border-b border-white/40">
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Campaign Asset</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Type</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Requirement</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Utilization</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Timeline</th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {filteredCoupons.map((coupon, index) => (
              <tr 
                key={coupon.id} 
                className="hover:bg-white/80 transition-all duration-500 group animate-in fade-in slide-in-from-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-12 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-white group-hover:scale-110 group-hover:rotate-[8deg] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                      <span className="drop-shadow-sm">🎟️</span>
                    </div>
                    <div>
                      <div className="text-[17px] font-black text-slate-800 mb-1 group-hover:text-[#f47b2a] transition-colors">{coupon.name}</div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/50 rounded-lg border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{coupon.id}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-8">
                  <span className="inline-block text-[12px] font-black text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm uppercase tracking-wider text-center leading-snug">{coupon.type}</span>
                </td>
                <td className="px-6 py-8">
                  {coupon.points > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-black text-[#f47b2a]">{coupon.points}</span>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Points</span>
                    </div>
                  ) : (
                    <span className="px-4 py-1 bg-slate-50 text-slate-300 text-[11px] font-black rounded-lg uppercase tracking-widest">Free Entry</span>
                  )}
                </td>
                <td className="px-6 py-8 min-w-[240px]">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[18px] font-black text-slate-800">{coupon.usage}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redeemed</span>
                    </div>
                    <span className="text-[10px] font-black text-[#f47b2a] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">Cap: {coupon.maxUsage || "∞"}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100/60 rounded-full overflow-hidden p-[2px] border border-white shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                        coupon.status === 'fully_claimed' ? 'bg-slate-300' : 'bg-gradient-to-r from-[#f47b2a] to-[#FF9E5C]'
                      }`}
                      style={{ width: `${coupon.maxUsage ? (coupon.usage / coupon.maxUsage) * 100 : 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-8">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[13px] font-black text-slate-600">
                      <i className="fi fi-rr-calendar-clock text-[#f47b2a] opacity-60"></i>
                      {coupon.expiry}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Expiry Deadline</span>
                  </div>
                </td>
                <td className="px-12 py-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button className="w-12 h-12 rounded-[18px] border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:border-[#f47b2a] hover:shadow-[0_8px_16px_rgba(244,123,42,0.12)] hover:scale-105 transition-all duration-300">
                      <i className="fi fi-rr-stats text-lg"></i>
                    </button>
                    <button className="w-12 h-12 rounded-[18px] border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:shadow-[0_8px_16px_rgba(16,185,129,0.12)] hover:scale-105 transition-all duration-300">
                      <i className="fi fi-rr-edit text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-12 py-10 bg-slate-50/50 border-t border-white/40 flex justify-between items-center">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredCoupons.length} Campaign Results</p>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl border border-white bg-white text-slate-400 font-black text-[12px] uppercase tracking-widest shadow-sm hover:text-slate-600 transition-all">Previous</button>
          <button className="px-8 py-3 rounded-xl bg-[#334155] text-white font-black text-[12px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Next Page</button>
        </div>
      </div>

      {/* Advanced Filter Modal */}
      {isFilterOpen && (
        <Portal>
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsFilterOpen(false)}
          >
            <div 
              className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800">Advanced Filter</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fi fi-rr-cross-small text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f47b2a] font-bold text-slate-700 transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="fully_claimed">Fully Claimed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Coupon Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f47b2a] font-bold text-slate-700 transition-all"
                  >
                    <option value="all">All Types</option>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (฿)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Expiry Date</label>
                  <input 
                    type="date"
                    value={filters.expiryDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f47b2a] font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={clearFilters}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black text-[14px] rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-4 bg-[#f47b2a] text-white font-black text-[14px] rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-95"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

