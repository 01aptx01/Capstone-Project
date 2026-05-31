// components/cards/MyCouponCard.tsx
"use client";
import React from "react";
export type MyCouponStatus = "active" | "used" | "expired";

export interface MyCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  expiry: string;
  status: MyCouponStatus;
  color: string; 
  /** Remaining quantity, null or undefined means not applicable */
  remaining?: number | null;
}

interface MyCouponCardProps {
  coupon: MyCoupon;
}

export function MyCouponCard({ coupon }: MyCouponCardProps) {
  const [showCode, setShowCode] = React.useState(false);

  const getStatusConfig = () => {
    switch (coupon.status) {
      case "active":
        return {
          leftBg: coupon.color,
          badgeBg: "bg-green-50 border border-green-200",
          badgeText: "text-green-700",
          badgeLabel: "พร้อมใช้งาน",
          isFaded: false,
          outline: "border-green-200", 
        };
      case "used":
        return {
          leftBg: "bg-gray-300",
          badgeBg: "bg-gray-100 border border-gray-200",
          badgeText: "text-gray-500",
          badgeLabel: "ใช้งานแล้ว",
          isFaded: true, 
          outline: "border-transparent",
        };
      case "expired":
        return {
          leftBg: "bg-gray-300",
          badgeBg: "bg-red-50 border border-red-200",
          badgeText: "text-red-500",
          badgeLabel: "หมดอายุ",
          isFaded: true, 
          outline: "border-transparent",
        };
      default:
        return {
          leftBg: "bg-gray-300",
          badgeBg: "bg-gray-100 border border-gray-200",
          badgeText: "text-gray-500",
          badgeLabel: "เสร็จสิ้น",
          isFaded: true,
          outline: "border-transparent",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex relative rounded-2xl bg-white shadow-sm overflow-hidden border-2 transition-all ${config.outline} ${config.isFaded ? "opacity-60 grayscale-[0.2]" : ""}`}>
      <div className={`w-[100px] sm:w-[120px] shrink-0 ${config.leftBg} flex items-center justify-center relative`}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M4 12v.01"/><path d="M4 14v.01"/><path d="M4 10v.01"/><path d="M20 12v.01"/><path d="M20 14v.01"/><path d="M20 10v.01"/><path d="M8 12h8"/>
        </svg>
        <div className="absolute top-0 bottom-0 right-0 border-r-[2px] border-dashed border-white/50" />
      </div>

      <div className="flex-1 p-4 md:p-5 relative bg-white">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-50 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gray-50 rounded-full" />

        <div className="pl-2">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className={`text-base font-bold ${config.isFaded ? "text-gray-500" : "text-gray-800"}`}>
              {coupon.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${config.badgeBg} ${config.badgeText}`}>
              {config.badgeLabel}
            </span>
          </div>

          <p className={`text-xs ${config.isFaded ? "text-gray-400" : "text-gray-500"} mb-3`}>
            {coupon.description}
          </p>

          {/* Remaining quantity */}
          <p className={`text-xs ${config.isFaded ? "text-gray-400" : "text-gray-500"} mb-2`}>
            คงเหลือ: {coupon.remaining != null ? coupon.remaining : '-'}
          </p>

          {/* Display Coupon Code for user */}
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">รหัสคูปอง (สำหรับกรอกที่ตู้)</span>
            <div className="flex items-center gap-2 max-w-max">
              {showCode ? (
                <>
                  <span className="px-3 py-1 bg-brand/5 border border-brand/20 rounded-md font-mono text-base font-bold text-brand tracking-wider select-all animate-fade-in">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => setShowCode(false)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all border bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-foreground"
                    title="ซ่อนรหัสคูปอง"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <span>ซ่อนรหัส</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-md font-mono text-base font-bold text-gray-400 tracking-wider select-none">
                    ••••••••
                  </span>
                  <button
                    onClick={() => setShowCode(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all border bg-brand/5 hover:bg-brand/10 border-brand/20 text-brand"
                    title="แสดงรหัสคูปอง"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>แสดงรหัส</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end gap-2 border-t border-gray-50 pt-3 border-dashed">
            <div className={`text-[10px] sm:text-xs flex items-center gap-1.5 ${config.isFaded ? "text-gray-400" : "text-gray-500"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {coupon.expiry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}