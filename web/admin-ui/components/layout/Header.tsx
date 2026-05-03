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
      if (open && !btnRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
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
      <div className="center"></div>

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


