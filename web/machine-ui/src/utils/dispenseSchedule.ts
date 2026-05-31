import type { Product, AgentJobState } from "../types";
import {
  STEP1_DELAY,
  DISPENSE_WINDOW,
  STEP4_HOLD,
  FINAL_STEP_HOLD,
  SECONDS_PER_HEATING_TIME_TYPE,
} from "../constants";

// Types
export interface DispenseWindow {
  itemIndex: number; // ลำดับดัชนีของสินค้าในคิว (เริ่มที่ 0)
  startTime: number; // วินาทีเริ่มทำความร้อนจนเสร็จพร้อมจ่ายของ
  endTime: number; // วินาทีเสร็จสิ้นการลำเลียงออกทางช่องรับสินค้า
}

export interface ProcessStatus {
  step: number; // ขั้นตอนปัจจุบันในการอุ่น (สอดคล้องกับแถบความคืบหน้า 0 - 4)
  itemIndex: number; // ดัชนีสินค้าชิ้นที่กำลังดำเนินการอยู่ ณ ขณะนี้
  isDispensingItem: boolean; // สถานะบ่งบอกว่ากำลังเปิดช่องเสิร์ฟรับของอยู่หรือไม่
}

// Schedule Builder
/**
 * buildDispenseSchedule - สร้างตารางเวลาการจ่ายสินค้า (Dispense Schedule)
 * ระบบจะคำนวณไทม์ไลน์โดยเรียงสินค้าตามเวลาอุ่นจากน้อยไปหามาก (Heating Time Ascending)
 * และจัดการต่อคิวจ่ายสินค้าตัวถัดไปเมื่อเครื่องอุ่นร้อนเสร็จ โดยแต่ละชิ้นจะได้สิทธิ์เปิดหน้าตู้เสิร์ฟชิ้นละ 2 วินาที (DISPENSE_WINDOW)
 * หลีกเลี่ยงหน้าต่างทับซ้อนกัน (Non-overlapping windows)
 */
export function buildDispenseSchedule(q: Product[]): DispenseWindow[] {
  const schedule: DispenseWindow[] = [];
  let nextAvailable = 0; // วินาทีเร็วที่สุดที่จะเริ่มสล็อตจ่ายของรอบถัดไปได้
  
  for (let i = 0; i < q.length; i++) {
    const finishTime = q[i].heatingTime; // เวลาอุ่นของสินค้าชิ้นปัจจุบัน
    
    const windowStart = Math.max(finishTime, nextAvailable);
    const windowEnd = windowStart + DISPENSE_WINDOW; 
    
    schedule.push({ itemIndex: i, startTime: windowStart, endTime: windowEnd });
    nextAvailable = windowEnd; 
  }
  return schedule;
}

// calculateTotalProcessTime
// - คำนวณเวลาที่ใช้ทั้งหมดในขั้นตอนกระบวนการจ่ายของจริง (วินาที)
// - สูตร: เวลาหน่วงเปิดระบบแรกเริ่ม + เวลาสิ้นสุดการจ่ายชิ้นสุดท้าย + เวลาหยุดค้างขั้นตอนชิ้นสุดท้าย + เวลาหยุดค้างหน้าจอขอบคุณ
export function calculateTotalProcessTime(q: Product[]): number {
  if (q.length === 0) return 0;
  const schedule = buildDispenseSchedule(q);
  const lastWindowEnd = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;
  return STEP1_DELAY + lastWindowEnd + STEP4_HOLD + FINAL_STEP_HOLD;
}

// estimateApproxWaitSeconds
// - สูตรประเมินระยะเวลาที่ลูกค้าต้องรอการอุ่น (วินาที) เพื่อเอาไปโชว์ในตะกร้า
// - สูตร: เวลาอุ่นที่นานที่สุดของสินค้าในคิว + (จำนวนรสชาติ/เวลาอุ่นที่ต่างกัน × 3 วินาที)
// - หมายเหตุ: แยกออกจาก calculateTotalProcessTime เพราะเป็นการกะเวลาเบื้องต้นช่วงลูกค้ายืนเลือกซื้อของ
export function estimateApproxWaitSeconds(q: Product[]): number {
  if (q.length === 0) return 0;
  const times = q.map((p) => p.heatingTime);
  // หาระยะเวลาอุ่นที่ยาวที่สุด + (บวกเวลาสลับถาดอุ่น/รสชาติ ละ 3 วินาที)
  return Math.max(...times) + SECONDS_PER_HEATING_TIME_TYPE * new Set(times).size;
}

// Process Status (ตัวจำลองคำนวณสเตปอุ่นหน้าเว็บ / Fallback UI)
//  getProcessStatus
//  - หาว่า ณ วินาทีคงเหลือปัจจุบัน (globalTimeLeft) ระบบกำลังอยู่ในขั้นตอนที่เท่าไหร่
//  - (ใช้สำหรับจำลองหน้าจออุ่นเมื่อไม่ได้ต่อสัญญาณบอร์ด หรือตู้ยังไม่ส่ง socket)
export function getProcessStatus(
  queue: Product[],
  globalTimeLeft: number,
  totalProcessTime: number,
  dispenseSchedule: DispenseWindow[],
): ProcessStatus {
  if (queue.length === 0) return { step: 0, itemIndex: 0, isDispensingItem: false };
  // กรณีหมดเวลาแล้ว -> อยู่ขั้นตอนสุดท้าย (เสร็จสมบูรณ์พร้อมทาน)
  if (globalTimeLeft <= 0) return { step: 4, itemIndex: queue.length - 1, isDispensingItem: false };
  // กรณีเวลาปัจจุบันเกินยอดรวม -> สเตปเริ่มแรกสุด
  if (globalTimeLeft > totalProcessTime) return { step: 0, itemIndex: 0, isDispensingItem: false };

  const elapsedTime = totalProcessTime - globalTimeLeft; // เวลาที่ผ่านพ้นไปแล้วจริงนับตั้งแต่กดเริ่มอุ่น
  const N = queue.length;

  // ช่วงเริ่มต้น (Phase 1): หน่วงเวลาหน้าระบบเตรียมเตา (2 วินาทีแรก) -> จัดอยู่อุ่นสเตป 0
  if (elapsedTime < STEP1_DELAY) {
    return { step: 0, itemIndex: 0, isDispensingItem: false };
  }

  const heatingElapsed = elapsedTime - STEP1_DELAY;
  const lastWindow = dispenseSchedule[N - 1];

  // ช่วงสรุปท้าย (Phase 4): เมื่อจ่ายของชิ้นสุดท้ายเสร็จแล้ว และตู้กำลังเตรียมพร้อมหน้านำออก -> สเตป 3
  if (heatingElapsed >= lastWindow.endTime + STEP4_HOLD) {
    return { step: 3, itemIndex: N - 1, isDispensingItem: false };
  }

  // ช่วงเสิร์ฟท้าย (Phase 3): ระหว่างตู้เปิดช่องเสิร์ฟตัวสุดท้ายค้างไว้ -> สเตป 2 และกำลังเปิดช่อง
  if (heatingElapsed >= lastWindow.endTime) {
    return { step: 2, itemIndex: N - 1, isDispensingItem: true };
  }

  // ช่วงจับคิวเสิร์ฟชิ้นสุดท้าย (Phase 2.b)
  if (heatingElapsed >= lastWindow.startTime && heatingElapsed < lastWindow.endTime) {
    return { step: 2, itemIndex: N - 1, isDispensingItem: true };
  }

  // ช่วงทำความร้อนและสล็อตจ่ายของระหว่างกลาง (Phase 2.a): ตรวจสอบว่าสินค้าตัวก่อนหน้ากำลังจ่ายของช่องลิฟต์อยู่หรือไม่
  for (let i = 0; i < N - 1; i++) {
    const win = dispenseSchedule[i];
    if (heatingElapsed >= win.startTime && heatingElapsed < win.endTime) {
      return { step: 1, itemIndex: i, isDispensingItem: true };
    }
  }

  // กรณีทั่วไป: ไมโครเวฟกำลังหมุนทำงานอุ่นร้อน -> จัดอยู่สเตป 1 (ไม่มีหน้าต่างจ่าย)
  return { step: 1, itemIndex: 0, isDispensingItem: false };
}

// mapAgentStateToStep
// - แปลงค่าข้อความ String สถานะจากบอร์ดตู้จริง ไปเป็นหมายเลขสเตปแถบโหลด (0 - 3)
export function mapAgentStateToStep(state: AgentJobState): number {
  if (state === "TRANSFER_TO_OVEN") return 0; // ย้ายเข้าเตา -> สเตป 0
  if (state === "HEATING") return 1;          // เตาทำงาน -> สเตป 1
  if (state === "DISPENSING") return 2;       // เปิดช่องรับสินค้า -> สเตป 2
  return 3; // DONE หรือ ERROR -> สเตป 3 (พร้อมทาน / ระบบขัดข้อง)
}