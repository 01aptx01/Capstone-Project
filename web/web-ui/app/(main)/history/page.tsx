"use client";

import { useCallback, useEffect, useState } from "react";
import { HistoryCard } from "@/components/cards/HistoryCard";
import { fetchMemberOrders, type MemberOrder } from "@/lib/api/orders";
import { useUser } from "@/context/UserContext";
import { EmptyState, PageHeader, Skeleton } from "@/components/Ui";

export default function HistoryPage() {
  const { phone } = useUser();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const reloadOrders = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!phone) {
        if (!cancelled) {
          setOrders([]);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await fetchMemberOrders(phone);
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "โหลดประวัติไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [phone, refreshKey]);

  return (
    <div className="flex flex-col">
      <div className="page-container pt-6">
        <PageHeader title="ประวัติการสั่งซื้อ" />
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
              onPickupComplete={reloadOrders}
            />
          ))}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState title="ยังไม่มีประวัติการสั่งซื้อ" />
        )}
      </div>
    </div>
  );
}
