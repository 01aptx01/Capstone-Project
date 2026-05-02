"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import machinesData from "@/lib/mock/machines.json";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MachineDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const machine = machinesData.find(m => m.id === id) || { name: "MOD PAO Building LX", id: id };

  const metrics = [
    { title: "ยอดขาย", value: "฿1,458.5", color: "#1e293b" },
    { title: "คำสั่งซื้อ", value: "342", color: "#1e293b" },
    { title: "อุณหภูมิตู้", value: "65°C", color: "#1e293b" },
    { title: "สถานะระบบ", value: "ทำงานปกติ", color: "#10B981" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#FF6A00] hover:border-[#FF6A00] hover:shadow-md transition-all group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-black text-[#1e293b]">{machine.name}</h1>
              <span className="px-3 py-1 bg-[#ECFDF5] text-[#059669] text-[12px] font-bold rounded-full border border-[#D1FAE5] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                ทำงานปกติ
              </span>
            </div>
            <div className="text-[14px] font-bold text-[#94A3B8]">{id}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#334155] text-white rounded-xl text-[14px] font-bold shadow-[0_8px_20px_rgba(30,41,59,0.2)] hover:bg-[#1e293b] hover:-translate-y-0.5 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            จัดการสต็อค
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-bold text-[#64748B] shadow-sm hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="text-[13px] font-bold text-[#64748B] mb-2">{m.title}</div>
            <div className="text-[28px] font-black leading-tight" style={{ color: m.color }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Graph Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h3 className="text-[18px] font-black text-[#1e293b] mb-8">กราฟยอดขาย</h3>
        <div className="bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-[20px] h-[300px] flex items-center justify-center">
          <div className="text-[#94A3B8] font-bold">[พื้นที่แสดงกราฟ]</div>
        </div>
      </div>
    </div>
  );
}
