import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "touch-target shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        active
          ? "bg-brand text-white shadow-sm"
          : "bg-surface text-muted border border-border hover:border-brand/40 hover:bg-brand-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
