"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function FloatingCart() {
  const { cartCount, totalPrice, orderStatus, timeLeft, showCartFullToast } =
    useCart();
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/home";
  const isPending = orderStatus === "pending";

  if (!isPending) {
    if (!isHome || cartCount === 0) return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const wrapperClass =
    "fixed left-0 w-full z-[var(--z-cart)] px-4 md:px-0 flex justify-center animate-fade-in pointer-events-none floating-cart-offset";

  if (orderStatus === "pending") {
    return (
      <div className={cn(wrapperClass, "flex-col items-center")}>
        <button
          type="button"
          onClick={() => router.push("/payment")}
          className="w-full max-w-2xl bg-destructive rounded-2xl p-4 px-5 flex items-center justify-between shadow-lg cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform text-white text-left"
        >
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base">
                รอการชำระเงิน ({formatTime(timeLeft)})
              </span>
              <span className="text-[10px] md:text-xs opacity-90 font-medium">
                กดเพื่อกลับไปหน้าชำระเงิน
              </span>
            </div>
          </div>
          <svg
            className="text-white shrink-0"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        wrapperClass,
        "flex-col items-center gap-3",
      )}
    >
      {showCartFullToast && (
        <div
          role="status"
          className="bg-destructive text-white text-sm md:text-base font-bold px-7 py-4 rounded-full shadow-xl flex items-center gap-2 animate-shake pointer-events-auto border border-red-500/50"
        >
          ตะกร้าเต็มแล้ว! สั่งได้สูงสุด 3 ชิ้น/ออเดอร์
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/checkout")}
        className="w-full max-w-2xl bg-brand rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-brand cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform text-white text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -top-1.5 -right-2.5 bg-surface text-brand text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand">
              {cartCount}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm md:text-base truncate">
              ตะกร้าของคุณ ({cartCount}/3)
            </span>
            <span className="text-[10px] md:text-xs opacity-90 font-medium mt-0.5">
              กดเพื่อดูรายละเอียดและชำระเงิน
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-extrabold text-lg md:text-xl">{totalPrice} ฿</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>
    </div>
  );
}
