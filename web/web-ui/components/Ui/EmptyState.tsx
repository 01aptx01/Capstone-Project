import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <span className="text-4xl">🥟</span>,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
        className,
      )}
    >
      <div className="mb-3">{icon}</div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
