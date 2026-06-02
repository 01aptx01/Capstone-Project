"use client";

import { resolveProductImageSrc } from "@/lib/product-images";

const FALLBACK_SRC =
  "https://cdn-icons-png.flaticon.com/512/3081/3081918.png";

type ProductThumbProps = {
  src: string;
  alt?: string;
  /** sm = 56×56 (table), md = 64×64 (form preview) */
  size?: "sm" | "md";
  className?: string;
};

export default function ProductThumb({
  src,
  alt = "",
  size = "sm",
  className = "",
}: ProductThumbProps) {
  const resolved = resolveProductImageSrc(src);
  const sizeClass =
    size === "md" ? "product-thumb-wrap--md" : "product-thumb-wrap--sm";

  return (
    <div
      className={`product-thumb-wrap ${sizeClass} rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm ${className}`.trim()}
    >
      <img
        src={resolved}
        alt={alt}
        className="product-thumb-img"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_SRC;
        }}
      />
    </div>
  );
}
