// components/cards/CouponCard.tsx
// ─── REDEEMABLE COUPON CARD COMPONENT ─────────────────────────────────────────
// คอมโพเนนต์แสดงรายการคูปองส่วนลดที่เปิดให้ผู้ใช้นำแต้มมาแลก (Redeemable Coupons list)
// ดีไซน์มีลักษณะคล้ายตั๋วฉีก โดยมีลูกเล่นครึ่งวงกลมซ้าย-ขวาเพื่อเลียนแบบรอยปรุ

import { Coupon } from "@/lib/constants";
import { Card } from "@/components/Ui";

interface CouponCardProps {
  coupon: Coupon; // ออบเจกต์ข้อมูลคูปองที่ต้องการนำมาแสดงผล
}

export function CouponCard({ coupon }: CouponCardProps) {
  return (
    // การ์ดหลักพร้อมการตั้งค่าเอฟเฟกต์ย่อขยายเมื่อวางเมาส์เพื่อความหรูหรา (premium hover scale)
    <Card padding="none" className="flex flex-col transition-transform hover:scale-[1.01]">
      
      {/* 1. ส่วนบนของการ์ด: แสดงสีพื้นหลังธีมคูปองและภาพไอคอนของขวัญ */}
      <div
        className={`relative h-32 ${coupon.colorBg} flex items-center justify-center`}
      >
        {/* ครึ่งวงกลมซ้าย-ขวา เพื่อแต่งดีไซน์คูปองตั๋วฉีก */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
        
        {/* ไอคอน SVG รูปคูปอง/ตั๋ว */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z" />
          <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* 2. ส่วนล่างของการ์ด: รายละเอียดชื่อโปรโมชัน, เงื่อนไขส่วนลด, และปุ่มคะแนน */}
      <div className="p-5 flex flex-col flex-1">
        {/* ชื่อเรื่องคูปอง เช่น "ลด 10 บาทสำหรับซาลาเปาหมูสับ" */}
        <h3 className="text-xl font-bold text-foreground text-center mb-1">
          {coupon.title}
        </h3>
        
        {/* เงื่อนไขการใช้งานคูปอง */}
        <p className="text-sm text-muted text-center mb-6">{coupon.description}</p>

        {/* แสดงจำนวนแต้มที่ใช้ในการแลกคูปอง */}
        <div className="mt-auto flex justify-between items-center border-t border-border pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-brand">{coupon.points}</span>
            <span className="text-xs font-bold text-brand uppercase">Points</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

