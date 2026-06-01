"use client";

import { cn } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";

export interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  titleAlign?: "left" | "center";
  className?: string;
  panelClassName?: string;
}

export function ModalSheet({
  open,
  onClose,
  children,
  title,
  titleAlign = "left",
  className,
  panelClassName,
}: ModalSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[var(--z-modal)] flex items-end md:items-center justify-center p-0 md:p-5",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        aria-label="ปิด"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg bg-surface rounded-t-3xl md:rounded-3xl shadow-lg max-h-[90vh] overflow-y-auto animate-slide-up md:animate-fade-in",
          panelClassName,
        )}
      >
        {title && (
          <h2
            id="modal-title"
            className={cn(
              "font-display text-xl font-bold text-foreground px-6 pt-6 pb-2",
              titleAlign === "center" && "text-center",
            )}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
