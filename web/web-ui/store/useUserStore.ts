// store/useUserStore.ts
// ─── ZUSTAND USER STORE ──────────────────────────────────────────────────────
// สโตร์สำหรับจัดการสถานะข้อมูลผู้ใช้ฝั่ง Client-side โดยใช้ไลบรารี Zustand
// ช่วยให้สามารถแชร์ข้อมูลและเรียกใช้ข้อมูลผู้ใช้ได้จากทุกคอมโพเนนต์โดยตรง

import { create } from "zustand"
import { User } from "@/types"

// กำหนดประเภทข้อมูลและฟังก์ชันใช้งานใน Store (Interface type for Zustand Store)
type UserStore = {
  user: User | null             // ข้อมูลผู้ใช้ในปัจจุบัน (เป็น null หากยังไม่ได้เข้าสู่ระบบ)
  setUser: (user: User) => void // ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
  clearUser: () => void        // ฟังก์ชันสำหรับล้างข้อมูลผู้ใช้เมื่อออกจากระบบ
}

// สร้าง Store ด้วย Zustand
export const useUserStore = create<UserStore>((set) => ({
  user: null, // ค่าเริ่มต้นคือยังไม่มีผู้ใช้เข้าสู่ระบบ
  
  // อัปเดตข้อมูลผู้ใช้ลงใน Store
  setUser: (user) => set({ user }),
  
  // รีเซ็ตข้อมูลผู้ใช้กลับเป็น null
  clearUser: () => set({ user: null }),
}))