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
  isAfterPayment: boolean; // เช็คว่าเป็นการเข้าสู่หน้าสมัครสมาชิก/โชว์แต้มหลังชำระเงินสำเร็จหรือไม่
  setIsAfterPayment: (v: boolean) => void; // ฟังก์ชันอัปเดตสถานะหลังจ่ายเงิน
  agentJobState: AgentJobState | null; // สถานะการทำงานจริงที่ยิงมาจากเครื่องอุ่นอาหารจริงผ่าน Socket
  agentCurrentItemIndex: number; // ลำดับสินค้าตัวปัจจุบันที่กำลังจัดการ (ดึงจากตู้จริง)
  socketGlobalTimeLeft: number; // วินาทีคงเหลือที่ดึงมาจากสถานะจริงของเครื่องอุ่นอาหาร
  fetchProducts: (options?: { silent?: boolean }) => Promise<void>; // ฟังก์ชันเรียก API ดึงสต็อกสินค้าใหม่หลังเสร็จกระบวนการ
}

// useHeatingProcess Hook
// - ควบคุมจำลองและรับสถานะกระบวนการอุ่น/เสิร์ฟสินค้า
// - รองรับทั้งกรณีดึงข้อมูลสดๆ จากเครื่องอุ่น (Socket) หรือใช้การนับถอยหลังจำลองในเบราว์เซอร์ (Fallback Local Countdown)
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
  // STATE
  const [queue, setQueue] = useState<Product[]>([]); // คิวรายการสินค้าที่ต้องทำการอุ่น (เรียงลำดับเวลาอุ่นจากน้อยไปหามากแล้ว)
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number>(0); // เวลารวมทั้งหมดที่เหลืออยู่ (วินาที)
  const [isInitialStep1Delay, setIsInitialStep1Delay] = useState(false); // ควบคุมการหน่วงเวลาก่อนเริ่มอุ่นจริงชิ้นแรก
  const heatingTimelineStartedRef = useRef(false); // Ref ช่วยจำว่ากระบวนการนับถอยหลังได้เริ่มขึ้นแล้วหรือยัง

  // SOCKET SYNC (การซิงค์ข้อมูลกับบอร์ดตู้จริง)
  // - ซิงค์เวลาคงเหลือจาก socket เข้าสู่ตัวแปร globalTimeLeft ทันทีที่มีการสตรีมข้อมูลเข้ามาจากบอร์ดตู้จริง
  useEffect(() => {
    if ((isAfterPayment || activeModal === "processing") && agentJobState) {
      setGlobalTimeLeft(socketGlobalTimeLeft);
    }
  }, [socketGlobalTimeLeft, activeModal, isAfterPayment, agentJobState]);

  // LOCAL HEATING COUNTDOWN TIMER (ตัวเลขนับถอยหลังจำลองบนหน้าเว็บ)
  // - เปิดระบบนับถอยหลังจำลองก็ต่อเมื่อ: ตู้จริงยังไม่ส่ง socket มา และหน้าจออยู่ในโหมดอุ่นอาหาร (หรือโหมดสมาชิก/โชว์คะแนนหลังชำระเงิน)
  const localHeatCountdownActive =
    !agentJobState &&
    (activeModal === "processing" ||
      (activeModal === "numpad" && isAfterPayment) ||
      (activeModal === "points_result" && isAfterPayment));

  useEffect(() => {
    if (!localHeatCountdownActive) return;
    const interval = setInterval(() => {
      setGlobalTimeLeft((prev) => Math.max(0, prev - 1)); // ลดเวลาลงวินาทีละ 1 วิ
    }, 1000);
    return () => clearInterval(interval);
  }, [localHeatCountdownActive, agentJobState]);

  // DERIVED DATA
  const dispenseSchedule = useMemo(() => buildDispenseSchedule(queue), [queue]); // ตารางคำนวณไทม์ไลน์การเสิร์ฟของแต่ละชิ้น
  const totalProcessTime = calculateTotalProcessTime(queue); // เวลาทั้งหมดที่ต้องใช้ในคิวนี้ (วินาที)

  // เช็คว่ามีเวลาอุ่นแตกต่างกันมากกว่า 1 แบบไหม
  const isMultiFlavor = useMemo(() => {
    if (queue.length <= 1) return false;
    const uniqueTimes = new Set(queue.map((it) => it.heatingTime));
    return uniqueTimes.size > 1;
  }, [queue]);

  // ค่า Fallback ในกรณีที่ไม่ได้ต่อกับตู้จริง (ประมวลผลจำลอง)
  const fallbackStatus = getProcessStatus(queue, globalTimeLeft, totalProcessTime, dispenseSchedule);

  // ตัดสินใจเลือกสถานะปัจจุบัน: ดึงจากเครื่องจริง (Socket) เป็นหลัก ถ้าไม่มีค่อยใช้แบบจำลอง
  const currentStep = agentJobState ? mapAgentStateToStep(agentJobState) : fallbackStatus.step;
  const currentItemIndex = agentJobState ? agentCurrentItemIndex : fallbackStatus.itemIndex;
  const isDispensingItem = agentJobState ? agentJobState === "DISPENSING" : fallbackStatus.isDispensingItem;

  // ตรวจสอบว่ากระบวนการทั้งหมดเสร็จสิ้นหรือยัง
  const isProcessCompleted = agentJobState
    ? agentJobState === "DONE" || agentJobState === "ERROR"
    : currentStep === 4;
  const isProcessSuccess = agentJobState ? agentJobState === "DONE" : currentStep >= 3;

  // เช็คว่าลูกแรกอุ่นเสร็จและเริ่มเปิดประตูตู้เพื่อเสิร์ฟหรือยัง
  const hasStartedServing =
    queue.length > 0 &&
    totalProcessTime - globalTimeLeft - STEP1_DELAY >= queue[0].heatingTime;

  const progressLineWidth =
    isMultiFlavor && currentStep === 1 && hasStartedServing
      ? "50%"
      : `${(currentStep / (PROCESS_STEPS.length - 1)) * 75}%`;

  // FUNCTIONS
  // - สั่งให้ระบบเริ่มทำงานจับเวลาและสร้างตารางงานอุ่น โดยไม่สลับหน้า modal (ใช้รันเบื้องหลังขณะผู้ใช้กรอกเบอร์โทร)
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

  // - ออกจากหน้าจอหลังจ่ายเงิน เพื่อกลับไปหน้าหลัก
  const exitPostPaymentLoyalty = useCallback(() => {
    setIsAfterPayment(false);
  }, [setIsAfterPayment]);

  // - เริ่มเข้าสู่หน้าจอการอุ่นอาหารอย่างเป็นทางการ
  const startHeatingProcess = useCallback(() => {
    if (!heatingTimelineStartedRef.current) {
      beginHeatingTimelineOnly(queue);
    }
    setActiveModal("processing");
    exitPostPaymentLoyalty();
  }, [queue, beginHeatingTimelineOnly, setActiveModal, exitPostPaymentLoyalty]);

  // - จัดการปิดโมดอลการอุ่นเมื่อเสร็จสมบูรณ์ -> รีเซ็ตและดึงข้อมูลสต็อกใหม่ทันที
  const handleProcessingCompleteClose = useCallback(() => {
    heatingTimelineStartedRef.current = false;
    setActiveModal("none");
    void fetchProducts({ silent: true });
  }, [setActiveModal, fetchProducts]);

  return {
    // States
    queue,
    setQueue,
    globalTimeLeft,
    setGlobalTimeLeft,
    isInitialStep1Delay,
    // Derived (ข้อมูลประมวลผล)
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
    // Ref (ใช้สำหรับเช็คสถานะอุ่น)
    heatingTimelineStartedRef,
  };
}
