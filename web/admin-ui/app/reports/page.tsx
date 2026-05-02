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
    <div className="max-w-[1400px] mx-auto py-8 px-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[32px] font-black text-[#334155] mb-2 tracking-tight">
            รายงานและสถิติ
          </h1>
          <p className="text-[#64748B] text-[15px] font-medium">วิเคราะห์ประสิทธิภาพการทำงานและแนวโน้มยอดขายเชิงลึก</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => openExportModal(reportSections, "สถิติและรายงาน (Reports)")}
            className="btn-primary !py-3 !px-6"
          >
            <i className="fi fi-rr-download flex items-center"></i>
            Export
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="animate-in opacity-0 delay-100 h-full">
          <ReportCard
            isFeatured={true}
            title="ยอดขายรวมเดือนนี้"
            value="฿124,500"
            trend="18.5%"
            subValue="เทียบกับเดือนที่แล้ว (฿105,000)"
          />
        </div>
        <div className="animate-in opacity-0 delay-200 h-full">
          <ReportCard
            title="เฉลี่ยต่อตู้"
            value="฿24,900"
            subValue="/เดือน"
            trend="5.2%"
            icon={<i className="fi fi-rr-box-open"></i>}
            iconBg="#4F46E5"
          />
        </div>
        <div className="animate-in opacity-0 delay-300 h-full">
          <ReportCard
            title="ออเดอร์ทั้งหมด"
            value="3,842"
            subValue="ออเดอร์"
            trend="12.0%"
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            iconBg="#10B981"
          />
        </div>
        <div className="animate-in opacity-0 delay-400 h-full">
          <ReportCard
            title="ความเสถียรระบบ"
            value="99.8%"
            trend="คงที่"
            trendDirection="neutral"
            icon={<i className="fi fi-rr-bolt"></i>}
            iconBg="#EF4444"
          />
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-in opacity-0 delay-500">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1 animate-in opacity-0 delay-500">
          <EfficiencyChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="animate-in opacity-0 delay-700 pb-16">
        <SalesByLocation />
      </div>
    </div>
  );
}
