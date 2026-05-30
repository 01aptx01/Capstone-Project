import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-brand hover:bg-brand-hover active:scale-[0.98] disabled:bg-stone-300 disabled:shadow-none",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-brand-muted active:scale-[0.98]",
  ghost:
    "bg-transparent text-brand hover:bg-brand-muted active:scale-[0.98]",
  danger:
    "bg-destructive text-white hover:opacity-90 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-5 py-3.5 text-base rounded-2xl",
  lg: "px-6 py-4 text-lg rounded-2xl font-bold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "touch-target inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? "กำลังดำเนินการ..." : children}
    </button>
  ),
);

Button.displayName = "Button";
