import type { Product, CartItem } from "../types";

/**
 * Clamp cart items to catalog stock — remove items with zero stock,
 * cap quantities to current stock level.
 */
export function clampCartToCatalog(prev: CartItem[], catalog: Product[]): CartItem[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const next: CartItem[] = [];
  for (const item of prev) {
    const fresh = byId.get(item.id);
    if (!fresh || fresh.stock <= 0) continue;
    const qty = Math.min(item.qty, fresh.stock);
    if (qty > 0) {
      next.push({ ...item, ...fresh, qty });
    }
  }
  return next;
}
