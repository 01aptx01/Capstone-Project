"use client";

import Link from "next/link";
import { useUI } from "@/lib/context/UIContext";

interface MachineCardProps {
  id: string;
  name: string;
  location: string;
  status?: string;
  is_online?: boolean;
  last_active?: string | null;
  image?: string;
}

function statusLabel(status: string | undefined): string {
  const s = (status || "online").toLowerCase();
  if (s === "maintenance") return "ซ่อมบำรุง";
  if (s === "offline") return "ออฟไลน์";
  return "พร้อมขาย";
}

export default function MachineCard({
  id,
  name,
  location,
  status,
  is_online: isSocketOnline,
  last_active: _lastActive,
  image,
}: MachineCardProps) {
  const { openEditMachine } = useUI();
  const st = (status || "online").toLowerCase();
  const operationalOnline = st === "online";
  const socketConnected = Boolean(isSocketOnline);

  const opBadgeClass = operationalOnline
    ? "bg-emerald-600"
    : st === "maintenance"
      ? "bg-amber-500"
      : "bg-slate-500";

  return (
    <Link
      href={`/machines/${encodeURIComponent(id)}`}
      className="group block bg-white border border-[#E2E8F0] rounded-[24px] p-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1"
    >
      <div className="relative bg-[#F4F6F8] rounded-[16px] aspect-[1.7/1] flex items-center justify-center mb-5 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <i className="fi fi-rr-server text-[40px] text-[#CBD5E1]"></i>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-1.5 max-w-[70%]">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 ${opBadgeClass} text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm`}
            title="สถานะปฏิบัติการในฐานข้อมูล (machines.status)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-white ${operationalOnline ? "animate-pulse" : ""}`}
            ></span>
            {statusLabel(status)}
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 ${socketConnected ? "bg-sky-600" : "bg-slate-400"} text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm`}
            title="การเชื่อมต่อ Socket.IO ล่าสุด (machines.is_online)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-white ${socketConnected ? "animate-pulse" : ""}`}
            ></span>
            {socketConnected ? "เชื่อมต่อ" : "ไม่เชื่อมต่อ"}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openEditMachine({
              id,
              name,
              location,
              status: st,
              is_online: isSocketOnline,
              last_active: _lastActive ?? null,
              image,
            });
          }}
          className="absolute top-4 right-4 w-9 h-9 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-[#f47b2a] hover:scale-105 transition-all opacity-0 group-hover:opacity-100 duration-300"
        >
          <i className="fi fi-rr-edit text-sm"></i>
        </button>
      </div>

      <div className="px-1">
        <h3 className="text-[18px] font-bold text-[#1E293B] mb-1.5">{name}</h3>
        <p className="text-[13.5px] font-medium text-[#64748B] mb-5 line-clamp-1">
          {location.trim() === "" ? "—" : location}
        </p>

        <div className="inline-block px-4 py-1.5 bg-[#f47b2a] text-white text-[12px] font-bold rounded-full">
          {id}
        </div>
      </div>
    </Link>
  );
}
