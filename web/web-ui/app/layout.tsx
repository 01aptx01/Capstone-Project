import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css"; // นำเข้า CSS หลักตรงนี้ (ใช้ ./ เพราะอยู่โฟลเดอร์เดียวกัน)

// ตั้งค่าฟอนต์ Noto Sans Thai (รองรับทั้งภาษาไทยและอังกฤษ)
const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOD PAO - สั่งซื้อซาลาเปาล่วงหน้า",
  description: "จองซาลาเปาร้อนๆ จากตู้มดเปาใกล้บ้านคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // นำ className ของฟอนต์มาใส่ที่แท็ก html เพื่อให้ใช้งานได้ทั้งเว็บ
    <html lang="th" className={notoSansThai.className}>
      <body className="min-h-screen antialiased flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}