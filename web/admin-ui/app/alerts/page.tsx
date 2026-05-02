"use client";

import alertsData from "@/lib/mock/alerts.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const alertSections: ExportSection[] = [
  {
    id: "alerts_list",
    label: "รายการแจ้งเตือน (All Alerts)",
    description: "แจ้งเตือนทั้งหมดจากตู้สินค้า",
    columns: [
      { key: "id", label: "รหัสแจ้งเตือน" },
      { key: "machine", label: "รหัสตู้" },
      { key: "type", label: "ประเภท" },
      { key: "message", label: "ข้อความ" },
      { key: "severity", label: "ระดับ" },
      { key: "createdAt", label: "เวลา" },
    ],
    fetchData: async () => alertsData.alerts as Record<string, unknown>[],
  },
];

export default function AlertsPage() {
  const { openExportModal } = useUI();
  const data = alertsData;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">แจ้งเตือน</h1>
          <p className="text-[#64748B]">รายการแจ้งเตือนจากตู้</p>
        </div>
        <button 
          onClick={() => openExportModal(alertSections, "การแจ้งเตือน (Alerts)")}
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
        <h2 className="font-bold mb-3">แจ้งเตือนล่าสุด</h2>
        <div className="space-y-3">
          {data.alerts.map((a: { id: string; type: string; machine: string; message: string; createdAt: string }) => (
            <div key={a.id} className="p-3 border rounded-lg border-[#EEF2F6]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{a.type} — {a.machine}</div>
                  <div className="text-sm text-[#64748B]">{a.message}</div>
                </div>
                <div className="text-sm text-[#94A3B8]">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
