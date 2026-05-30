"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Product, ModalType, AgentJobState } from "../types";
import { STEP1_DELAY, PROCESS_STEPS } from "../constants";
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
}: UseHeatingProcessOptions) {
  // ==========================================
  // STATE
  // ==========================================
  const [queue, setQueue] = useState<Product[]>([]);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0);
  const [isInitialStep1Delay, setIsInitialStep1Delay] = useState(false);
  const heatingTimelineStartedRef = useRef(false);

  // ==========================================
  // SOCKET SYNC
  // ==========================================
  // Sync socket-driven remaining time into local globalTimeLeft state
  useEffect(() => {
    if ((isAfterPayment || activeModal === "processing") && agentJobState) {
      setGlobalTimeLeft(socketGlobalTimeLeft);
    }
  }, [socketGlobalTimeLeft, activeModal, isAfterPayment, agentJobState]);

  // ==========================================
  // LOCAL HEATING COUNTDOWN TIMER
  // ==========================================
  const localHeatCountdownActive =
    !agentJobState &&
    (activeModal === "processing" ||
      (activeModal === "numpad" && isAfterPayment) ||
      (activeModal === "points_result" && isAfterPayment));

  useEffect(() => {
    if (!localHeatCountdownActive) return;
    const interval = setInterval(() => {
      setGlobalTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [localHeatCountdownActive, agentJobState]);

  // ==========================================
  // DERIVED DATA
  // ==========================================
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

  const isProcessCompleted = agentJobState
    ? agentJobState === "DONE" || agentJobState === "ERROR"
    : currentStep === 4;
  const isProcessSuccess = agentJobState ? agentJobState === "DONE" : currentStep >= 3;

  // เช็คว่าลูกแรกอุ่นเสร็จและเริ่มเสิร์ฟหรือยัง
  const hasStartedServing =
    queue.length > 0 &&
    totalProcessTime - globalTimeLeft - STEP1_DELAY >= queue[0].heatingTime;

  // Progress line width: extend to Step3 zone when multi-flavor serving has started
  const progressLineWidth =
    isMultiFlavor && currentStep === 1 && hasStartedServing
      ? "50%"
      : `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;

  // ==========================================
  // FUNCTIONS
  // ==========================================
  /** เริ่ม state การอุ่น (เวลา + step) โดยไม่สลับ modal — ใช้คู่กับหน้า numpad หลังจ่ายเงิน */
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
    setActiveModal("none");
    void fetchProducts({ silent: true });
  }, [setActiveModal, fetchProducts]);

  return {
    // State
    queue,
    setQueue,
    globalTimeLeft,
    setGlobalTimeLeft,
    isInitialStep1Delay,
    // Derived
    currentStep,
    currentItemIndex,
    isDispensingItem,
    isProcessCompleted,
    isProcessSuccess,
    isMultiFlavor,
    hasStartedServing,
    progressLineWidth,
    totalProcessTime,
    // Actions
    beginHeatingTimelineOnly,
    startHeatingProcess,
    handleProcessingCompleteClose,
    // Ref (exposed for page-level reset during checkout)
    heatingTimelineStartedRef,
  };
}
