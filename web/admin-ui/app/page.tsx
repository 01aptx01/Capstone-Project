"use client";

import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import HeaderDateSelector from "@/components/dashboard/HeaderDateSelector";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const dashboardSections: ExportSection[] = [
  {
    id: "overview",
    label: "ข้อมูลภาพรวม (Overview Stats)",
    description: "ยอดขายรวม, จำนวนคำสั่งซื้อ, และตู้ที่ทำงานอยู่",
    columns: [
      { key: "metric", label: "หัวข้อ" },
      { key: "value", label: "ค่าที่ได้" },
      { key: "trend", label: "แนวโน้ม" },
    ],
    fetchData: async () => [
      { metric: "ยอดขายวันนี้", value: "฿1,458.50", trend: "+12.5%" },
      { metric: "จำนวนคำสั่งซื้อ", value: "342", trend: "+8.2%" },
      { metric: "ตู้ที่ทำงานอยู่", value: "48/50", trend: "-" },
      { metric: "แจ้งเตือนสต็อกต่ำ", value: "12", trend: "+2" },
    ],
  },
  {
    id: "sales",
    label: "ธุรกรรมล่าสุด (Recent Transactions)",
    description: "รายการขายล่าสุดจากทุกตู้",
    columns: [
      { key: "orderId", label: "เลขออเดอร์" },
      { key: "time", label: "เวลา" },
      { key: "machine", label: "ตู้" },
      { key: "amount", label: "จำนวนเงิน (฿)" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => [
      { orderId: "O1001", time: "06:12", machine: "M01", amount: 120.5, status: "completed" },
      { orderId: "O1002", time: "07:03", machine: "M02", amount: 50.0, status: "completed" },
      { orderId: "O1003", time: "08:45", machine: "M01", amount: 5.0, status: "refunded" },
      { orderId: "O1004", time: "10:15", machine: "M03", amount: 180.0, status: "completed" },
    ],
  },
  {
    id: "machines",
    label: "สถานะตู้สินค้า (Machine Status)",
    description: "รายชื่อตู้และสถานะการทำงาน",
    columns: [
      { key: "id", label: "รหัสตู้" },
      { key: "name", label: "ชื่อตู้" },
      { key: "location", label: "สถานที่" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => [
      { id: "MP-001", name: "MOD PAO Building LX", location: "อาคาร LX", status: "online" },
      { id: "MP-002", name: "MOD PAO Building N7", location: "อาคาร N7", status: "online" },
      { id: "MP-003", name: "MOD PAO Canteen KFC", location: "อาคาร 190 ปี", status: "online" },
    ],
  },
];

export default function Home() {
  const { openExportModal } = useUI();

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] mb-1">
            ภาพรวม <span className="text-[#64748B] font-medium text-[20px] ml-1">(Overview)</span>
          </h1>
          <p className="text-[#64748B] text-[15px]">ภาพรวมข้อมูลการทำงานของตู้ทั้งหมดในวันนี้</p>
        </div>

        <div className="flex items-center gap-3">
          <HeaderDateSelector />
          <button 
            onClick={() => openExportModal(dashboardSections, "ภาพรวม Dashboard")}
            className="flex items-center gap-2 bg-[#FF6A00] hover:bg-[#E55F00] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(255,106,0,0.15)] transition-all"
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        <div className="animate-scale-in opacity-0">
          <DashboardCard 
            title="ยอดขายวันนี้" 
            value="฿1,458.50" 
            icon="₿" 
            trend="12.5%" 
            trendDirection="up" 
            accentColor="#FFF7ED"
            href="/sales"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-100">
          <DashboardCard 
            title="จำนวนคำสั่งซื้อ" 
            value="342" 
            icon="📄" 
            trend="8.2%" 
            trendDirection="up" 
            accentColor="#FFF7ED"
            href="/orders"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <DashboardCard 
            title="ตู้ที่ทำงานอยู่" 
            value="48" 
            subValue="/ 50"
            icon="📟" 
            accentColor="#FFF7ED"
            href="/machines"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <DashboardCard 
            title="แจ้งเตือนสต็อกต่ำ" 
            value="12" 
            icon="⚠️" 
            trend="+2" 
            trendDirection="neutral" 
            accentColor="#FEF2F2" 
            valueColor="#DC2626"
            href="/alerts"
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <DashboardChart />
      </div>
    </div>
  );
}


