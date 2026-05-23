"use client";

import Image from "next/image";

interface BaoImageProps {
  item: { name: string; image: string };
  className?: string;
}

function isPlaceholderColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value);
}

/**
 * BaoImage - แสดงรูปจาก image_url ใน DB (เช่น /product/img/...)
 * ไฟล์อยู่ที่ public/product/img เหมือน admin-ui / machine-ui
 */
export function BaoImage({ item, className = "" }: BaoImageProps) {
  const fallbackColor = isPlaceholderColor(item.image) ? item.image : "#D4A574";

  if (
    item.image &&
    (item.image.startsWith("http") || item.image.startsWith("/"))
  ) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${fallbackColor}88, ${fallbackColor})`,
      }}
    >
      <svg viewBox="0 0 120 80" className="w-3/4 h-3/4 opacity-80">
        <ellipse cx="60" cy="50" rx="45" ry="30" fill="white" opacity="0.9" />
        <ellipse cx="60" cy="38" rx="38" ry="28" fill="white" />
        <ellipse cx="60" cy="36" rx="28" ry="20" fill={fallbackColor} opacity="0.4" />
        <ellipse cx="60" cy="34" rx="18" ry="13" fill={fallbackColor} opacity="0.6" />
      </svg>
    </div>
  );
}
