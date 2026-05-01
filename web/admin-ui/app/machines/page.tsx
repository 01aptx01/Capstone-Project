import MachineCard from "@/components/machines/MachineCard";
import machinesData from "@/lib/mock/machines.json";

export const metadata = { title: 'Manage Machines' };

export default function MachinesPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#0F172A] mb-1">
            เลือกจัดการตู้
          </h1>
          <p className="text-[#64748B] text-[15px]">รายการตู้ที่เชื่อมต่อหรือถูกเพิ่มให้คุณ</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-xl text-[14px] font-bold shadow-[0_8px_20px_rgba(255,106,0,0.25)] hover:bg-[#E55F00] hover:-translate-y-0.5 transition-all">
          <span className="text-[18px]">+</span> เพิ่มตู้
        </button>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {machinesData.map((machine) => (
          <MachineCard 
            key={machine.id}
            id={machine.id}
            name={machine.name}
            location={machine.location}
          />
        ))}

        {/* Add New Machine Placeholder/Card */}
        <div className="group border-2 border-dashed border-[#E2E8F0] rounded-[24px] p-4 flex flex-col items-center justify-center min-h-[340px] hover:border-[#FF6A00] hover:bg-[#FFF7ED]/50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-[32px] text-[#94A3B8] group-hover:text-[#FF6A00]">+</span>
          </div>
          <div className="text-[15px] font-bold text-[#64748B] group-hover:text-[#FF6A00]">เพิ่มตู้ใหม่</div>
        </div>
      </div>
    </div>
  );
}
