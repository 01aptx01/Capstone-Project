import type { KeyboardEvent } from "react";

/** Prevent decimal/exponent/sign keys in integer-only fields. */
export function blockNonIntegerKeys(e: KeyboardEvent<HTMLInputElement>) {
  if ([".", ",", "e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
}

/** Keep only ASCII digits (empty string allowed). */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function parseDigitsToNonNegativeInt(raw: string): number {
  const s = digitsOnly(raw);
  if (!s) return 0;
  return parseInt(s, 10);
}

export function parseDigitsToOptionalNonNegativeInt(raw: string): number | null {
  const s = digitsOnly(raw.trim());
  if (!s) return null;
  return parseInt(s, 10);
}

export function isNonNegativeInteger(n: number): boolean {
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}
