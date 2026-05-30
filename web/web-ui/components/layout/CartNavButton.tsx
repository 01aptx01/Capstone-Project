"use client";

import Link from "next/link";
import { IconCart } from "@/components/icons";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface CartNavButtonProps {
  className?: string;
}

export function CartNavButton({ className }: CartNavButtonProps) {
  const { cartCount } = useCart();

  return (
    <Link
      href="/checkout"
      aria-label={
        cartCount > 0 ? `ตะกร้า ${cartCount} รายการ` : "ตะกร้า"
      }
      className={cn(
        "relative touch-target flex items-center justify-center p-2 rounded-full",
        "text-foreground hover:bg-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        className,
      )}
    >
      <IconCart />
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold min-w-[1.125rem] h-[1.125rem] px-1 rounded-full flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
