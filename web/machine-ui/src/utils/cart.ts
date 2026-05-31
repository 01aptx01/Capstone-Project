import type { Product, CartItem } from "../types";

// clampCartToCatalog
// - ตรวจสอบและควบคุมรายการในตะกร้าสินค้าให้สอดคล้องกับสต็อกจริงในตู้ปัจจุบัน
// - หน้าที่หลัก: 
//   1. ลบสินค้าออกจากตะกร้าทันทีหากสินค้านั้นมีสต็อกเป็น 0 (หรือถูกนำออกจากตู้แล้ว)
//   2. หากจำนวนที่สั่งซื้อในตะกร้ามากกว่าจำนวนสินค้าจริงที่มีในสต็อกตู้ จะทำการปรับระดับลงมาให้เท่ากับเพดานสต็อกสูงสุดพอดี (Clamp)
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

