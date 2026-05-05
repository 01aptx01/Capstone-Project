"use client";

import Link from "next/link";
import { useUI } from "@/lib/context/UIContext";
import { useLang } from "@/lib/i18n/lang";
import type { DictKey } from "@/lib/i18n/dictionaries";

interface MachineCardProps {
  id: string;
  name: string;
  location: string;
  status?: string;
  is_online?: boolean;
  last_active?: string | null;
  image?: string;
}

function statusKey(status: string | undefined): DictKey {
  const s = (status || "online").toLowerCase();
  if (s === "maintenance") return "machine.card.statusMaintenance";
  if (s === "offline") return "machine.card.statusOffline";
  return "machine.card.statusOnline";
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
  const { t, href } = useLang();
  const st = (status || "online").toLowerCase();
  const operationalOnline = st === "online";
  const socketConnected = Boolean(isSocketOnline);

  const opBadgeClass = operationalOnline
    ? "bg-emerald-600"
    : st === "maintenance"
      ? "bg-amber-500"
      : "bg-[var(--surface-2)]0";

  return (
    <Link
      href={href(`/machines/${encodeURIComponent(id)}`)}
      className="group block bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-4 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1"
    >
      <div className="relative bg-[var(--surface-2)] rounded-[16px] aspect-[1.7/1] flex items-center justify-center mb-5 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <i className="fi fi-rr-server text-[40px] text-[var(--text-muted)]"></i>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-1.5 max-w-[70%]">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 ${opBadgeClass} text-[var(--primary-contrast)] text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm`}
            title={t("machine.card.opStatusTitle")}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[var(--surface-1)] ${operationalOnline ? "animate-pulse" : ""}`}
            ></span>
            {t(statusKey(status))}
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 ${socketConnected ? "bg-sky-600" : "bg-[var(--text-muted)]"} text-[var(--primary-contrast)] text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm`}
            title={t("machine.card.socketTitle")}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[var(--surface-1)] ${socketConnected ? "animate-pulse" : ""}`}
            ></span>
            {socketConnected ? t("machine.card.socketOn") : t("machine.card.socketOff")}
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
          className="absolute top-4 right-4 w-9 h-9 bg-[var(--surface-1)] shadow-sm rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:scale-105 transition-all opacity-0 group-hover:opacity-100 duration-300"
        >
          <i className="fi fi-rr-edit text-sm"></i>
        </button>
      </div>

      <div className="px-1">
        <h3 className="text-[18px] font-bold text-[var(--text)] mb-1.5">{name}</h3>
        <p className="text-[13.5px] font-medium text-[var(--text-muted)] mb-5 line-clamp-1">
          {location.trim() === "" ? "—" : location}
        </p>

        <div className="inline-block px-4 py-1.5 bg-[var(--primary)] text-[var(--primary-contrast)] text-[12px] font-bold rounded-full">
          {id}
        </div>
      </div>
    </Link>
  );
}
