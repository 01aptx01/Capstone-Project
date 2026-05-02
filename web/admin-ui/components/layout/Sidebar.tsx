"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/lib/context/UIContext";

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const { openAddMachine } = useUI();

  const nav = [
    { name: "แดชบอร์ด", href: "/", icon: "fi-rr-apps" },
    { name: "จัดการตู้", href: "/machines", icon: "fi-rr-computer" },
    { name: "คลังสินค้า", href: "/products", icon: "fi-rr-box-open" },
    { name: "รายงาน", href: "/reports", icon: "fi-rr-chart-histogram" },
    { name: "ลูกค้า & คูปอง", href: "/customers", icon: "fi-rr-users" },
  ];

  const activeIndex = nav.findIndex(item => 
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

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
        {/* Sliding Indicator (Premium Version) */}
        <div 
          className="active-glow-indicator shadow-[0_10px_30px_rgba(244,123,42,0.1)]" 
          style={{
            top: activeIndex >= 0 ? `${30 + (activeIndex * 60)}px` : '30px',
            opacity: activeIndex >= 0 ? 1 : 0
          }}
        />
        
        {nav.map((item, index) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${active ? "active group" : "hover-trigger group"} animate-slide-left opacity-0`}
              style={{ 
                animationDelay: `${index * 80}ms`,
                zIndex: active ? 2 : 1
              }}
            >
              <span className="icon-container relative">
                <i className={`fi ${active ? item.icon.replace('fi-rr-', 'fi-sr-') : item.icon} transition-all duration-500 ${active ? 'scale-110 text-[#f47b2a]' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                {active && <span className="absolute -inset-2 bg-orange-400/10 blur-md rounded-full -z-10 animate-pulse"></span>}
              </span>
              <span className={`label transition-all duration-300 ${active ? 'text-[#334155]' : 'text-slate-500 group-hover:text-slate-700'}`}>{item.name}</span>
              {active && (
                <div className="ml-auto flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="w-1 h-1 rounded-full bg-[#f47b2a]"></div>
                  <div className="w-1.5 h-4 bg-[#f47b2a] rounded-full"></div>
                </div>
              )}
            </Link>
          );
        })}

        <style jsx>{`
          .sidebar-nav {
            padding: 30px 18px;
            position: relative;
          }

          .active-glow-indicator {
            position: absolute;
            left: 18px;
            right: 18px;
            height: 52px;
            background: white;
            border: 1.5px solid rgba(244, 123, 42, 0.1);
            border-radius: 18px;
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-5px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-bottom px-6 pb-10">
        <button
          onClick={openAddMachine}
          className="add-btn mb-8 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000">
              <i className="fi fi-rr-plus-small text-2xl"></i>
            </div>
            <span className="tracking-tight">เพิ่มตู้ใหม่</span>
          </div>
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000"></div>
        </button>

        <div className="bottom-links space-y-2">
          <Link href="/settings" className={`bottom-link group ${pathname === '/settings' ? 'active' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/settings' ? 'bg-orange-50 text-[#f47b2a]' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
              <i className="fi fi-rr-settings text-lg"></i>
            </div>
            <span className="font-bold">ตั้งค่า</span>
          </Link>
          <Link href="/logout" className="bottom-link group logout">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
              <i className="fi fi-rr-exit text-lg"></i>
            </div>
            <span className="font-bold text-rose-500">ออกจากระบบ</span>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          background: #F8FAFC;
          box-shadow: 20px 0 60px rgba(15, 23, 42, 0.02);
          border-right: 1px solid rgba(15, 23, 42, 0.04);
        }

        .logo-container {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .sidebar-brand-title {
          font-weight: 950;
          font-size: 1.3rem;
          letter-spacing: -0.8px;
          color: #334155;
          line-height: 1;
        }

        .sidebar-brand-sub {
          font-size: 0.65rem;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .sidebar-link {
          height: 52px;
          margin-bottom: 8px;
          padding: 0 18px !important;
          border-radius: 18px !important;
          border: 1.5px solid transparent !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .sidebar-link:hover:not(.active) {
          background: #f8fafc !important;
          transform: translateX(4px);
        }

        .sidebar-link.active {
          transform: scale(1.02) translateX(4px) !important;
        }

        .sidebar-link .icon-container {
          font-size: 1.3rem;
          margin-right: 14px;
        }

        .sidebar-link .label {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .add-btn {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 20px;
          color: white;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 15px 35px rgba(244, 123, 42, 0.25);
        }
        
        .add-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(244, 123, 42, 0.35);
        }

        .bottom-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bottom-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px;
          border-radius: 16px;
          color: #64748B;
          font-size: 0.95rem;
          transition: all 0.3s;
          text-decoration: none;
        }

        .bottom-link:hover:not(.logout) {
          background: #f8fafc;
          color: #334155;
          transform: translateX(4px);
        }

        .bottom-link.active {
          background: rgba(244, 123, 42, 0.03);
          color: #f47b2a;
        }

        .bottom-link.logout:hover {
          background: #fff1f2;
          transform: translateX(4px);
        }
      `}} />
    </aside>
  );
}

