"use client";

import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function MenuCard({ item }: { item: MenuItem }) {
  const { cartItems, addToCart, updateQty, removeItem } = useCart();

  const cartItem = cartItems.find((c) => c.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(e, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || "",
    });
  };

  return (
    <article className="bg-surface rounded-card overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
      <div className="h-44 w-full overflow-hidden bg-brand-muted">
        <BaoImage item={item} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base">{item.name}</h3>
        <p className="text-sm mt-0.5 text-muted line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="font-bold text-lg text-brand shrink-0">
            {item.price} ฿
          </span>

          {qty > 0 ? (
            <div className="flex items-center justify-between bg-surface border border-border rounded-full px-1.5 py-1 w-[100px] shadow-sm animate-fade-in shrink-0">
              <button
                type="button"
                onClick={() =>
                  qty === 1 ? removeItem(item.id) : updateQty(item.id, -1)
                }
                className="touch-target w-7 h-7 flex items-center justify-center text-muted font-bold text-xl hover:text-brand hover:bg-brand-muted rounded-full transition-colors active:scale-90"
                aria-label="ลดจำนวน"
              >
                -
              </button>
              <span className="font-extrabold text-sm text-foreground w-6 text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                className="touch-target w-7 h-7 flex items-center justify-center text-muted font-bold text-xl hover:text-brand hover:bg-brand-muted rounded-full transition-colors active:scale-90"
                aria-label="เพิ่มจำนวน"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "px-5 py-1.5 rounded-full text-sm font-semibold bg-brand text-white border border-brand",
                "transition-all duration-200 active:scale-95 hover:bg-brand-hover shrink-0 touch-target",
              )}
            >
              สั่งซื้อ
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
