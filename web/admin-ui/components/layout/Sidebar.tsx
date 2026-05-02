"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/lib/context/UIContext";

function Icon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" fill="currentColor" />
        </svg>
      );
    case "machine":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <circle cx="8" cy="10" r="1" fill="currentColor" />
        </svg>
      );
    case "products":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 2L20 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l8-5z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "reports":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M7 13h3v5H7v-5zM11 9h3v9h-3V9zM15 5h3v13h-3V5z" fill="currentColor" />
        </svg>
      );
    case "customers":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "sales":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "orders":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.2" />
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.2" />
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.2" />
          <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "alerts":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.2" />
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const { openAddMachine } = useUI();
  
  const nav = [
    { name: "แดชบอร์ด", href: "/", icon: "home" },
    { name: "จัดการตู้", href: "/machines", icon: "machine" },
    { name: "คลังสินค้า", href: "/products", icon: "products" },
    { name: "รายงาน", href: "/reports", icon: "reports" },
    { name: "ลูกค้า & คูปอง", href: "/customers", icon: "customers" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-brand group">
          <Image src="/Logo_modpao.png" alt="Logo" width={44} height={44} className="group-hover:scale-110 transition-transform" />
          <div>
            <div className="sidebar-brand-title uppercase tracking-tighter">MOD PAO</div>
            <div className="sidebar-brand-sub opacity-80">VENDING MGMT</div>
          </div>
        </Link>

        <div className="sidebar-top-avatar">
          <Image src="/Pao.png" alt="avatar" width={28} height={28} className="rounded-full" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className={`sidebar-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
              <span className="icon-container"><Icon name={item.icon} /></span>
              <span className="label">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-bottom px-4 pb-6 space-y-3">
        <button 
          onClick={openAddMachine}
          className="w-full bg-[#FF6A00] text-white py-3.5 rounded-2xl font-black text-[15px] shadow-[0_12px_24px_rgba(255,106,0,0.2)] hover:bg-[#E55F00] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-lg group-hover:rotate-90 transition-transform duration-300">+</span>
          เพิ่มตู้ใหม่
        </button>
        <div className="flex flex-col gap-1">
          <Link className="sidebar-link opacity-60 hover:opacity-100 py-2" href="/settings">
            <span className="text-[16px]">⚙️</span>
            <span className="label text-[13px] font-bold">ตั้งค่าระบบ</span>
          </Link>
          <Link className="sidebar-link opacity-60 hover:opacity-100 py-2 text-rose-500" href="/logout">
            <span className="text-[16px]">↩️</span>
            <span className="label text-[13px] font-bold">ออกจากระบบ</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

