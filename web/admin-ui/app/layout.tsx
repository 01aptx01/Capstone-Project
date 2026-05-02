import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { UIProvider } from "@/lib/context/UIContext";
import GlobalModals from "@/components/layout/GlobalModals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin UI",
  description: "Administration dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css' />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <UIProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto bg-[var(--background)] p-6">{children}</main>
            </div>
          </div>
          <GlobalModals />
        </UIProvider>
      </body>
    </html>
  );
}
