"use client";

// components/layout/ServiceWorkerRegister.tsx
// ─── SERVICE WORKER REGISTER COMPONENT ────────────────────────────────────────
// คอมโพเนนต์นี้ทำหน้าที่ลงทะเบียน Service Worker ฝั่ง Client-side
// โดยต้องใช้คำสั่ง "use client" เนื่องจากอ้างอิงออบเจกต์ window และ navigator ของเบราว์เซอร์

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // ตรวจสอบว่าเบราว์เซอร์รองรับ Service Worker หรือไม่
    if ("serviceWorker" in navigator) {
      // รอให้หน้าต่างโหลดเสร็จสมบูรณ์ก่อนทำการลงทะเบียน เพื่อไม่ให้รบกวนการโหลดหน้าเว็บหลัก
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "[Service Worker] Registration successful with scope: ",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("[Service Worker] Registration failed: ", error);
          });
      };

      // ลงทะเบียน Service Worker
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  // คอมโพเนนต์นี้ไม่ต้องเรนเดอร์ UI ใดๆ ออกมาบนหน้าจอ จึงส่งคืนค่าเป็น null
  return null;
}
