"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DrawerMenu } from "@/components/layout/DrawerMenu";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { DevNetworkGuard } from "@/components/layout/DevNetworkGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() || "";

  const getActiveMenu = () => {
    if (pathname.includes("/redeem")) return "redeem";
    if (pathname.includes("/history")) return "history";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  };

  const compactMainChrome =
    pathname.startsWith("/checkout") || pathname.startsWith("/payment");

  return (
    <CartProvider>
      <div className="flex flex-col w-full min-h-screen bg-background">
        <DevNetworkGuard />
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        <MobileHeader
          onMenuOpen={() => setDrawerOpen(!drawerOpen)}
          isOpen={drawerOpen}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <div className="hidden md:block">
            <DesktopSidebar active={getActiveMenu()} />
          </div>

          <main
            className={`flex-1 flex flex-col min-w-0 h-full overflow-y-auto ${
              compactMainChrome ? "pb-6 md:pb-10" : "main-with-mobile-chrome"
            }`}
          >
            {children}
          </main>
        </div>

        <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <MobileBottomNav />
        <FloatingCart />
      </div>
    </CartProvider>
  );
}
