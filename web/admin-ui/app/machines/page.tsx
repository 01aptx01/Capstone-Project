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
    <div className="max-w-[1400px] mx-auto py-10 px-6 space-y-12">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-[40px] p-10 bg-white border border-[#E2E8F0] shadow-[0_20px_60px_rgb(0,0,0,0.03)] animate-in opacity-0">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-[#f47b2a] rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-orange-400 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4 animate-in opacity-0 delay-100">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                <i className="fi fi-rr-vending-machine text-2xl text-[#f47b2a]"></i>
              </div>
              <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[12px]">Inventory Fleet</span>
            </div>
            <h1 className="text-[42px] font-black text-[#334155] mb-2 tracking-tight leading-tight animate-in opacity-0 delay-200">
              จัดการตู้สินค้า <span className="text-[#f47b2a]">.</span>
            </h1>
            <p className="text-slate-400 text-[18px] font-medium max-w-xl animate-in opacity-0 delay-300">
              ติดตามสถานะ สต็อกสินค้า และประสิทธิภาพของตู้จำหน่ายสินค้าอัตโนมัติแบบ Real-time
            </p>
          </div>
          
          <div className="flex items-center gap-4 animate-in opacity-0 delay-500">
            <button 
              onClick={() => openExportModal(machineSections, "จัดการตู้สินค้า")}
              className="px-6 py-4 bg-slate-50 border border-slate-200 text-[#334155] rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center gap-3 active:scale-95"
            >
              <i className="fi fi-rr-download text-lg"></i>
              <span>Export รายงาน</span>
            </button>
            <button 
              onClick={openAddMachine}
              className="px-8 py-4 bg-[#f47b2a] text-white rounded-2xl font-black shadow-[0_20px_40px_rgba(244,123,42,0.2)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3 active:translate-y-0 active:scale-95"
            >
              <i className="fi fi-rr-plus text-lg"></i>
              <span>เพิ่มตู้สินค้า</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary - Quick Glance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in opacity-0 delay-600">
        {[
          { label: "ตู้ทั้งหมด", value: machinesData.length, icon: "fi-rr-vending-machine", color: "bg-blue-500", shadow: "shadow-blue-200" },
          { label: "กำลังทำงาน", value: machinesData.filter(m => m.status === 'online').length || 4, icon: "fi-rr-check-circle", color: "bg-emerald-500", shadow: "shadow-emerald-200" },
          { label: "สต็อกต่ำ", value: 2, icon: "fi-rr-box-open", color: "bg-amber-500", shadow: "shadow-amber-200" },
          { label: "แจ้งเตือน", value: 0, icon: "fi-rr-bell", color: "bg-rose-500", shadow: "shadow-rose-200" },
        ].map((stat, i) => (
          <div key={i} className="vibrant-card p-6 flex items-center gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center text-xl text-white shadow-lg ${stat.shadow}`}>
              <i className={`fi ${stat.icon}`}></i>
            </div>
            <div>
              <div className="text-slate-400 font-bold text-[12px] uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-black text-[#334155]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Machines Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#334155] tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-[#f47b2a] rounded-full"></span>
            รายชื่อตู้ทั้งหมด
          </h2>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button className="px-5 py-2 bg-white rounded-xl shadow-sm text-sm font-black text-[#f47b2a]">Grid</button>
            <button className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">List</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-16">
          {machinesData.map((machine: any, index: number) => (
            <div 
              key={machine.id} 
              className="animate-scale-in opacity-0"
              style={{ animationDelay: `${200 + (index * 100)}ms` }}
            >
              <MachineCard {...machine} />
            </div>
          ))}

          {/* Add New Machine Placeholder/Card */}
          <div 
            onClick={openAddMachine}
            className="group relative border-4 border-dashed border-slate-100 rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[380px] hover:border-[#f47b2a]/30 hover:bg-orange-50/30 transition-all duration-700 cursor-pointer animate-scale-in opacity-0"
            style={{ animationDelay: `${200 + (machinesData.length * 100)}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]"></div>
            
            <div className="relative z-10 w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl shadow-slate-200/50 border border-slate-50 group-hover:border-orange-200">
              <i className="fi fi-rr-plus text-[40px] text-slate-200 group-hover:text-[#f47b2a] transition-colors duration-500"></i>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="text-[22px] font-black text-slate-300 group-hover:text-[#f47b2a] tracking-tight transition-colors duration-500">เพิ่มตู้สินค้าใหม่</div>
              <p className="text-slate-300 font-bold text-sm mt-3 max-w-[200px] mx-auto leading-relaxed group-hover:text-orange-400 transition-colors duration-500">คลิกเพื่อเชื่อมต่อและจัดการตู้ใหม่เข้ากับระบบส่วนกลาง</p>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-slate-100 rounded-tl-xl group-hover:border-[#f47b2a]/20 transition-colors"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-slate-100 rounded-br-xl group-hover:border-[#f47b2a]/20 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

