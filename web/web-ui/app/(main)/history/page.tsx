"use client";

import React, { useEffect, useState } from "react";
import { HistoryCard } from "@/components/cards/HistoryCard";
import { fetchMemberOrders, type MemberOrder } from "@/lib/api/orders";
import { useUser } from "@/context/UserContext";

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
    <div className="flex flex-col pb-32">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
          ประวัติการสั่งซื้อ
        </h1>
      </div>

      <div className="p-5 flex flex-col gap-4 max-w-md mx-auto w-full">
        {isLoading && (
          <p className="text-center text-gray-400 py-10">กำลังโหลด...</p>
        )}
        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}
        {!isLoading && !error && orders.length > 0 &&
          orders.map((order) => (
            <HistoryCard
              key={order.id}
              order={order}
              onPickupComplete={() => void loadOrders()}
            />
          ))}
        {!isLoading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center text-gray-400 mt-20 opacity-60">
            <p className="font-bold text-lg text-gray-500">
              ยังไม่มีประวัติการสั่งซื้อ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
