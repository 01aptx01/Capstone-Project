import type { Metadata } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";
import Script from "next/script";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto",
});

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "MOD PAO - ระบบสมาชิกและสะสมคะแนน",
  description: "เช็กคะแนน แลกรับคูปอง และดูเมนูสินค้าตู้น้ำอัจฉริยะมดเปา",
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
        <Script src="https://cdn.omise.co/omise.js" strategy="afterInteractive" />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
