"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
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
        <div className="sidebar-brand">
          <Image src="/Logo_modpao.png" alt="Logo" width={44} height={44} />
          <div>
            <div className="sidebar-brand-title">MOD PAO</div>
            <div className="sidebar-brand-sub">VENDING MANAGEMENT</div>
          </div>
        </div>

        <div className="sidebar-top-avatar">
          <Image src="/Pao.png" alt="avatar" width={28} height={28} />
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

      <div className="sidebar-bottom">
        <Link href="/machines/new" className="sidebar-add">+ เพิ่มตู้ใหม่</Link>
        <Link className="sidebar-bottom-link" href="/settings">⚙️ ตั้งค่า</Link>
        <Link className="sidebar-bottom-link" href="/logout">↩️ ออกจากระบบ</Link>
      </div>
    </aside>
  );
}

