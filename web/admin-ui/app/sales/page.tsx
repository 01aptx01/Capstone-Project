"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import salesData from "@/lib/mock/sales.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";

const salesSections: ExportSection[] = [
  {
    id: "sales_summary",
    label: "สรุปยอดขาย (Sales Summary)",
    description: "ยอดรวมวันนี้, เมื่อวาน, และอัตราเปลี่ยนแปลง",
    columns: [
      { key: "metric", label: "หัวข้อ" },
      { key: "value", label: "ค่า" },
    ],
    fetchData: async () => [
      { metric: "ยอดขายวันนี้ (฿)", value: salesData.summary.today },
      { metric: "ยอดขายเมื่อวาน (฿)", value: salesData.summary.yesterday },
      { metric: "อัตราเปลี่ยนแปลง (%)", value: salesData.summary.change_percent },
    ],
  },
  {
    id: "transactions",
    label: "รายการธุรกรรม (Transactions)",
    description: "รายละเอียดการซื้อขายที่เกิดขึ้นทั้งหมด",
    columns: [
      { key: "orderId", label: "เลขออเดอร์" },
      { key: "time", label: "เวลา" },
      { key: "machine", label: "ตู้" },
      { key: "items", label: "จำนวนรายการ" },
      { key: "amount", label: "ยอดเงิน (฿)" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => salesData.transactions as Record<string, unknown>[],
  },
];

export default function SalesPage() {
  const { openExportModal } = useUI();
  const data = salesData;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">Paid</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">Processing</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">Failed</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-100">{status}</span>;
    }
  };

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            ประวัติธุรกรรม
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">ติดตามยอดขายและการชำระเงินแบบ Real-time</p>
        </div>
        <button 
          onClick={() => openExportModal(salesSections, "ยอดขาย (Sales)")}
          className="btn-primary"
        >
          <i className="fi fi-rr-download flex items-center"></i>
          Export ข้อมูลการขาย
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard 
            title="ยอดขายวันนี้" 
            value={`฿${data.summary.today.toLocaleString()}`} 
            icon={<i className="fi fi-rr-stats"></i>}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            trend={`${data.summary.change_percent}%`}
            trendDirection={data.summary.change_percent >= 0 ? "up" : "down"}
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard 
            title="ยอดขายเมื่อวาน" 
            value={`฿${data.summary.yesterday.toLocaleString()}`} 
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="#F0F9FF"
            iconColor="#0EA5E9"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard 
            title="เฉลี่ยต่อออเดอร์" 
            value="฿42.50" 
            icon={<i className="fi fi-rr-receipt"></i>}
            iconBg="#FDF2F8"
            iconColor="#DB2777"
            trend="2.4%"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-400">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[#334155]">รายการธุรกรรมล่าสุด</h2>
          <div className="flex gap-4">
             <div className="relative">
              <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select className="pl-11 pr-10 py-2.5 bg-slate-50 border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer min-w-[200px]">
                <option>ทุกจุดติดตั้ง</option>
                <option>MOD PAO Building LX</option>
                <option>MOD PAO Building N7</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"></i>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Transaction ID</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Time</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Machine</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Amount</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Status</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.transactions.map((t: { orderId: string; time: string; machine: string; amount: number; status: string }) => (
                <tr key={t.orderId} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-[15px] font-black text-[#334155]">{t.orderId}</span>
                  </td>
                  <td className="px-8 py-5 text-[14px] font-semibold text-[#64748B]">
                    {t.time}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-vending-machine text-slate-300"></i>
                      <span className="text-[14px] font-bold text-slate-600">{t.machine}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[16px] font-black text-[#334155]">฿{t.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:border-orange-200 transition-all shadow-sm">
                      <i className="fi fi-rr-arrow-right text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[13px] font-black text-slate-400 uppercase tracking-wider">Transaction History Page 1 of 42</p>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[13px] font-black text-slate-400 hover:bg-slate-50 transition-all">Previous</button>
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-black text-[#334155] hover:bg-slate-50 transition-all">Next Page</button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

