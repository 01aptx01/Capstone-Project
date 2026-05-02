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
      className="group relative bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[40px] p-5 transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 overflow-hidden"
    >
      {/* Decorative Gradient Glow on Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      {/* Image Area */}
      <div className="relative z-10 bg-slate-50 rounded-[32px] aspect-[4/3] flex items-center justify-center mb-6 group-hover:bg-white transition-all duration-700 overflow-hidden border border-slate-100/50 shadow-inner">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:shadow-orange-200/50 group-hover:rotate-12 transition-all duration-700 border border-slate-50">
              <i className="fi fi-rr-vending-machine text-[40px] text-slate-200 group-hover:text-[#f47b2a] transition-colors duration-500"></i>
            </div>
          </div>
        )}
        
        {/* Status Badge - Floating Premium Version */}
        <div className="absolute top-5 left-5">
          <div className={`flex items-center gap-2 px-4 py-2 ${isOnline ? 'bg-emerald-500/90' : 'bg-rose-500/90'} backdrop-blur-xl text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-lg border border-white/20`}>
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
          className="absolute top-5 right-5 w-12 h-12 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500 border border-white"
        >
          <i className="fi fi-rr-edit text-xl"></i>
        </button>
      </div>

      <div className="relative z-10 px-3">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-[22px] font-black text-[#334155] leading-tight group-hover:text-[#f47b2a] transition-colors duration-500">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-[14px] font-bold text-slate-400">
              <i className="fi fi-rr-marker text-[#f47b2a]/40"></i>
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-[#f47b2a] group-hover:shadow-[0_10px_20px_rgba(244,123,42,0.3)] transition-all duration-500">
            <i className="fi fi-rr-arrow-right text-lg"></i>
          </div>
        </div>
        
        {/* Footer info with tonal layering */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Device Identifier</span>
            <span className="text-[12px] font-black text-[#334155] opacity-60">#{id}</span>
          </div>
          
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="w-9 h-9 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-sm"
                title={`Module ${i} Active`}
              >
                <i className={`fi ${i === 3 ? 'fi-rr-warning text-amber-500' : 'fi-rr-box-open text-slate-400'} text-[12px]`}></i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

