"use client";

import type { MemberOrder } from "@/lib/api/orders";
import { Card } from "@/components/Ui";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  order: MemberOrder;
}

export function HistoryCard({ order }: HistoryCardProps) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "สำเร็จ",
          className: "text-green-700 bg-green-50 border border-green-200",
        };
      case "cancelled":
        return {
          label: "ยกเลิกแล้ว",
          className: "text-gray-500 bg-gray-50 border border-gray-200",
        };
      case "payment_failed":
      case "dispense_failed":
        return {
          label: "ล้มเหลว",
          className: "text-red-700 bg-red-50 border border-red-200",
        };
      case "refunded":
        return {
          label: "คืนเงินสำเร็จ",
          className: "text-amber-700 bg-amber-50 border border-amber-200",
        };
      case "pending_payment":
      case "paid":
      case "dispensing":
        return {
          label: "กำลังประมวลผล",
          className: "text-blue-700 bg-blue-50 border border-blue-200",
        };
      default:
        return {
          label: "เสร็จสิ้น",
          className: "text-gray-500 bg-gray-50 border border-gray-200",
        };
    }
  };

  const statusInfo = getStatusDisplay(order.status);

  const formattedDate = (() => {
    try {
      return new Date(order.datetime).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return order.datetime;
    }
  })();

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm border border-border/80 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start border-b border-border pb-3 gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground text-sm truncate">
            ออเดอร์ #{order.orderNumber}
          </span>
          <span className="text-xs text-muted font-medium mt-0.5">
            ตู้บริการ: <span className="font-semibold text-foreground/80">{order.machine_code}</span>
          </span>
          <span className="text-[10px] text-muted font-medium mt-0.5">
            {formattedDate}
          </span>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0",
            statusInfo.className,
          )}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="flex justify-between items-end gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-muted text-sm truncate">{order.items}</span>
          <span className="font-extrabold text-foreground text-lg">{order.total} ฿</span>
        </div>
      </div>
    </Card>
  );
}
