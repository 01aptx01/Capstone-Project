"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import ordersData from "@/lib/mock/orders.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import ReportCard from "@/components/dashboard/ReportCard";

const orderSections: ExportSection[] = [
  {
    id: "orders_summary",
    label: "สรุปคำสั่งซื้อ (Orders Summary)",
    description: "จำนวนออเดอร์ตามสถานะ",
    columns: [
      { key: "metric", label: "สถานะ" },
      { key: "value", label: "จำนวน" },
    ],
    fetchData: async () => [
      { metric: "ออเดอร์ทั้งหมด", value: ordersData.summary.total },
      { metric: "รอดำเนินการ (Pending)", value: ordersData.summary.pending },
      { metric: "กำลังดำเนินการ (Processing)", value: ordersData.summary.processing },
      { metric: "สำเร็จแล้ว (Completed)", value: ordersData.summary.completed },
    ],
  },
  {
    id: "orders_list",
    label: "รายการออเดอร์ (Order List)",
    description: "รายละเอียดคำสั่งซื้อทั้งหมด",
    columns: [
      { key: "id", label: "เลขออเดอร์" },
      { key: "time", label: "เวลา" },
      { key: "items", label: "จำนวนสินค้า" },
      { key: "amount", label: "ยอดเงิน (฿)" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => ordersData.orders as Record<string, unknown>[],
  },
];

export default function OrdersPage() {
  const { openExportModal } = useUI();
  const data = ordersData;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">Completed</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-100">Pending</span>;
      case 'refunded':
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-rose-100">Refunded</span>;
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
            ประวัติการสั่งซื้อ
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">ตรวจสอบและจัดการรายการธุรกรรมทั้งหมดในระบบ</p>
        </div>
        <button 
          onClick={() => openExportModal(orderSections, "คำสั่งซื้อ (Orders)")}
          className="btn-primary"
        >
          <i className="fi fi-rr-download flex items-center"></i>
          Export รายงาน
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-in opacity-0 delay-100">
          <ReportCard 
            title="ออเดอร์ทั้งหมด" 
            value={data.summary.total} 
            icon={<i className="fi fi-rr-shopping-cart"></i>}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
        </div>
        <div className="animate-in opacity-0 delay-200">
          <ReportCard 
            title="รอดำเนินการ" 
            value={data.summary.pending} 
            icon={<i className="fi fi-rr-time-past"></i>}
            iconBg="#FFF7ED"
            iconColor="#F59E0B"
          />
        </div>
        <div className="animate-in opacity-0 delay-300">
          <ReportCard 
            title="สำเร็จแล้ว" 
            value={data.summary.completed} 
            icon={<i className="fi fi-rr-check-circle"></i>}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>
        <div className="animate-in opacity-0 delay-400">
          <ReportCard 
            title="ยอดเงินรวม" 
            value="฿42,500" 
            icon={<i className="fi fi-rr-coins"></i>}
            iconBg="#FDF2F8"
            iconColor="#DB2777"
            trend="12.5%"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="vibrant-card !rounded-[32px] overflow-hidden animate-in opacity-0 delay-500">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[#334155]">รายการออเดอร์ล่าสุด</h2>
          <div className="relative">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="ค้นหาเลขออเดอร์..." 
              className="pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-orange-100 w-64 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">Order ID</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">Timestamp</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">Items</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">Total Amount</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.orders.map((o: { id: string; time: string; items: number; amount: number; status: string }) => (
                <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-[15px] font-black text-[#334155]">{o.id}</span>
                  </td>
                  <td className="px-8 py-5 text-[14px] font-semibold text-[#64748B]">
                    วันนี้, {o.time}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[12px] font-black text-slate-500">
                        {o.items}
                      </div>
                      <span className="text-[14px] font-bold text-slate-600">รายการ</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[16px] font-black text-[#334155]">฿{o.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(o.status)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:border-orange-200 transition-all shadow-sm">
                      <i className="fi fi-rr-eye text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-400">แสดง 1-10 จากทั้งหมด 342 รายการ</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[13px] font-black text-slate-400 hover:bg-slate-50 transition-all">Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-black text-[#334155] hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

