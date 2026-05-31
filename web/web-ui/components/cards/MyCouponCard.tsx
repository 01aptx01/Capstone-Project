// components/cards/MyCouponCard.tsx
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
}

interface MyCouponCardProps {
  coupon: MyCoupon;
}

export function MyCouponCard({ coupon }: MyCouponCardProps) {
  const [showQR, setShowQR] = React.useState(false);

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
    <>
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

            {/* Display Coupon Code for user */}
            {!config.isFaded && (
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">รหัสคูปอง (สำหรับสแกน/กรอกที่ตู้)</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand/5 border border-brand/20 rounded-md font-mono text-sm font-bold text-brand tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => setShowQR(true)}
                    className="text-xs text-brand font-bold hover:underline flex items-center gap-1 ml-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
                    แสดงคิวอาร์โค้ด
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-end gap-2 border-t border-gray-50 pt-3 border-dashed">
              <div className={`text-[10px] sm:text-xs flex items-center gap-1.5 ${config.isFaded ? "text-gray-400" : "text-gray-500"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {coupon.expiry}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl flex flex-col items-center text-center relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none" onClick={() => setShowQR(false)}>&times;</button>
            <h4 className="font-bold text-foreground text-base mb-1">คิวอาร์โค้ดคูปอง</h4>
            <p className="text-xs text-muted mb-4">{coupon.title}</p>
            <div className="bg-white p-3 border border-border rounded-xl shadow-inner mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${coupon.code}`}
                alt={coupon.code}
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="px-4 py-1.5 bg-brand/5 border border-brand/20 rounded-md font-mono text-sm font-bold text-brand tracking-wider mb-4">
              {coupon.code}
            </div>
            <p className="text-[10px] text-muted leading-relaxed">สแกนคิวอาร์โค้ดนี้ที่ช่องสแกนหน้าตู้เพื่อรับส่วนลดตอนซื้อสินค้า</p>
            <button onClick={() => setShowQR(false)} className="mt-5 w-full py-2 bg-brand text-white font-bold rounded-xl text-sm hover:bg-brand/90 transition-colors shadow-sm">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </>
  );
}