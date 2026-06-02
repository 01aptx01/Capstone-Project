// components/Ui/Card.tsx
// ─── PRIMITIVE CARD UI COMPONENT ─────────────────────────────────────────────
// คอมโพเนนต์การ์ดพื้นฐาน (Card Wrapper) สำหรับจัดกลุ่มเนื้อหาให้ดูเป็นสัดส่วน สวยงาม
// รองรับการระบุระยะขอบ (Padding) และการเพิ่มคลาสสไตล์แบบยืดหยุ่นจากภายนอก

import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

// กำหนด Props ของ Card โดยขยายความสามารถมาจาก div ของ HTML ปกติ
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md"; // ระยะห่างขอบด้านใน (none = ไม่มี, sm = เล็ก, md = ปกติ)
}

export function Card({
  className,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // สไตล์หลัก: สีพื้นหลัง (Surface), มุมโค้งตามธีม, เส้นขอบ (Border), เงาจางๆ (Shadow) และซ่อนเนื้อหาล้น (Overflow Hidden)
        "bg-surface rounded-card border border-border shadow-sm overflow-hidden",
        // ปรับระยะห่าง (Padding) ตามค่าที่กำหนดมา
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

