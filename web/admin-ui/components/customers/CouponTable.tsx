"use client";

import { useState, useMemo } from "react";
import couponsData from "@/lib/mock/coupons.json";

export default function CouponTable() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");

  const tabs = ["ทั้งหมด", "กำลังใช้งาน (Active)", "หมดอายุ"];

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const q = search.trim().toLowerCase();
    return couponsData.filter((coupon) => {
      let tabMatch = true;
      const expiry = coupon.expiry ? new Date(coupon.expiry) : null;
      if (activeTab === "กำลังใช้งาน (Active)") {
        tabMatch = coupon.status === "active" && (!expiry || expiry >= now);
      } else if (activeTab === "หมดอายุ") {
        tabMatch = !!expiry && expiry < now;
      }

      const searchMatch =
        q === "" ||
        (coupon.name && coupon.name.toLowerCase().includes(q)) ||
        (coupon.id && coupon.id.toLowerCase().includes(q));

      return tabMatch && searchMatch;
    });
  }, [activeTab, search]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      {/* Table Header */}
      <div className="px-8 py-6 border-bottom border-[#F1F5F9] flex items-center justify-between">
        <h3 className="text-[18px] font-black text-[#0F172A]">รายการคูปองและโปรโมชัน</h3>
      </div>

      {/* Search & Tabs */}
      <div className="px-8 py-4 border-t border-[#F1F5F9] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full max-w-lg">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสคูปอง"
            className="w-full px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[14px] placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-[#FF6A00] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-y border-[#F1F5F9]">
              <th className="px-8 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">คูปอง / โปรโมชัน</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">ประเภท</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">พอยท์ที่ใช้</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">การใช้งาน</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">วันหมดอายุ</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">สถานะ</th>
              <th className="px-8 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-[#FDFBFA] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center text-xl shadow-sm border border-[#FFEDD5] group-hover:scale-110 transition-transform">
                      🎟️
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-[#0F172A]">{coupon.name}</div>
                      <div className="text-[12px] font-medium text-[#94A3B8]">{coupon.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-6">
                  <span className="text-[14px] font-bold text-[#475569]">{coupon.type}</span>
                </td>
                <td className="px-4 py-6">
                  {coupon.points > 0 ? (
                    <span className="text-[14px] font-black text-[#FF6A00]">{coupon.points} <span className="text-[11px] font-bold text-[#94A3B8]">Pts</span></span>
                  ) : (
                    <span className="text-[14px] font-bold text-[#CBD5E1]">-</span>
                  )}
                </td>
                <td className="px-4 py-6 min-w-[180px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-black text-[#334155]">{coupon.usage} <span className="text-[11px] font-medium text-[#94A3B8]">ครั้ง</span></span>
                    <span className="text-[11px] font-bold text-[#94A3B8]">/ {coupon.maxUsage || "ไม่จำกัด"}</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        coupon.status === 'fully_claimed' ? 'bg-[#94A3B8]' : 'bg-[#3B82F6]'
                      }`}
                      style={{ width: `${coupon.maxUsage ? (coupon.usage / coupon.maxUsage) * 100 : 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-4 py-6">
                  <span className="text-[14px] font-bold text-[#475569]">{coupon.expiry}</span>
                </td>
                <td className="px-4 py-6 text-center">
                  {coupon.status === 'active' ? (
                    <span className="px-4 py-1.5 bg-[#ECFDF5] text-[#059669] text-[12px] font-bold rounded-full border border-[#D1FAE5]">Active</span>
                  ) : (
                    <span className="px-4 py-1.5 bg-[#F1F5F9] text-[#64748B] text-[12px] font-bold rounded-full border border-[#E2E8F0]">Fully Claimed</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="w-10 h-10 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] hover:bg-white hover:text-[#FF6A00] hover:border-[#FF6A00] hover:shadow-md transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
