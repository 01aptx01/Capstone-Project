"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIVE_ORDER_POLL_INTERVAL_MS, getPublicApiUrl } from "../constants";

export interface BlockingOrder {
  charge_id: string;
  status: string;
}

interface UseMachineBusyOptions {
  machineCode: string;
  /** ไม่ poll / ไม่บล็อกเมื่ออยู่ flow หลังจ่ายแล้ว */
  pollEnabled: boolean;
  /** ยกเว้น draft/charge ของ session ชำระเงินปัจจุบัน */
  excludeChargeId?: string | null;
}

export function useMachineBusy({
  machineCode,
  pollEnabled,
  excludeChargeId,
}: UseMachineBusyOptions) {
  const [blockingOrder, setBlockingOrder] = useState<BlockingOrder | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!pollEnabled) {
      setBlockingOrder(null);
      setIsChecking(false);
      return;
    }
    try {
      const apiUrl = getPublicApiUrl();
      const params = new URLSearchParams({ machine_code: machineCode });
      if (excludeChargeId) {
        params.set("exclude_charge_id", excludeChargeId);
      }
      const res = await fetch(`${apiUrl}/api/buy/active-order?${params}`);
      if (!res.ok) {
        console.warn("[useMachineBusy] active-order HTTP", res.status);
        return;
      }
      const data = await res.json();
      if (data.busy && data.charge_id) {
        setBlockingOrder({
          charge_id: String(data.charge_id),
          status: String(data.status ?? ""),
        });
      } else {
        setBlockingOrder(null);
      }
    } catch (e) {
      console.warn("[useMachineBusy] active-order failed:", e);
    } finally {
      setIsChecking(false);
    }
  }, [machineCode, pollEnabled, excludeChargeId]);

  const pollEnabledRef = useRef(pollEnabled);
  pollEnabledRef.current = pollEnabled;

  useEffect(() => {
    setIsChecking(true);
    void refresh();
    const interval = setInterval(() => {
      if (pollEnabledRef.current) void refresh();
    }, ACTIVE_ORDER_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    isMachineBusy: blockingOrder !== null,
    blockingOrder,
    isCheckingBusy: isChecking,
    refreshMachineBusy: refresh,
  };
}
