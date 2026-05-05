"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Cpu,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname() || "/";

  const nav: { name: string; href: string; Icon: LucideIcon }[] = [
    { name: "แดชบอร์ด", href: "/", Icon: LayoutDashboard },
    { name: "คลังสินค้า", href: "/products", Icon: Package },
    { name: "จัดการตู้", href: "/machines", Icon: Cpu },
    { name: "คำสั่งซื้อ", href: "/orders", Icon: ShoppingCart },
    { name: "ลูกค้า & คูปอง", href: "/customers", Icon: Users },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-brand group">
          <div className="logo-container group-hover:rotate-[360deg] transition-transform duration-1000">
            <Image
              src="/Logo_modpao.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <div className="sidebar-brand-title">MOD PAO</div>
            <div className="sidebar-brand-sub">VENDING MGMT</div>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav relative">
        {nav.map((item, index) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.Icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${active ? "active group" : "hover-trigger group"} animate-slide-left opacity-0`}
              style={{
                animationDelay: `${index * 80}ms`,
                zIndex: active ? 2 : 1,
              }}
            >
              <span className="icon-container relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 shrink-0 transition-all duration-100 ${
                    active
                      ? "scale-110 text-[var(--primary)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                  }`}
                  aria-hidden
                />
              </span>
              <span
                className={`label transition-all duration-100 ${
                  active ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        <style jsx>{`
          .sidebar-nav {
            padding: 30px 18px;
            position: relative;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-5px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-bottom px-6 pb-10">
        <div className="bottom-links flex flex-col gap-2">
          <Link
            href="/settings"
            className={`bottom-link group flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${pathname === "/settings" ? "active" : ""}`}
          >
            <div
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 border"
              style={{
                background: pathname === "/settings" ? "var(--warn-bg)" : "var(--surface-2)",
                color: pathname === "/settings" ? "var(--primary)" : "var(--text-muted)",
                borderColor: "var(--border)",
              }}
            >
              <i className="fi fi-rr-settings text-lg"></i>
            </div>
            <span className="font-bold text-[15px]" style={{ color: "var(--text)" }}>
              ตั้งค่า
            </span>
          </Link>
          <Link
            href="/logout"
            className="bottom-link group logout flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          >
            <div
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 border"
              style={{
                background: "var(--danger-bg)",
                color: "var(--danger)",
                borderColor: "var(--border)",
              }}
            >
              <i className="fi fi-rr-exit text-lg"></i>
            </div>
            <span className="font-bold text-[15px]" style={{ color: "var(--danger)" }}>
              ออกจากระบบ
            </span>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .logo-container {
          width: 48px;
          height: 48px;
          background: var(--surface-1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }

        .sidebar-brand-title {
          font-weight: 950;
          font-size: 1.3rem;
          letter-spacing: -0.8px;
          color: var(--text);
          line-height: 1;
        }

        .sidebar-brand-sub {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .sidebar-link:hover:not(.active) {
          background: var(--surface-2) !important;
          transform: translateX(4px);
        }

        .sidebar-link.active {
          background: var(--warn-bg) !important;
          transform: translateX(4px) !important;
        }

        .bottom-link {
          color: var(--text-muted);
          text-decoration: none;
        }

        .bottom-link:hover:not(.logout) {
          background: var(--surface-2);
          color: var(--text);
          transform: translateX(4px);
        }

        .bottom-link.active {
          background: rgba(244, 123, 42, 0.08);
          color: var(--primary);
        }

        .bottom-link.logout:hover {
          background: var(--danger-bg);
          transform: translateX(4px);
        }
      `}} />
    </aside>
  );
}

