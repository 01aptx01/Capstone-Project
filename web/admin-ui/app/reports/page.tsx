import ReportCard from "../../components/ReportCard";
import RevenueChart from "../../components/RevenueChart";
import EfficiencyChart from "../../components/EfficiencyChart";
import SalesByLocation from "../../components/SalesByLocation";

export const metadata = { title: 'Reports & Analytics' };

export default function ReportsPage() {
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
          <button className="px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-bold text-[#64748B] shadow-sm hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all">
            CSV
          </button>
          <button className="px-6 py-2.5 bg-[#FF6A00] text-white rounded-xl text-[14px] font-bold shadow-[0_8px_20px_rgba(255,106,0,0.25)] hover:bg-[#E55F00] hover:-translate-y-0.5 transition-all">
            PDF
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
