/** Minimum product unit price (THB) — aligns with Omise charge minimum. */
export const MIN_PRODUCT_PRICE_THB = 20;

export function parseProductPriceThb(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export function isValidProductPriceThb(price: number): boolean {
  return Number.isInteger(price) && price >= MIN_PRODUCT_PRICE_THB;
}
