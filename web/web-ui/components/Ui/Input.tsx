import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  center?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, center, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-bold text-subtle mb-2",
            center && "text-center",
          )}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full px-5 py-4 rounded-xl border-2 border-border bg-surface text-foreground text-lg font-semibold placeholder:text-stone-300 placeholder:font-medium shadow-sm transition-colors focus:outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
          center && "text-center",
          error && "border-destructive focus:border-destructive",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-destructive text-center">
          {error}
        </p>
      )}
    </div>
  ),
);

Input.displayName = "Input";
