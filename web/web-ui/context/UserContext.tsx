"use client";

// context/UserContext.tsx
// ─── USER CONTEXT & PROVIDER ────────────────────────────────────────────────
// ระบบจัดการสถานะของผู้ใช้ที่ล็อกอิน (Authentication & Session)
// คอยจัดการดึงข้อมูลโปรไฟล์สะสมคะแนน และแบ่งปันข้อมูลให้กับคอมโพเนนต์ต่างๆ ทั่วทั้งแอปพลิเคชัน

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  startTransition,
} from "react";
import { getMember, type MemberProfile } from "@/lib/api/members";
import {
  getPhoneFromCookie,
  saveSession,
  clearSession,
} from "@/lib/auth/session";

// 1. กำหนดโครงสร้าง Interface ของข้อมูลที่จะแชร์ผ่าน Context
interface UserContextType {
  phone: string | null;               // หมายเลขโทรศัพท์ของผู้ใช้ปัจจุบัน (null หากไม่ได้เข้าสู่ระบบ)
  profile: MemberProfile | null;       // ข้อมูลโปรไฟล์ของสมาชิก (คะแนน, ชื่อ, ฯลฯ จากฐานข้อมูล)
  isLoading: boolean;                 // สถานะการโหลดข้อมูลสมาชิกจาก API
  displayName: string;                // ชื่อที่ใช้แสดงผลบนหน้าต่าง (ค่าเริ่มต้น: "สมาชิก")
  setDisplayName: (name: string) => void; // ฟังก์ชันอัปเดตชื่อผู้ใช้บน Client-side
  loadMember: () => Promise<void>;    // ฟังก์ชันโหลดข้อมูลสมาชิกใหม่จาก API
  loginWithPhone: (phone: string, accessToken: string, displayName?: string) => void; // ฟังก์ชันเข้าระบบ
  logout: () => void;                 // ฟังก์ชันออกจากระบบ
}

// 2. สร้าง React Context ตัวใหม่ขึ้นมา
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3. คอมโพเนนต์ Provider สำหรับห่อหุ้มแอปพลิเคชัน
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [displayName, setDisplayName] = useState("สมาชิก");
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันโหลดข้อมูลโปรไฟล์ของสมาชิกจากเบอร์โทรศัพท์ที่บันทึกไว้ใน Cookie
  const loadMember = useCallback(async () => {
    const stored = getPhoneFromCookie();
    // หากไม่พบเบอร์โทรศัพท์ใน Cookie หมายความว่ายังไม่ได้เข้าสู่ระบบ
    if (!stored) {
      setPhone(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    // ตั้งสถานะการโหลดและบันทึกเบอร์โทรศัพท์ลง State
    setPhone(stored);
    setIsLoading(true);
    
    try {
      // เรียกขอข้อมูลสมาชิกจาก API ฝั่งเซิร์ฟเวอร์
      const data = await getMember(stored);
      setProfile(data.found ? data : null);
      // หากพบข้อมูลสมาชิกและมีชื่อแสดงผล ให้ตั้งค่า displayName
      if (data.found && data.display_name) {
        setDisplayName(data.display_name);
      }
    } catch (error) {
      console.error("Failed to load member profile:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // เรียกโหลดข้อมูลผู้ใช้อัตโนมัติเมื่อคอมโพเนนต์ถูกติดตั้งครั้งแรก (Mount)
  useEffect(() => {
    // ใช้ startTransition เพื่อลดลำดับความสำคัญในการเรนเดอร์ ส่งผลให้ UI ไม่หน่วงหรือกระตุกตอนเริ่มแอป
    startTransition(() => {
      void loadMember();
    });
  }, [loadMember]);

  // ฟังก์ชันเข้าสู่ระบบด้วยเบอร์โทรศัพท์และ JWT Token
  const loginWithPhone = (
    nextPhone: string,
    accessToken: string,
    name?: string,
  ) => {
    // บันทึกเบอร์โทรและ Token ลงในคุกกี้และ LocalStorage เพื่อรักษาสถานะล็อกอินหลังรีเฟรชหน้าจอ
    saveSession(nextPhone, accessToken);
    setPhone(nextPhone);
    if (name) setDisplayName(name);
    // รีโหลดข้อมูลสมาชิกล่าสุดจากเซิร์ฟเวอร์หลังล็อกอินเสร็จ
    void loadMember();
  };

  // ฟังก์ชันออกจากระบบ
  const logout = () => {
    // ล้างข้อมูลเซสชัน คุกกี้ และ Token
    clearSession();
    // รีเซ็ตสถานะทั้งหมดกลับเป็นค่าเริ่มต้น
    setPhone(null);
    setProfile(null);
    setDisplayName("สมาชิก");
  };

  // เรนเดอร์ Context Provider เพื่อส่งต่อตัวแปรและฟังก์ชันไปยังลูกๆ ทุกระดับ
  return (
    <UserContext.Provider
      value={{
        phone,
        profile,
        isLoading,
        displayName,
        setDisplayName,
        loadMember,
        loginWithPhone,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// 4. Custom Hook สำหรับนำข้อมูลผู้ใช้ไปใช้ในหน้าเพจต่าง ๆ ได้สะดวกรวดเร็ว
export function useUser() {
  const ctx = useContext(UserContext);
  // ป้องกันการเรียกใช้นอกขอบเขตของ UserProvider
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

