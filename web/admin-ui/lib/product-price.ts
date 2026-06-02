/** Minimum product unit price (THB) — aligns with Omise charge minimum. */
export const MIN_PRODUCT_PRICE_THB = 20;

import { digitsOnly } from "@/lib/integer-input";

export function parseProductPriceThb(raw: string): number | null {
  const s = digitsOnly(raw.trim());
  if (!s) return null;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function isValidProductPriceThb(price: number): boolean {
  return Number.isInteger(price) && price >= MIN_PRODUCT_PRICE_THB;
}
