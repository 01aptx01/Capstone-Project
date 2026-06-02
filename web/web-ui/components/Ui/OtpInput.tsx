"use client";

import { cn } from "@/lib/utils";
import {
  useRef,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";

export interface OtpInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = useCallback(
    (index: number, digit: string) => {
      const next = [...value];
      next[index] = digit.replace(/\D/g, "").slice(-1);
      onChange(next);
      if (next[index] && index < length - 1) {
        refs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length],
  );

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    onChange(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-1.5 sm:gap-2.5">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled}
          onChange={(e) => setDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "touch-target w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold text-foreground border-2 border-border rounded-xl bg-surface shadow-sm transition-colors focus:outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
