import DashboardChart from "@/components/dashboard/DashboardChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import HeaderDateSelector from "@/components/dashboard/HeaderDateSelector";

export default function Home() {
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
          <button className="flex items-center gap-2 bg-[#FF6A00] hover:bg-[#E55F00] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(255,106,0,0.15)] transition-all">
            <span>📥</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        <DashboardCard 
          title="ยอดขายวันนี้" 
          value="฿1,458.50" 
          icon="₿" 
          trend="12.5%" 
          trendDirection="up" 
          accentColor="#FFF7ED"
          href="/sales"
        />
        <DashboardCard 
          title="จำนวนคำสั่งซื้อ" 
          value="342" 
          icon="📄" 
          trend="8.2%" 
          trendDirection="up" 
          accentColor="#FFF7ED"
          href="/orders"
        />
        <DashboardCard 
          title="ตู้ที่ทำงานอยู่" 
          value="48" 
          subValue="/ 50"
          icon="📟" 
          accentColor="#FFF7ED"
          href="/machines"
        />
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

      {/* Chart Section */}
      <div className="mb-8">
        <DashboardChart />
      </div>
    </div>
  );
}

