"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  listProducts,
  listMachines,
  listCustomers,
  listOrders,
  type ApiProduct,
  type ApiMachineSummary,
  type ApiCustomer,
  type ApiOrderListItem,
} from "@/lib/admin-api";

const STATIC_NAV: { href: string; label: string; keywords: string[] }[] = [
  { href: "/", label: "แดชบอร์ด", keywords: ["dashboard", "แดช", "หน้าแรก", "home"] },
  { href: "/products", label: "คลังสินค้า", keywords: ["สินค้า", "product", "inventory", "คลัง"] },
  { href: "/machines", label: "จัดการตู้", keywords: ["ตู้", "machine", "vending"] },
  { href: "/orders", label: "คำสั่งซื้อ", keywords: ["ออเดอร์", "order", "ซื้อ"] },
  { href: "/customers", label: "ลูกค้า & คูปอง", keywords: ["ลูกค้า", "customer", "คูปอง", "member"] },
  { href: "/settings", label: "ตั้งค่า", keywords: ["settings", "ตั้งค่า"] },
];

const SEARCH_PER_PAGE = 8;

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const profileBtnRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("⌘K");
  const [productHits, setProductHits] = useState<ApiProduct[]>([]);
  const [machineHits, setMachineHits] = useState<ApiMachineSummary[]>([]);
  const [customerHits, setCustomerHits] = useState<ApiCustomer[]>([]);
  const [orderHits, setOrderHits] = useState<ApiOrderListItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setShortcutLabel(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘K" : "Ctrl+K");
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchLoading(false);
      setProductHits([]);
      setMachineHits([]);
      setCustomerHits([]);
      setOrderHits([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void (async () => {
      const q = debouncedQuery;
      const [pr, mr, cr, or] = await Promise.allSettled([
        listProducts({ page: 1, per_page: SEARCH_PER_PAGE, q }),
        listMachines({ page: 1, per_page: SEARCH_PER_PAGE, q }),
        listCustomers({ page: 1, per_page: SEARCH_PER_PAGE, q }),
        listOrders({ page: 1, per_page: SEARCH_PER_PAGE, q }),
      ]);
      if (cancelled) return;
      setProductHits(pr.status === "fulfilled" ? pr.value.items : []);
      setMachineHits(mr.status === "fulfilled" ? mr.value.items : []);
      setCustomerHits(cr.status === "fulfilled" ? cr.value.items : []);
      setOrderHits(or.status === "fulfilled" ? or.value.items : []);
      setSearchLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen(true);
        queueMicrotask(() => searchInputRef.current?.focus());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigateSearch = useCallback(
    (href: string) => {
      setPaletteOpen(false);
      setQuery("");
      setDebouncedQuery("");
      router.push(href);
    },
    [router]
  );

  const navMatches = (() => {
    const t = debouncedQuery.toLowerCase();
    if (!t) return STATIC_NAV.slice(0, 6);
    return STATIC_NAV.filter((n) =>
      [n.label, ...n.keywords].some((s) => s.toLowerCase().includes(t))
    ).slice(0, 8);
  })();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (paletteOpen && !searchWrapRef.current?.contains(target)) {
        setPaletteOpen(false);
      }
      if (open && !btnRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
      if (profileOpen && !profileBtnRef.current?.contains(target) && !profileDropdownRef.current?.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, profileOpen, paletteOpen]);

  async function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && notifications.length === 0) {
      setLoading(true);
      try {
        const r = await fetch("/api/notifications");
        const j = await r.json();
        setNotifications(Array.isArray(j) ? j : []);
      } catch (e) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  }

  function markAllRead(e?: React.MouseEvent) {
    try { e?.stopPropagation(); } catch (err) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function fmtTime(t: string) {
    try {
      const date = new Date(t);
      return new Intl.DateTimeFormat('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      }).format(date);
    } catch (e) {
      return t;
    }
  }

  return (
    <header className="app-header">
      <div className="center">
        <div className="header-search-wrap" ref={searchWrapRef}>
          <div className="header-search">
            <span className="icon">
              <i className="fi fi-rr-search"></i>
            </span>
            <input
              ref={searchInputRef}
              aria-label="Search"
              aria-expanded={paletteOpen}
              aria-controls="admin-global-search-panel"
              role="combobox"
              placeholder="ค้นหาตู้ สินค้า ลูกค้า ออเดอร์ หรือเมนู…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setPaletteOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setPaletteOpen(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            <div className="search-shortcut">{shortcutLabel}</div>
          </div>

          {paletteOpen && (
            <div
              id="admin-global-search-panel"
              className="command-panel shadow-premium"
              role="listbox"
            >
              {!debouncedQuery && (
                <div className="command-hint">
                  พิมพ์เพื่อค้นหาข้ามสินค้า ตู้ ลูกค้า และออเดอร์ หรือเลือกทางลัดด้านล่าง
                </div>
              )}
              {searchLoading && debouncedQuery && (
                <div className="command-hint">กำลังค้นหา…</div>
              )}
              {!searchLoading &&
                debouncedQuery &&
                !productHits.length &&
                !machineHits.length &&
                !customerHits.length &&
                !orderHits.length &&
                navMatches.length === 0 && (
                <div className="command-hint">ไม่พบผลลัพธ์ในฐานข้อมูลสำหรับ &ldquo;{debouncedQuery}&rdquo;</div>
              )}

              {navMatches.length > 0 && (
                <div className="command-section">
                  <div className="command-section-title">เมนู</div>
                  {navMatches.map((n) => (
                    <button
                      key={n.href}
                      type="button"
                      className="command-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => navigateSearch(n.href)}
                    >
                      <span className="command-row-label">{n.label}</span>
                      <span className="command-row-meta">{n.href}</span>
                    </button>
                  ))}
                </div>
              )}

              {productHits.length > 0 && (
                <div className="command-section">
                  <div className="command-section-title">สินค้า</div>
                  {productHits.map((p) => (
                    <button
                      key={p.product_id}
                      type="button"
                      className="command-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        navigateSearch(`/products?q=${encodeURIComponent(p.name)}`)
                      }
                    >
                      <span className="command-row-label">{p.name}</span>
                      <span className="command-row-meta">฿{p.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {machineHits.length > 0 && (
                <div className="command-section">
                  <div className="command-section-title">ตู้</div>
                  {machineHits.map((m) => (
                    <button
                      key={m.machine_code}
                      type="button"
                      className="command-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        navigateSearch(`/machines/${encodeURIComponent(m.machine_code)}`)
                      }
                    >
                      <span className="command-row-label">{m.machine_code}</span>
                      <span className="command-row-meta">{m.location || "—"}</span>
                    </button>
                  ))}
                </div>
              )}

              {customerHits.length > 0 && (
                <div className="command-section">
                  <div className="command-section-title">ลูกค้า</div>
                  {customerHits.map((c) => (
                    <button
                      key={c.user_id}
                      type="button"
                      className="command-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        navigateSearch(`/customers?q=${encodeURIComponent(c.phone_number)}`)
                      }
                    >
                      <span className="command-row-label">{c.phone_number}</span>
                      <span className="command-row-meta">{c.points} pts</span>
                    </button>
                  ))}
                </div>
              )}

              {orderHits.length > 0 && (
                <div className="command-section">
                  <div className="command-section-title">ออเดอร์</div>
                  {orderHits.map((o) => (
                    <button
                      key={o.order_id}
                      type="button"
                      className="command-row"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        navigateSearch(`/orders?q=${encodeURIComponent(String(o.order_id))}`)
                      }
                    >
                      <span className="command-row-label">
                        #{o.order_id} · {o.machine_code}
                      </span>
                      <span className="command-row-meta">{o.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-actions">
        <div style={{ position: "relative" }}>
          <button ref={btnRef} onClick={toggle} className={`bell ${open ? "active" : ""}`} aria-label="Notifications">
            <i className="fi fi-rr-bell"></i>
            {unreadCount > 0 && <span className="badge animate-pulse" />}
          </button>

          {open && (
            <div className="notification-dropdown animate-in shadow-premium" ref={dropdownRef}>
              <div className="header">
                <div className="title">การแจ้งเตือน</div>
                <button onClick={(e) => markAllRead(e)} className="mark-read">
                  อ่านทั้งหมด
                </button>
              </div>
              <div className="list">
                {loading && (
                  <div className="notification-empty">
                    <div className="shimmer-line mb-2 w-full h-12 rounded-lg"></div>
                    <div className="shimmer-line w-3/4 h-12 rounded-lg"></div>
                  </div>
                )}
                {!loading && notifications.length === 0 && (
                  <div className="notification-empty">
                    <i className="fi fi-rr-inbox text-3xl opacity-20 mb-3 block"></i>
                    <p>ไม่มีการแจ้งเตือนใหม่</p>
                  </div>
                )}
                {!loading && notifications.map((n) => (
                  <div key={n.id} className={`item ${!n.read ? 'unread' : ''}`}>
                    <div className="status-dot" />
                    <div className="content">
                      <div className="item-title">{n.title}</div>
                      <div className="item-body">{n.body}</div>
                      <div className="item-time">{fmtTime(n.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="footer">
                <Link href="/notifications">ดูทั้งหมด</Link>
              </div>
            </div>
          )}
        </div>

        <div className="header-divider" />

        <div style={{ position: "relative" }}>
          <div 
            ref={profileBtnRef}
            className={`profile ${profileOpen ? "active" : ""}`} 
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              <Image src="/Pao.png" alt="Admin" width={32} height={32} />
            </div>
            <div className="name-wrapper">
              <div className="name">Mod Pao</div>
              <div className="role">Administrator</div>
            </div>
            <i className={`fi fi-rr-angle-small-down transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`}></i>
          </div>

          {profileOpen && (
            <div className="profile-dropdown animate-in shadow-premium" ref={profileDropdownRef}>
              <div className="profile-header">
                <div className="avatar-large">
                  <Image src="/Pao.png" alt="Admin" width={48} height={48} />
                </div>
                <div className="info">
                  <div className="full-name">Mod Pao Admin</div>
                  <div className="email">admin@modpao.vending</div>
                </div>
              </div>
              
              <div className="menu-group">
                <Link href="/profile" className="menu-item">
                  <i className="fi fi-rr-user"></i>
                  <span>โปรไฟล์</span>
                </Link>
                <Link href="/settings" className="menu-item">
                  <i className="fi fi-rr-settings"></i>
                  <span>ตั้งค่า</span>
                </Link>
              </div>
              
              <div className="menu-group border-t">
                <Link href="/logout" className="menu-item logout">
                  <i className="fi fi-rr-exit"></i>
                  <span>ออกจากระบบ</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-header {
          background: white !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
        }

        .header-search-wrap {
          position: relative;
          z-index: 50;
        }

        .header-search {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid transparent !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .header-search:focus-within {
          background: white !important;
          border-color: var(--primary) !important;
          box-shadow: 0 10px 25px rgba(244, 123, 42, 0.08) !important;
          width: 600px;
        }

        .command-panel {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 10px);
          max-height: min(420px, 70vh);
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 10px 0;
          z-index: 300;
        }

        .command-hint {
          padding: 14px 18px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted);
          line-height: 1.45;
        }

        .command-section {
          padding: 6px 0;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .command-section:first-of-type {
          border-top: none;
        }

        .command-section-title {
          padding: 8px 18px 4px;
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.35);
        }

        .command-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 18px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .command-row:hover {
          background: rgba(244, 123, 42, 0.06);
        }

        .command-row-label {
          font-weight: 800;
          font-size: 0.9rem;
          color: #334155;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .command-row-meta {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--muted);
          flex-shrink: 0;
          max-width: 45%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-shortcut {
          background: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--muted);
          border: 1px solid rgba(0,0,0,0.1);
        }

        .bell {
          background: transparent !important;
          border: none !important;
          font-size: 1.3rem;
          color: var(--muted);
          transition: 0.3s;
        }

        .bell:hover {
          color: var(--primary);
          transform: scale(1.1);
        }

        .bell.active {
          color: var(--primary);
        }

        .badge {
          background: var(--primary) !important;
          border: 2px solid white !important;
          box-shadow: 0 0 10px rgba(244, 123, 42, 0.4) !important;
        }

        .glass {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
        }

        .notification-dropdown {
          top: calc(100% + 12px) !important;
          border-radius: 20px !important;
          width: 380px !important;
          background: white !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          backdrop-filter: none !important;
        }

        .notification-dropdown .header {
          padding: 20px !important;
        }

        .notification-dropdown .header .title {
          font-weight: 900;
          font-size: 1.1rem;
        }

        .mark-read {
          color: var(--primary);
          font-weight: 700;
          font-size: 0.85rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .notification-dropdown .item {
          padding: 16px 20px !important;
          transition: 0.3s;
        }

        .notification-dropdown .item:hover {
          background: rgba(244, 123, 42, 0.03);
        }

        .notification-dropdown .item.unread {
          background: rgba(244, 123, 42, 0.02);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          margin-top: 6px;
          opacity: 0;
        }

        .unread .status-dot {
          opacity: 1;
        }

        .item-title {
          font-weight: 800;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .item-body {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.4;
        }

        .item-time {
          font-size: 0.75rem;
          color: rgba(0,0,0,0.3);
          margin-top: 8px;
        }

        .notification-dropdown .footer {
          padding: 14px;
          text-align: center;
          border-top: 1px solid rgba(0,0,0,0.03);
        }

        .notification-dropdown .footer a {
          font-weight: 700;
          color: var(--muted);
          font-size: 0.85rem;
          text-decoration: none;
        }

        .profile {
          background: transparent !important;
          border: none !important;
          padding: 4px 8px !important;
        }

        .name-wrapper {
          text-align: left;
        }

        .profile .name {
          font-size: 0.95rem !important;
          font-weight: 900 !important;
        }

        .profile .role {
          font-size: 0.75rem;
          color: var(--muted);
          font-weight: 600;
          margin-top: -2px;
        }

        .profile-dropdown {
          top: calc(100% + 12px) !important;
          border-radius: 20px !important;
          padding: 12px !important;
          background: white !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          backdrop-filter: none !important;
        }

        .profile-header {
          padding: 12px 12px 20px !important;
        }

        .full-name {
          font-weight: 900 !important;
        }

        .menu-item {
          padding: 12px 14px !important;
          border-radius: 12px !important;
        }

        .menu-item i {
          font-size: 1.1rem;
        }

        .border-t {
          border-top: 1px solid rgba(0,0,0,0.05);
          margin-top: 8px;
          padding-top: 8px !important;
        }
      `}</style>
    </header>
  );
}


