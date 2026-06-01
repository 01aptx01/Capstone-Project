"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Product, ModalType, AgentJobState } from "../types";
import {
  STEP1_DELAY,
  PROCESS_STEPS,
  HARDWARE_EVENT_WAIT_MS,
  ORDER_STATUS_POLL_INTERVAL_MS,
  ORDER_STATUS_POLL_MAX_ATTEMPTS,
  getPublicApiUrl,
} from "../constants";
import {
  buildDispenseSchedule,
  calculateTotalProcessTime,
  getProcessStatus,
  mapAgentStateToStep,
} from "../utils/dispenseSchedule";

interface UseHeatingProcessOptions {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  isAfterPayment: boolean;
  setIsAfterPayment: (v: boolean) => void;
  agentJobState: AgentJobState | null;
  agentCurrentItemIndex: number;
  socketGlobalTimeLeft: number;
  fetchProducts: (options?: { silent?: boolean }) => Promise<void>;
  /** รหัส charge หลังชำระเงิน — ใช้ poll สถานะเมื่อ Pi ช้า/offline */
  orderChargeId: string | null;
}

export function useHeatingProcess({
  activeModal,
  setActiveModal,
  isAfterPayment,
  setIsAfterPayment,
  agentJobState,
  agentCurrentItemIndex,
  socketGlobalTimeLeft,
  fetchProducts,
  orderChargeId,
}: UseHeatingProcessOptions) {
  const [queue, setQueue] = useState<Product[]>([]);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0);
  const [isInitialStep1Delay, setIsInitialStep1Delay] = useState(false);
  const [isAwaitingHardware, setIsAwaitingHardware] = useState(false);
  const [orderRecoveredSuccess, setOrderRecoveredSuccess] = useState(false);
  const [hardwareGiveUp, setHardwareGiveUp] = useState(false);
  const heatingTimelineStartedRef = useRef(false);

  useEffect(() => {
    if ((isAfterPayment || activeModal === "processing") && agentJobState) {
      setGlobalTimeLeft(socketGlobalTimeLeft);
      setIsAwaitingHardware(false);
      setHardwareGiveUp(false);
    }
  }, [socketGlobalTimeLeft, activeModal, isAfterPayment, agentJobState]);

  // ไม่ใช้ countdown จำลองบนหน้า processing — รอ event จริงหรือ poll order status เท่านั้น
  const localHeatCountdownActive =
    !agentJobState &&
    ((activeModal === "numpad" && isAfterPayment) ||
      (activeModal === "points_result" && isAfterPayment));

  useEffect(() => {
    if (!localHeatCountdownActive) return;
    const interval = setInterval(() => {
      setGlobalTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [localHeatCountdownActive, agentJobState]);

  useEffect(() => {
    if (activeModal !== "processing") {
      setIsAwaitingHardware(false);
      setOrderRecoveredSuccess(false);
      setHardwareGiveUp(false);
      return;
    }
    if (agentJobState || orderRecoveredSuccess) {
      setIsAwaitingHardware(false);
      return;
    }
    const timer = setTimeout(() => setIsAwaitingHardware(true), HARDWARE_EVENT_WAIT_MS);
    return () => clearTimeout(timer);
  }, [activeModal, agentJobState, orderRecoveredSuccess]);

  // หลังรอ event จาก Pi ครบ 60s — poll สถานะ order (กรณี Pi offline แล้ว replay ทีหลัง)
  useEffect(() => {
    if (activeModal !== "processing" || !isAwaitingHardware || !orderChargeId) return;
    if (agentJobState || orderRecoveredSuccess) return;

    const apiUrl = getPublicApiUrl();
    let attempts = 0;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      attempts++;
      try {
        const res = await fetch(`${apiUrl}/api/buy/status/${encodeURIComponent(orderChargeId)}`);
        if (res.ok) {
          const data = await res.json();
          const st = String(data.status ?? "").toLowerCase();
          if (st === "completed" || st === "dispensing") {
            setOrderRecoveredSuccess(true);
            setIsAwaitingHardware(false);
            return;
          }
          if (
            st === "dispense_failed" ||
            st === "refunded" ||
            st === "payment_failed" ||
            st === "failed"
          ) {
            setHardwareGiveUp(true);
            setIsAwaitingHardware(false);
            return;
          }
        }
      } catch (e) {
        console.warn("[useHeatingProcess] order status poll failed:", e);
      }
      if (attempts >= ORDER_STATUS_POLL_MAX_ATTEMPTS) {
        setHardwareGiveUp(true);
        setIsAwaitingHardware(false);
      }
    };

    void tick();
    const interval = setInterval(() => void tick(), ORDER_STATUS_POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [
    activeModal,
    isAwaitingHardware,
    orderChargeId,
    agentJobState,
    orderRecoveredSuccess,
  ]);

  const dispenseSchedule = useMemo(() => buildDispenseSchedule(queue), [queue]);
  const totalProcessTime = calculateTotalProcessTime(queue);

  const isMultiFlavor = useMemo(() => {
    if (queue.length <= 1) return false;
    const uniqueTimes = new Set(queue.map((it) => it.heatingTime));
    return uniqueTimes.size > 1;
  }, [queue]);

  const fallbackStatus = getProcessStatus(queue, globalTimeLeft, totalProcessTime, dispenseSchedule);

  const currentStep = agentJobState ? mapAgentStateToStep(agentJobState) : fallbackStatus.step;
  const currentItemIndex = agentJobState ? agentCurrentItemIndex : fallbackStatus.itemIndex;
  const isDispensingItem = agentJobState ? agentJobState === "DISPENSING" : fallbackStatus.isDispensingItem;

  const isProcessCompleted = orderRecoveredSuccess
    ? true
    : hardwareGiveUp
      ? true
      : agentJobState
        ? agentJobState === "DONE" || agentJobState === "ERROR"
        : false;

  const isProcessSuccess = orderRecoveredSuccess
    ? true
    : hardwareGiveUp
      ? false
      : agentJobState
        ? agentJobState === "DONE"
        : false;

  const processingStatusMessage = isAwaitingHardware
    ? "ระบบยังดำเนินการจ่ายสินค้า — รอสักครู่ (ตู้อาจกำลังเชื่อมต่อใหม่)"
    : hardwareGiveUp
      ? "ไม่ได้รับสัญญาณจากตู้ในเวลาที่กำหนด — หากชำระเงินแล้ว กรุณาติดต่อเจ้าหน้าที่"
      : null;

  const hasStartedServing =
    queue.length > 0 &&
    totalProcessTime - globalTimeLeft - STEP1_DELAY >= queue[0].heatingTime;

  const progressLineWidth =
    isMultiFlavor && currentStep === 1 && hasStartedServing
      ? "50%"
      : `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;

  const beginHeatingTimelineOnly = useCallback(
    (q: Product[]) => {
      if (!agentJobState) {
        const totalTime = calculateTotalProcessTime(q);
        if (!heatingTimelineStartedRef.current) {
          setGlobalTimeLeft(totalTime);
          heatingTimelineStartedRef.current = true;
        }
      }
      setIsInitialStep1Delay(true);
    },
    [agentJobState],
  );

  const exitPostPaymentLoyalty = useCallback(() => {
    setIsAfterPayment(false);
  }, [setIsAfterPayment]);

  const startHeatingProcess = useCallback(() => {
    if (!heatingTimelineStartedRef.current) {
      beginHeatingTimelineOnly(queue);
    }
    setActiveModal("processing");
    exitPostPaymentLoyalty();
  }, [queue, beginHeatingTimelineOnly, setActiveModal, exitPostPaymentLoyalty]);

  const handleProcessingCompleteClose = useCallback(() => {
    heatingTimelineStartedRef.current = false;
    setIsAwaitingHardware(false);
    setOrderRecoveredSuccess(false);
    setHardwareGiveUp(false);
    setActiveModal("none");
    void fetchProducts({ silent: true });
  }, [setActiveModal, fetchProducts]);

  return {
    queue,
    setQueue,
    globalTimeLeft,
    setGlobalTimeLeft,
    isInitialStep1Delay,
    currentStep,
    currentItemIndex,
    isDispensingItem,
    isProcessCompleted,
    isProcessSuccess,
    isMultiFlavor,
    hasStartedServing,
    progressLineWidth,
    totalProcessTime,
    processingStatusMessage,
    isAwaitingHardware,
    beginHeatingTimelineOnly,
    startHeatingProcess,
    handleProcessingCompleteClose,
    heatingTimelineStartedRef,
  };
}
