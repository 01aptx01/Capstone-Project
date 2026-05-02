"use client";

import MachineCard from "@/components/machines/MachineCard";
import machinesData from "@/lib/mock/machines.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const machineSections: ExportSection[] = [
  {
    id: "machines_list",
    label: "รายชื่อตู้ทั้งหมด (All Machines)",
    description: "ข้อมูลตู้สินค้าทั้งหมดในระบบ",
    columns: [
      { key: "id", label: "รหัสตู้" },
      { key: "name", label: "ชื่อตู้" },
      { key: "location", label: "สถานที่" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => machinesData as Record<string, unknown>[],
  },
];

export default function MachinesPage() {
  const { openAddMachine, openExportModal } = useUI();

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-[#FF6A00] rounded-full"></div>
            <h1 className="text-[28px] font-black text-[#0F172A]">
              จัดการตู้สินค้า
            </h1>
          </div>
          <p className="text-[#64748B] text-[15px] ml-5 font-medium">รายการตู้ที่เชื่อมต่อทั้งหมดในระบบของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openExportModal(machineSections, "จัดการตู้สินค้า")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-bold text-[#64748B] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
          <button 
            onClick={openAddMachine}
            className="btn-primary px-6 py-3 text-[15px]"
          >
            <span className="text-[20px] group-hover:rotate-90 transition-transform duration-300">+</span> 
            เพิ่มตู้สินค้า
          </button>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {machinesData.map((machine: any) => (
          <MachineCard 
            key={machine.id}
            {...machine}
          />
        ))}

        {/* Add New Machine Placeholder/Card */}
        <div 
          onClick={openAddMachine}
          className="group border-2 border-dashed border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[340px] hover:border-[#FF6A00] hover:bg-[#FFF7ED]/50 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-[32px] text-[#94A3B8] group-hover:text-[#FF6A00]">+</span>
          </div>
          <div className="text-[15px] font-bold text-[#64748B] group-hover:text-[#FF6A00]">เพิ่มตู้ใหม่</div>
        </div>
      </div>
    </div>
  );
}
