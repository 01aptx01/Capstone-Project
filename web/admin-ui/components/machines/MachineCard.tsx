"use client";

import Link from "next/link";
import { useUI } from "@/lib/context/UIContext";

interface MachineCardProps {
  id: string;
  name: string;
  location: string;
  status?: string;
  image?: string;
}

export default function MachineCard({ id, name, location, status, image }: MachineCardProps) {
  const { openEditMachine } = useUI();
  return (
    <Link 
      href={`/machines/${id}`} 
      className="group vibrant-card p-4 transition-all duration-300"
    >
      {/* Placeholder Image Area */}
      <div className="bg-[#F1F5F9] rounded-[20px] aspect-[4/3] flex items-center justify-center mb-6 group-hover:bg-[#FFF7ED] transition-colors overflow-hidden relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#FF6A00] transition-colors">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
            <rect x="9" y="6" width="6" height="4" rx="1"></rect>
            <rect x="9" y="12" width="6" height="2" rx="1"></rect>
          </svg>
        )}
        
        {/* Abstract pattern decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
          <div className="w-16 h-16 border-2 border-[#FF6A00] rounded-full -mr-8 -mt-8"></div>
        </div>

        {/* Edit Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openEditMachine({ id, name, location, status, image });
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FF6A00] hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
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
