"use client";

import MachineCard from "@/components/machines/MachineCard";
import machinesData from "@/lib/mock/machines.json";
import { useUI } from "@/lib/context/UIContext";

export default function MachinesPage() {
  const { openAddMachine } = useUI();

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
        <button 
          onClick={openAddMachine}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6A00] to-[#FF8C38] text-white rounded-2xl text-[15px] font-black shadow-[0_12px_24px_rgba(255,106,0,0.2)] hover:shadow-[0_15px_40px_rgba(255,106,0,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all group"
        >
          <span className="text-[20px] group-hover:rotate-90 transition-transform duration-300">+</span> 
          เพิ่มตู้สินค้า
        </button>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {machinesData.map((machine: any) => (
          <MachineCard 
            key={machine.id}
            id={machine.id}
            name={machine.name}
            location={machine.location}
          />
        ))}

        {/* Add New Machine Placeholder/Card */}
        <div 
          onClick={openAddMachine}
          className="group border-2 border-dashed border-[#E2E8F0] rounded-[24px] p-4 flex flex-col items-center justify-center min-h-[340px] hover:border-[#FF6A00] hover:bg-[#FFF7ED]/50 transition-all cursor-pointer"
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
