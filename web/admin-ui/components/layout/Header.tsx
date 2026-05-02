"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const profileBtnRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      
      // Handle Notifications dropdown
      if (open && !btnRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
      
      // Handle Profile dropdown
      if (profileOpen && !profileBtnRef.current?.contains(target) && !profileDropdownRef.current?.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, profileOpen]);

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

        <div style={{ position: "relative" }}>
          <div 
            ref={profileBtnRef}
            className={`profile ${profileOpen ? "active" : ""}`} 
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              <Image src="/Pao.png" alt="Admin" width={36} height={36} />
            </div>
            <div className="name">Admin</div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} style={{ color: "var(--muted)", marginLeft: 4 }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {profileOpen && (
            <div className="profile-dropdown animate-in" ref={profileDropdownRef}>
              <div className="profile-header">
                <div className="avatar-large">
                  <Image src="/Pao.png" alt="Admin" width={48} height={48} />
                </div>
                <div className="info">
                  <div className="name">Mod Pao Admin</div>
                  <div className="email">admin@modpao.vending</div>
                </div>
              </div>
              
              <div className="divider" />
              
              <div className="menu-group">
                <Link href="/profile" className="menu-item">
                  <i className="fi fi-rr-user"></i>
                  <span>โปรไฟล์</span>
                </Link>
                <Link href="/security" className="menu-item">
                  <i className="fi fi-rr-shield-check"></i>
                  <span>ความปลอดภัย</span>
                </Link>
                <Link href="/settings" className="menu-item">
                  <i className="fi fi-rr-settings"></i>
                  <span>ตั้งค่า</span>
                </Link>
              </div>
              <div className="menu-group">
                <Link href="/logout" className="menu-item logout">
                  <i className="fi fi-rr-exit"></i>
                  <span>ออกจากระบบ</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

