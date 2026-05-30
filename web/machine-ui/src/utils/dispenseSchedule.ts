import type { Product, AgentJobState } from "../types";
import {
  STEP1_DELAY,
  DISPENSE_WINDOW,
  STEP4_HOLD,
  FINAL_STEP_HOLD,
  SECONDS_PER_HEATING_TIME_TYPE,
} from "../constants";

// ==========================================
// Types
// ==========================================
export interface DispenseWindow {
  itemIndex: number;
  startTime: number;
  endTime: number;
}

export interface ProcessStatus {
  step: number;
  itemIndex: number;
  isDispensingItem: boolean;
}

// ==========================================
// Schedule Builder
// ==========================================

/**
 * Build a schedule array: for each item in the sorted queue,
 * assign a non-overlapping 2s dispense window.
 * Items are sorted by heatingTime ascending.
 * If two items finish at the same time, their windows are queued sequentially.
 */
export function buildDispenseSchedule(q: Product[]): DispenseWindow[] {
  const schedule: DispenseWindow[] = [];
  let nextAvailable = 0;
  for (let i = 0; i < q.length; i++) {
    const finishTime = q[i].heatingTime;
    const windowStart = Math.max(finishTime, nextAvailable);
    const windowEnd = windowStart + DISPENSE_WINDOW;
    schedule.push({ itemIndex: i, startTime: windowStart, endTime: windowEnd });
    nextAvailable = windowEnd;
  }
  return schedule;
}

/**
 * Total process time = Step1 delay + all dispense windows + Step4 hold + Final Step hold
 */
export function calculateTotalProcessTime(q: Product[]): number {
  if (q.length === 0) return 0;
  const schedule = buildDispenseSchedule(q);
  const lastWindowEnd = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;
  return STEP1_DELAY + lastWindowEnd + STEP4_HOLD + FINAL_STEP_HOLD;
}

/**
 * เวลารอประมาณในรถเข็น: เวลาอุ่นมากที่สุด + (3 × จำนวนประเภทเวลาอุ่น)
 * แยกจาก calculateTotalProcessTime ที่ใช้ timeline หลังชำระเงิน
 */
export function estimateApproxWaitSeconds(q: Product[]): number {
  if (q.length === 0) return 0;
  const times = q.map((p) => p.heatingTime);
  return Math.max(...times) + SECONDS_PER_HEATING_TIME_TYPE * new Set(times).size;
}

// ==========================================
// Process Status (Fallback UI)
// ==========================================

/** ฟังก์ชันหาว่าตอนนี้อยู่สเต็ปไหนของการอุ่น (Fallback UI) */
export function getProcessStatus(
  queue: Product[],
  globalTimeLeft: number,
  totalProcessTime: number,
  dispenseSchedule: DispenseWindow[],
): ProcessStatus {
  if (queue.length === 0) return { step: 0, itemIndex: 0, isDispensingItem: false };
  if (globalTimeLeft <= 0) return { step: 4, itemIndex: queue.length - 1, isDispensingItem: false };
  if (globalTimeLeft > totalProcessTime) return { step: 0, itemIndex: 0, isDispensingItem: false };

  const elapsedTime = totalProcessTime - globalTimeLeft;
  const N = queue.length;

  // Phase 1: Initial 2-second hold on Step 1 (กำลังนำเข้าเตาอุ่น)
  if (elapsedTime < STEP1_DELAY) {
    return { step: 0, itemIndex: 0, isDispensingItem: false };
  }

  const heatingElapsed = elapsedTime - STEP1_DELAY;
  const lastWindow = dispenseSchedule[N - 1];

  // Phase 4: Hold at Step 4 (พร้อมทาน) for FINAL_STEP_HOLD seconds
  if (heatingElapsed >= lastWindow.endTime + STEP4_HOLD) {
    return { step: 3, itemIndex: N - 1, isDispensingItem: false };
  }

  // Phase 3: All dispense windows done → hold Step 3 for STEP4_HOLD seconds
  if (heatingElapsed >= lastWindow.endTime) {
    return { step: 2, itemIndex: N - 1, isDispensingItem: true };
  }

  // Phase 2.b: Check the final item's window — transition to step 2 (Step 3)
  if (heatingElapsed >= lastWindow.startTime && heatingElapsed < lastWindow.endTime) {
    return { step: 2, itemIndex: N - 1, isDispensingItem: true };
  }

  // Phase 2.a: Heating — find if any non-final item is in its scheduled window
  for (let i = 0; i < N - 1; i++) {
    const win = dispenseSchedule[i];
    if (heatingElapsed >= win.startTime && heatingElapsed < win.endTime) {
      return { step: 1, itemIndex: i, isDispensingItem: true };
    }
  }

  // Between windows or before first window: heating, no label
  return { step: 1, itemIndex: 0, isDispensingItem: false };
}

/** Map agent state string to step index */
export function mapAgentStateToStep(state: AgentJobState): number {
  if (state === "TRANSFER_TO_OVEN") return 0;
  if (state === "HEATING") return 1;
  if (state === "DISPENSING") return 2;
  return 3; // DONE / ERROR
}
