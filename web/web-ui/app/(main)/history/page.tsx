"use client";

import { useEffect, useState } from "react";
import { HistoryCard } from "@/components/cards/HistoryCard";
import { fetchMemberOrders, type MemberOrder } from "@/lib/api/orders";
import { useUser } from "@/context/UserContext";
import { EmptyState, Skeleton } from "@/components/Ui";

export default function HistoryPage() {
  const { phone } = useUser();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!phone) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMemberOrders(phone);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดประวัติไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [phone]);

  return (
    <div className="flex flex-col">
      <div className="page-container pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          ประวัติการสั่งซื้อ
        </h1>
      </div>

      <div className="page-container flex flex-col gap-4 max-w-md mx-auto w-full pb-6">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        {error && (
          <EmptyState
            title="โหลดประวัติไม่สำเร็จ"
            description={error}
            icon={<span className="text-4xl">⚠️</span>}
          />
        )}
        {!isLoading &&
          !error &&
          orders.map((order) => (
            <HistoryCard
              key={order.id}
              order={order}
              onPickupComplete={() => void loadOrders()}
            />
          ))}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState title="ยังไม่มีประวัติการสั่งซื้อ" />
        )}
      </div>
    </div>
  );
}
