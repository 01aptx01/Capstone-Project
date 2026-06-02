// lib/utils.ts
// ─── HELPER UTILITIES ────────────────────────────────────────────────────────
// ประกอบด้วยฟังก์ชันยูทิลิตี้พื้นฐานต่างๆ สำหรับงานประดิษฐ์สไตล์และการแสดงผลทั่วไป

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Name Merger)
 * ฟังก์ชันสำหรับรวม Tailwind ClassNames เข้าด้วยกัน โดยป้องกันปัญหาการเขียนคลาสซ้ำซ้อน 
 * และช่วยจัดลำดับความสำคัญของสไตล์ (เช่น การทับคลาสสี) ด้วย `tailwind-merge` ร่วมกับ `clsx`
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

