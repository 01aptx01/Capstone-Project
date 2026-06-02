"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "var(--overlay)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      className="animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-300 surface-card my-auto"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="shrink-0 px-8 pt-8 pb-4 flex items-center justify-between border-b border-[var(--border)]/60">
          <h3 className="text-[22px] font-black text-[var(--text)] pr-4">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full border transition-colors"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              borderColor: "var(--border)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
