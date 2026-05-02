"use client";

import ordersData from "@/lib/mock/orders.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

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

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">คำสั่งซื้อ</h1>
          <p className="text-[#64748B]">รายการคำสั่งซื้อล่าสุด</p>
        </div>
        <button 
          onClick={() => openExportModal(orderSections, "คำสั่งซื้อ (Orders)")}
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

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="font-bold mb-3">คำสั่งซื้อ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-[#64748B]"><th className="py-2">ID</th><th>Time</th><th>Items</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.orders.map((o: { id: string; time: string; items: number; amount: number; status: string }) => (
                <tr key={o.id} className="border-t border-[#EEF2F6]">
                  <td className="py-3">{o.id}</td>
                  <td>{o.time}</td>
                  <td>{o.items}</td>
                  <td>฿{o.amount}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
