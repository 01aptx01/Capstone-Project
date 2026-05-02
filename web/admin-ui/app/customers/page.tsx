"use client";

import ReportCard from "@/components/dashboard/ReportCard";
import CouponTable from "@/components/customers/CouponTable";
import couponsData from "@/lib/mock/coupons.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const customerSections: ExportSection[] = [
  {
    id: "customer_metrics",
    label: "สรุปข้อมูลลูกค้า (Customer Metrics)",
    description: "จำนวนสมาชิก, พอยท์, และคูปองที่ใช้",
    columns: [
      { key: "metric", label: "หัวข้อ" },
      { key: "value", label: "ค่า" },
    ],
    fetchData: async () => [
      { metric: "สมาชิกทั้งหมด", value: "12,450 คน" },
      { metric: "พอยท์หมุนเวียนในระบบ", value: "452,000 Pts" },
      { metric: "คูปองถูกใช้ (เดือนนี้)", value: "3,420 ครั้ง" },
      { metric: "แคมเปญที่กำลังเปิด", value: "4 แคมเปญ" },
    ],
  },
  {
    id: "coupons_list",
    label: "รายการคูปอง (Coupons)",
    description: "คูปองทั้งหมดในระบบ",
    columns: [
      { key: "id", label: "รหัสคูปอง" },
      { key: "name", label: "ชื่อคูปอง" },
      { key: "type", label: "ประเภท" },
      { key: "points", label: "พอยท์ที่ใช้" },
      { key: "usage", label: "ถูกใช้แล้ว" },
      { key: "maxUsage", label: "ใช้ได้สูงสุด" },
      { key: "expiry", label: "วันหมดอายุ" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => couponsData as Record<string, unknown>[],
  },
];

export default function CustomersPage() {
  const { openExportModal } = useUI();

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0F172A] mb-1">
            ลูกค้า & โปรโมชัน
          </h1>
          <p className="text-[#64748B] text-[15px]">จัดการข้อมูลสมาชิก คูปองส่วนลด และแคมเปญสะสมพอยท์</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openExportModal(customerSections, "ลูกค้า & โปรโมชัน")}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#475569] border border-[#E2E8F0] rounded-xl text-[14px] font-bold hover:bg-[#F8FAFC] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-xl text-[14px] font-bold shadow-[0_8px_20px_rgba(255,106,0,0.25)] hover:bg-[#E55F00] hover:-translate-y-0.5 transition-all">
            <span className="text-[18px]">+</span> สร้างคูปองใหม่
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="สมาชิกทั้งหมด" 
          value="12,450" 
          subValue="คน"
          trend="125" 
          trendDirection="up"
          icon="👥"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
        />
        <ReportCard 
          title="พอยท์หมุนเวียนในระบบ" 
          value="452,000" 
          subValue="Pts"
          icon="🪙"
          iconBg="#FFF7ED"
          iconColor="#F97316"
        />
        <ReportCard 
          title="คูปองถูกใช้ (เดือนนี้)" 
          value="3,420" 
          subValue="ครั้ง"
          trend="12%" 
          trendDirection="up"
          icon="🎟️"
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />
        <ReportCard 
          title="แคมเปญที่กำลังเปิดใช้งาน" 
          value="4" 
          subValue="แคมเปญ"
          icon="🎁"
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
        />
      </div>

      {/* Main Content Section */}
      <div className="pb-8">
        <CouponTable />
      </div>
    </div>
  );
}
