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

  const getAlertIcon = (type: string) => {
    if (type.includes("สินค้า")) return "fi-rr-box-open";
    if (type.includes("เงิน")) return "fi-rr-coins";
    if (type.includes("อุณหภูมิ")) return "fi-rr-thermometer-half";
    return "fi-rr-bell";
  };

  const getAlertColor = (type: string) => {
    if (type.includes("สินค้าหมด")) return "text-red-500 bg-red-50";
    if (type.includes("เงิน")) return "text-amber-500 bg-amber-50";
    return "text-blue-500 bg-blue-50";
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 animate-in opacity-0">
        <div>
          <h1 className="text-[32px] font-black text-[#334155] tracking-tight">การแจ้งเตือน</h1>
          <p className="text-[#64748B] font-medium">ติดตามสถานะและข้อผิดพลาดจากตู้สินค้าทั้งหมด</p>
        </div>
        <button 
          onClick={() => openExportModal(alertSections, "การแจ้งเตือน (Alerts)")}
          className="btn-primary !bg-white !text-[#64748B] !border-[#E2E8F0] !border !shadow-sm hover:!border-[#f47b2a] hover:!text-[#f47b2a]"
        >
          <i className="fi fi-rr-download flex items-center"></i>
          Export รายงาน
        </button>
      </div>

      <div className="glass !rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white animate-in opacity-0 delay-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <i className="fi fi-rr-list-check text-lg"></i>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">แจ้งเตือนล่าสุด</h2>
        </div>
        
        <div className="space-y-4">
          {data.alerts.map((a: { id: string; type: string; machine: string; message: string; createdAt: string }, index: number) => (
            <div 
              key={a.id} 
              className={`p-5 rounded-2xl bg-white/50 border border-white/80 hover:border-orange-200 hover:bg-white/80 transition-all cursor-pointer group animate-slide-left opacity-0`}
              style={{ animationDelay: `${200 + (index * 100)}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getAlertColor(a.type)}`}>
                  <i className={`fi ${getAlertIcon(a.type)} text-xl`}></i>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-800 text-lg group-hover:text-[#f47b2a] transition-colors">
                      {a.type} <span className="text-slate-400 font-medium text-sm ml-2">— {a.machine}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#94A3B8] flex items-center gap-2">
                      <i className="fi fi-rr-clock-three"></i>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-slate-500 font-medium">{a.message}</div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <i className="fi fi-rr-angle-small-right text-2xl text-orange-400"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

