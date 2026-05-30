"use client";

import { useState } from "react";
import type { MemberOrder } from "@/lib/api/orders";
import { QRScannerModal } from "@/components/Ui/QRScannerModal";
import { Button, Card } from "@/components/Ui";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  order: MemberOrder;
  onPickupComplete?: () => void;
}

export function HistoryCard({ order, onPickupComplete }: HistoryCardProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ready_to_scan":
        return {
          label: "พร้อมสแกน",
          className: "text-success bg-green-50",
        };
      case "completed":
        return {
          label: "เสร็จสิ้น",
          className: "text-muted bg-background",
        };
      default:
        return {
          label: "-",
          className: "text-muted bg-background",
        };
    }
  };

  const statusInfo = getStatusDisplay(order.status);

  return (
    <>
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex justify-between items-center border-b border-border pb-3 gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground text-sm truncate">
              ออเดอร์ #{order.orderNumber}
            </span>
            <span className="text-xs text-muted font-medium">
              {order.datetime}
            </span>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-bold shrink-0",
              statusInfo.className,
            )}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="flex justify-between items-end gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-muted text-sm truncate">{order.items}</span>
            <span className="font-extrabold text-foreground">{order.total} ฿</span>
          </div>

          {order.status === "ready_to_scan" && (
            <Button
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setShowQRScanner(true)}
            >
              สแกนแลกรับ
            </Button>
          )}
        </div>
      </Card>

      {showQRScanner && (
        <QRScannerModal
          orderNumber={order.orderNumber}
          chargeId={order.charge_id}
          onClose={() => setShowQRScanner(false)}
          onSuccess={() => {
            setShowQRScanner(false);
            onPickupComplete?.();
          }}
        />
      )}
    </>
  );
}
