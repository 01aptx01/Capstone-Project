"use client";

// components/cards/BaoImage.tsx
// ─── BAO IMAGE COMPONENT ─────────────────────────────────────────────────────
// คอมโพเนนต์สำหรับแสดงรูปภาพซาลาเปาอเนกประสงค์
// จัดการให้สามารถรองรับทั้งรูปภาพจริงผ่านลิงก์ URL หรือหากไม่มีรูป ให้วาดรูปการ์ตูนซาลาเปาเป็น SVG ด้วยสีพื้นหลังดีฟอลต์

import Image from "next/image";
import { resolveProductImageSrc } from "@/lib/resolve-product-image";

interface BaoImageProps {
  item: { name: string; image: string }; // ออบเจกต์ที่มีข้อมูลชื่อและที่อยู่ของรูปภาพ (หรือสี)
  className?: string;                     // คลาส CSS เพิ่มเติมสำหรับตกแต่งภายนอก
}

// ตรวจสอบว่าค่าของตัวแปรภาพที่ได้รับมาเป็นรหัสสี HEX หรือไม่ (เช่น #FFAABB)
function isPlaceholderColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value);
}

/**
 * BaoImage
 * แสดงรูปภาพสินค้าจาก image_url ในฐานข้อมูล (เช่น /product/img/...)
 * หากไม่มีข้อมูลรูปภาพ จะทำการวาดซาลาเปาด้วยกราฟิก SVG และใช้สีพื้นหลังที่ระบุไว้
 */
export function BaoImage({ item, className = "" }: BaoImageProps) {
  // หากค่าในฟิลด์ภาพเป็นรหัสสี ให้ใช้สีนั้นเป็นพื้นหลังสำรอง หรือหากไม่ระบุให้ใช้สีส้มซาลาเปาอบอุ่น (#D4A574)
  const fallbackColor = isPlaceholderColor(item.image) ? item.image : "#D4A574";

  // 1. กรณีที่มีข้อมูลเป็นที่อยู่รูปภาพ (เริ่มด้วย HTTP หรือ /) ให้แสดงรูปภาพโดย Next.js Image
  if (
    item.image &&
    (item.image.startsWith("http") || item.image.startsWith("/"))
  ) {
    const imageSrc = resolveProductImageSrc(item.image);
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 300px"
          unoptimized
        />
      </div>
    );
  }

  // 2. กรณีที่ไม่มีรูปภาพ (เป็นรหัสสีหรือค่าว่าง) จะเรนเดอร์รูปซาลาเปากราฟิก SVG ขึ้นมาทดแทน
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        // สร้างพื้นหลังแบบไล่เฉดสีเพื่อความสวยงาม premium (Gradient)
        background: `linear-gradient(135deg, ${fallbackColor}88, ${fallbackColor})`,
      }}
    >
      {/* วาดรูปซาลาเปาการ์ตูนขาวๆ ด้วย SVG */}
      <svg viewBox="0 0 120 80" className="w-3/4 h-3/4 opacity-80">
        <ellipse cx="60" cy="50" rx="45" ry="30" fill="white" opacity="0.9" />
        <ellipse cx="60" cy="38" rx="38" ry="28" fill="white" />
        <ellipse cx="60" cy="36" rx="28" ry="20" fill={fallbackColor} opacity="0.4" />
        <ellipse cx="60" cy="34" rx="18" ry="13" fill={fallbackColor} opacity="0.6" />
      </svg>
    </div>
  );
}

