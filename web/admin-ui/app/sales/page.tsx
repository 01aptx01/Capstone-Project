"use client";

import salesData from "@/lib/mock/sales.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

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

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">ยอดขาย</h1>
          <p className="text-[#64748B]">รายละเอียดยอดขายวันนี้</p>
        </div>
        <button 
          onClick={() => openExportModal(salesSections, "ยอดขาย (Sales)")}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">วันนี้</div>
          <div className="text-2xl font-extrabold">฿{data.summary.today}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">เมื่อวาน</div>
          <div className="text-2xl font-extrabold">฿{data.summary.yesterday}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">เปลี่ยนแปลง</div>
          <div className="text-2xl font-extrabold">{data.summary.change_percent}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="font-bold mb-3">รายการธุรกรรม (ล่าสุด)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-[#64748B]"><th className="py-2">Order</th><th>Time</th><th>Machine</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.transactions.map((t: { orderId: string; time: string; machine: string; amount: number; status: string }) => (
                <tr key={t.orderId} className="border-t border-[#EEF2F6]">
                  <td className="py-3">{t.orderId}</td>
                  <td>{t.time}</td>
                  <td>{t.machine}</td>
                  <td>฿{t.amount}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
