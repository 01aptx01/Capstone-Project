// app/layout.tsx
// ─── ROOT LAYOUT ─────────────────────────────────────────────────────────────
// หน้าเลย์เอาต์หลักของแอปพลิเคชัน ทำหน้าที่กำหนดโครงสร้าง HTML พื้นฐาน 
// รวมถึงการตั้งค่าฟอนต์ ภาษา และการหุ้ม Context Provider ต่างๆ ให้มีผลทั่วทั้งระบบ

import type { Metadata } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";
import Script from "next/script";
import { UserProvider } from "@/context/UserContext";
import ServiceWorkerRegister from "@/components/layout/ServiceWorkerRegister"; // คอมโพเนนต์ลงทะเบียน Service Worker
import "./globals.css";

// ตั้งค่าฟอนต์ Noto Sans Thai สำหรับข้อความทั่วไปในระบบ
const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto",
});

// ตั้งค่าฟอนต์ Prompt สำหรับหัวข้อและปุ่มที่ต้องการความโดดเด่นสะดุดตา
const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});

// กำหนดข้อมูล Metadata ของหน้าเว็บ (SEO & Title bar)
export const metadata: Metadata = {
  title: "MOD PAO - ระบบสมาชิกและสะสมคะแนน",
  description: "เช็กคะแนน แลกรับคูปอง และดูเมนูสินค้าตู้น้ำอัจฉริยะมดเปา",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MOD PAO",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${prompt.variable} ${notoSansThai.className}`}
    >
      <body className="min-h-screen antialiased flex flex-col bg-background text-foreground font-sans">
        {/* ดึงไลบรารี Omise.js สำหรับจัดการการชำระเงินทางอิเล็กทรอนิกส์ */}
        <Script src="https://cdn.omise.co/omise.js" strategy="afterInteractive" />
        
        {/* ลงทะเบียน Service Worker เพื่อการทำงานแบบออฟไลน์ */}
        <ServiceWorkerRegister />
        
        {/* ห่อหุ้มระบบด้วย UserProvider เพื่อส่งต่อสถานะการล็อกอินและคะแนนของสมาชิกไปยังหน้ารายการต่างๆ */}
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}

