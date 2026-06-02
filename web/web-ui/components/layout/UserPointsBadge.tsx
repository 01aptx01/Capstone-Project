import { cn } from "@/lib/utils";

interface UserPointsBadgeProps {
  points: number;
  compact?: boolean;
  variant?: "default" | "inverse";
  className?: string;
}

export function UserPointsBadge({
  points,
  compact = false,
  variant = "default",
  className,
}: UserPointsBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold whitespace-nowrap",
        variant === "inverse" ? "bg-white/20 text-white" : "bg-brand-muted text-brand",
        compact ? "px-3 py-1 text-sm font-extrabold" : "px-4 py-1.5 text-base",
        className,
      )}
    >
      {points} แต้ม
    </span>
  );
}

