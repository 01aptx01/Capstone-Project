"use client";

import ReportCard from "@/components/dashboard/ReportCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import EfficiencyChart from "@/components/dashboard/EfficiencyChart";
import SalesByLocation from "@/components/dashboard/SalesByLocation";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const reportSections: ExportSection[] = [
  {
    id: "reports_kpi",
    label: "KPI หลัก (Key Metrics)",
    description: "ยอดขายรวม, เฉลี่ยต่อตู้, ออเดอร์ และ Uptime",
    columns: [
      { key: "metric", label: "ตัวชี้วัด" },
      { key: "value", label: "ค่า" },
      { key: "trend", label: "แนวโน้ม" },
    ],
    fetchData: async () => [
      { metric: "ยอดขายรวมเดือนนี้ (฿)", value: "124,500", trend: "+18.5%" },
      { metric: "ยอดขายเฉลี่ยต่อตู้ (฿)", value: "24,900", trend: "+5.2%" },
      { metric: "คำสั่งซื้อทั้งหมด", value: "3,842", trend: "+12.0%" },
      { metric: "ความเสถียรระบบ (Uptime)", value: "99.8%", trend: "คงที่" },
    ],
  },
  {
    id: "reports_by_location",
    label: "ยอดขายตามสาขา (Sales by Location)",
    description: "เปรียบเทียบยอดขายของแต่ละตู้",
    columns: [
      { key: "location", label: "สาขา" },
      { key: "sales", label: "ยอดขาย (฿)" },
      { key: "orders", label: "ออเดอร์" },
    ],
    fetchData: async () => [
      { location: "MOD PAO Building LX", sales: "52,300", orders: "1,540" },
      { location: "MOD PAO Building N7", sales: "41,200", orders: "1,245" },
      { location: "MOD PAO Canteen KFC", sales: "31,000", orders: "1,057" },
    ],
  },
];

export default function ReportsPage() {
  const { openExportModal } = useUI();

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0F172A] mb-1">
            สถิติและรายงาน (Reports & Analytics)
          </h1>
          <p className="text-[#64748B] text-[15px]">Deep insights into operational performance and sales metrics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openExportModal(reportSections, "สถิติและรายงาน (Reports)")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-bold text-[#64748B] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
        <ReportCard 
          isFeatured={true}
          title="ยอดขายรวมเดือนนี้" 
          value="฿124,500" 
          trend="18.5%" 
          subValue="เทียบกับเดือนที่แล้ว (฿105,000)" 
        />
        <ReportCard 
          title="ยอดขายเฉลี่ยต่อตู้" 
          value="฿24,900" 
          subValue="/เดือน"
          trend="5.2%" 
          icon="📦"
        />
        <ReportCard 
          title="คำสั่งซื้อทั้งหมด" 
          value="3,842" 
          subValue="ออเดอร์"
          trend="12.0%" 
          icon="🛒"
        />
        <ReportCard 
          title="ความเสถียรของระบบ (Uptime)" 
          value="99.8%" 
          trend="คงที่"
          trendDirection="neutral"
          icon="⚡"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <EfficiencyChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 pb-8">
        <SalesByLocation />
      </div>
    </div>
  );
}
