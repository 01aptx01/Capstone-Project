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
  const isOnline = status === "online" || !status; // Default to online for mock

  return (
    <Link 
      href={`/machines/${id}`} 
      className="group block bg-white border border-[#E2E8F0] rounded-[24px] p-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1"
    >
      {/* Image Area */}
      <div className="relative bg-[#F4F6F8] rounded-[16px] aspect-[1.7/1] flex items-center justify-center mb-5 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <i className="fi fi-rr-server text-[40px] text-[#CBD5E1]"></i>
        )}
        
        {/* Status Badge - Floating Premium Version */}
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isOnline ? 'animate-pulse' : ''}`}></span>
            {isOnline ? 'Active' : 'Offline'}
          </div>
        </div>

        {/* Edit Button - Sleek Glass Interaction */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openEditMachine({ id, name, location, status, image });
          }}
          className="absolute top-4 right-4 w-9 h-9 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:scale-105 transition-all opacity-0 group-hover:opacity-100 duration-300"
        >
          <i className="fi fi-rr-edit text-sm"></i>
        </button>
      </div>

      <div className="px-1">
        <h3 className="text-[18px] font-bold text-[#1E293B] mb-1.5">
          {name}
        </h3>
        <p className="text-[13.5px] font-medium text-[#64748B] mb-5 line-clamp-1">
          {location}
        </p>
        
        {/* Footer info / ID Pill */}
        <div className="inline-block px-4 py-1.5 bg-[#f47b2a] text-white text-[12px] font-bold rounded-full">
          {id}
        </div>
      </div>
    </Link>
  );
}

