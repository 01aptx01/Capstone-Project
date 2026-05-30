"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DrawerMenu } from "@/components/layout/DrawerMenu";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { DevNetworkGuard } from "@/components/layout/DevNetworkGuard";
import { matchNavKey } from "@/lib/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() || "";
  const activeNav = matchNavKey(pathname);

  const compactMainChrome =
    pathname.startsWith("/checkout") || pathname.startsWith("/payment");

  return (
    <CartProvider>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DevNetworkGuard />

        <MobileHeader
          onMenuOpen={() => setDrawerOpen(!drawerOpen)}
          isOpen={drawerOpen}
        />

        <DesktopSidebar active={activeNav} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-screen">
          <Suspense
            fallback={
              <div
                className="hidden md:block border-b border-border bg-surface/95"
                style={{ height: "var(--topbar-height)" }}
              />
            }
          >
            <DesktopHeader />
          </Suspense>

          <main
            className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${
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
