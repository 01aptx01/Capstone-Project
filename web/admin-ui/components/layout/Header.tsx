"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (btnRef.current && btnRef.current.contains(target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

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

  function markAllRead(e?: any) {
    // prevent the click from bubbling to document listener
    try {
      e?.stopPropagation();
    } catch (err) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function fmtTime(t: string) {
    try {
      return new Date(t).toLocaleString();
    } catch (e) {
      return t;
    }
  }

  return (
    <header className="app-header">
      <div className="center">
        <div className="header-search">
          <span className="icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <input aria-label="Search" placeholder="Search machines, inventory..." />
        </div>
      </div>

      <div className="header-actions">
        <div style={{ position: "relative" }}>
          <button ref={btnRef} onClick={toggle} className={`bell ${open ? "active" : ""}`} aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadCount > 0 && <span className="badge" />}
          </button>

          {open && (
            <div className="notification-dropdown animate-in" ref={dropdownRef}>
              <div className="header">
                <div style={{ fontWeight: 800 }}>Notifications</div>
                <div>
                  <button onClick={(e) => markAllRead(e)} className="text-sm" style={{ color: "var(--muted)" }}>
                    Mark all read
                  </button>
                </div>
              </div>
              <div className="list">
                {loading && <div className="notification-empty">Loading…</div>}
                {!loading && notifications.length === 0 && <div className="notification-empty">No notifications</div>}
                {!loading && notifications.map((n) => (
                  <div key={n.id} className="item">
                    <div style={{ width: 8, height: 8, borderRadius: 8, background: n.read ? "transparent" : "var(--primary)", marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div className="title">{n.title}</div>
                      <div className="body">{n.body}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{fmtTime(n.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="header-divider" />

        <div className="profile">
          <div className="avatar">
            <Image src="/Pao.png" alt="Admin" width={36} height={36} />
          </div>
          <div className="name">Admin</div>
        </div>
      </div>
    </header>
  );
}

