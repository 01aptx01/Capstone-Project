import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
}

export function Card({
  className,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-card border border-border shadow-sm overflow-hidden",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
