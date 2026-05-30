"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  back = true,
  onBack,
  action,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "flex items-start gap-3 mb-6",
        className,
      )}
    >
      {back && (
        <button
          type="button"
          onClick={onBack ?? (() => router.back())}
          aria-label="กลับ"
          className="touch-target shrink-0 p-2.5 bg-surface rounded-full shadow-sm hover:bg-brand-muted transition-colors text-foreground border border-border"
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
