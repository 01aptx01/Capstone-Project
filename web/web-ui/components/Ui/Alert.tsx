import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export type AlertVariant = "info" | "error" | "success";

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-sky-50 text-sky-900 border-sky-200",
  error: "bg-red-50 text-red-800 border-red-200",
  success: "bg-green-50 text-green-900 border-green-200",
};

export interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium text-center",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
