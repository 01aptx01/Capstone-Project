"use client";

import Image from "next/image";
import { MenuItem } from "@/lib/constants";

interface BaoImageProps {
  item: MenuItem;
  className?: string;
}

// Map category และ name ไปยังรูปภาพ
const BAO_IMAGES: Record<string, string> = {
  // Pork category
  "เปามดแดง": "/bao/pao-cream.png",
  "เปาหมูสับ": "/bao/pao-moddaeng.png",
  "เปาไก่เห็ด": "/bao/pao-moosub.png",

  // Veggie category
  "เปาบัวแดง": "/bao/pao-moosub.png",
  "เปาเต้าหู้": "/bao/pao-shrimp.png",
  "เปามันแกว": "/bao/pao-cream.png",
};

/**
 * BaoImage - แสดงรูปภาพเปา
 * ใช้ Next.js Image component สำหรับ optimization
 * มี fallback color หากรูปไม่พบ
 */
export function BaoImage({ item, className = "" }: BaoImageProps) {
  const imagePath = BAO_IMAGES[item.name];
  const fallbackColor = item.image; // hex color จาก constants

  // ถ้ามีรูป ใช้รูป; ไม่เท่า ใช้ gradient fallback
  if (imagePath) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Image
          src={imagePath}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
      </div>
    );
  }

  // Fallback: gradient + SVG placeholder
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${fallbackColor}88, ${fallbackColor})`,
      }}
    >
      {/* Stylized bao SVG */}
      <svg viewBox="0 0 120 80" className="w-3/4 h-3/4 opacity-80">
        <ellipse cx="60" cy="50" rx="45" ry="30" fill="white" opacity="0.9" />
        <ellipse cx="60" cy="38" rx="38" ry="28" fill="white" />
        <ellipse cx="60" cy="36" rx="28" ry="20" fill={fallbackColor} opacity="0.4" />
        <ellipse cx="60" cy="34" rx="18" ry="13" fill={fallbackColor} opacity="0.6" />
      </svg>
    </div>
  );
}