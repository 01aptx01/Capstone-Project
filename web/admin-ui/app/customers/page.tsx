"use client";

import PageWrapper from "@/components/layout/PageWrapper";
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
  const { openExportModal, openCreateCoupon } = useUI();

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            ลูกค้า & โปรโมชัน
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">จัดการข้อมูลสมาชิก คูปองส่วนลด และแคมเปญสะสมพอยท์เพื่อกระตุ้นยอดขาย</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => openExportModal(customerSections, "ลูกค้า & โปรโมชัน")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export ข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-scale-in opacity-0 delay-100">
          <ReportCard 
            title="สมาชิกทั้งหมด" 
            value="12,450" 
            subValue="คน"
            trend="8.4%" 
            trendDirection="up"
            icon={<i className="fi fi-rr-users"></i>}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-200">
          <ReportCard 
            title="พอยท์ในระบบ" 
            value="452,000" 
            subValue="Pts"
            trend="12.2%"
            trendDirection="up"
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="#FFF7ED"
            iconColor="#f47b2a"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-300">
          <ReportCard 
            title="คูปองถูกใช้ (เดือนนี้)" 
            value="3,420" 
            subValue="ครั้ง"
            trend="15.5%" 
            trendDirection="up"
            icon={<i className="fi fi-rr-ticket"></i>}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>
        <div className="animate-scale-in opacity-0 delay-400">
          <ReportCard 
            title="แคมเปญเปิดอยู่" 
            value="4" 
            subValue="แคมเปญ"
            icon={<i className="fi fi-rr-gift"></i>}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
          />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="animate-in opacity-0 delay-500 pb-12">
        <div className="glass !rounded-[40px] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white overflow-hidden">
          <CouponTable />
        </div>
      </div>
    </PageWrapper>
  );
}

