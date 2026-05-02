"use client";

import Link from "next/link";

interface MachineCardProps {
  id: string;
  name: string;
  location: string;
}

export default function MachineCard({ id, name, location }: MachineCardProps) {
  return (
    <Link 
      href={`/machines/${id}`} 
      className="group vibrant-card p-4 transition-all duration-300"
    >
      {/* Placeholder Image Area */}
      <div className="bg-[#F1F5F9] rounded-[20px] aspect-[4/3] flex items-center justify-center mb-6 group-hover:bg-[#FFF7ED] transition-colors overflow-hidden relative">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#FF6A00] transition-colors">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
          <rect x="9" y="6" width="6" height="4" rx="1"></rect>
          <rect x="9" y="12" width="6" height="2" rx="1"></rect>
        </svg>
        
        {/* Abstract pattern decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
          <div className="w-16 h-16 border-2 border-[#FF6A00] rounded-full -mr-8 -mt-8"></div>
        </div>
      </div>

      <div className="px-2">
        <h3 className="text-[17px] font-black text-[#0F172A] mb-1 group-hover:text-[#FF6A00] transition-colors">
          {name}
        </h3>
        <p className="text-[13px] font-medium text-[#64748B] mb-4 line-clamp-1">
          {location}
        </p>
        <span className="inline-flex items-center px-3 py-1 bg-[#10B981] text-white text-[11px] font-black rounded-lg shadow-[0_6px_16px_rgba(16,185,129,0.3)]">
          {id}
        </span>
      </div>
    </Link>
  );
}
