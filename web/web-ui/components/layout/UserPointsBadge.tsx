// components/layout/UserPointsBadge.tsx
// ─── USER POINTS BADGE COMPONENT ─────────────────────────────────────────────
// คอมโพเนนต์แสดงผลคะแนนสะสมของสมาชิก (Points Badge)
// รองรับการปรับเปลี่ยนรูปแบบ ขนาดตัวอักษร และสีสัน ตาม Props ที่ส่งมา

import { cn } from "@/lib/utils";

interface UserPointsBadgeProps {
  points: number;            // คะแนนของสมาชิก
  compact?: boolean;         // หากเป็น true จะแสดงผลขนาดเล็กกะทัดรัด (เช่น สำหรับการ์ดขนาดเล็ก)
  variant?: "default" | "inverse"; // รูปแบบสี: default (พื้นจางอักษรเข้ม) หรือ inverse (พื้นโปร่งแสงอักษรขาว)
  className?: string;        // คลาส CSS เพิ่มเติมสำหรับปรับแต่งภายนอก
}

export function UserPointsBadge({
  points,
  compact = false,
  variant = "default",
  className,
}: UserPointsBadgeProps) {
  return (
    <span
      className={cn(
        // สไตล์หลัก: จัดตำแหน่งตรงกลางแนวตั้ง ปัดขอบโค้งมน ตัวหนา และห้ามตัดบรรทัดใหม่
        "inline-flex items-center rounded-full font-bold whitespace-nowrap",
        // เลือกสไตล์สีตาม Variant
        variant === "inverse"
          ? "bg-white/20 text-white"
          : "bg-brand-muted text-brand",
        // ปรับขนาด Padding และ Font ตามตัวเลือก compact
        compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      {points} แต้ม
    </span>
  );
}

