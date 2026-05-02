"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-in scale-in duration-300" 
        role="dialog" 
        aria-modal="true" 
        aria-label={title}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h3 className="text-[22px] font-black text-[#0F172A]">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
