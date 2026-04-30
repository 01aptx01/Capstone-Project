// components/cards/MyCouponCard.tsx
import React from "react";

export type MyCouponStatus = "ready" | "active" | "used" | "expired";

export interface MyCoupon {
  id: string;
  title: string;
  description: string;
  expiry: string;
  status: MyCouponStatus;
  color: string; 
}

interface MyCouponCardProps {
  coupon: MyCoupon;
  onToggleStatus?: (id: string) => void;
}

export function MyCouponCard({ coupon, onToggleStatus }: MyCouponCardProps) {
  const getStatusConfig = () => {
    switch (coupon.status) {
      case "ready":
        return {
          leftBg: coupon.color,
          badgeBg: "bg-orange-50",
          badgeText: "text-[#FF8A33]",
          badgeLabel: "พร้อมใช้งาน",
          isFaded: false,
          outline: "border-transparent",
        };
      case "active":
        return {
          leftBg: coupon.color,
          badgeBg: "bg-green-50",
          badgeText: "text-[#4ADE80]",
          badgeLabel: "กำลังใช้งาน",
          isFaded: false,
          outline: "border-[#4ADE80]", 
        };
      case "used":
        return {
          leftBg: "bg-gray-300",
          badgeBg: "bg-gray-100",
          badgeText: "text-gray-500",
          badgeLabel: "ใช้งานแล้ว",
          isFaded: true, 
          outline: "border-transparent",
        };
      case "expired":
        return {
          leftBg: "bg-gray-300",
          badgeBg: "bg-red-50",
          badgeText: "text-red-500",
          badgeLabel: "หมดอายุ",
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
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${config.badgeBg} ${config.badgeText}`}>
              {config.badgeLabel}
            </span>
          </div>

          <p className={`text-xs ${config.isFaded ? "text-gray-400" : "text-gray-500"} mb-4`}>
            {coupon.description}
          </p>

          <div className="flex justify-between items-end border-t border-gray-50 pt-3 border-dashed">
            <div className={`text-[10px] sm:text-xs flex items-center gap-1.5 ${config.isFaded ? "text-gray-400" : "text-gray-500"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {coupon.expiry}
            </div>

            {coupon.status === "ready" && (
              <button 
                onClick={() => onToggleStatus && onToggleStatus(coupon.id)}
                className="bg-[#FF8A33] hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                เปิดใช้งาน
              </button>
            )}
            {coupon.status === "active" && (
              <button 
                onClick={() => onToggleStatus && onToggleStatus(coupon.id)}
                className="bg-white text-[#4ADE80] border-2 border-[#4ADE80] hover:bg-green-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}