"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    // Simulate auth check/loading state on route change
    setIsChecking(true);
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 400); // 400ms splash screen to prevent UI leaking
    return () => clearTimeout(timer);
  }, [pathname]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl mb-6 flex items-center justify-center text-[#f47b2a] shadow-inner">
             <i className="fi fi-rr-spinner animate-spin text-3xl"></i>
          </div>
          <div className="font-black text-slate-400 tracking-widest uppercase text-sm">Authenticating</div>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements for Auth Pages */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-[#f47b2a] opacity-10 blur-[100px]"></div>
          <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500 opacity-5 blur-[100px]"></div>
        </div>
        <div className="relative z-10 w-full flex justify-center py-10">
           {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen animate-in fade-in duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-[var(--background)] p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
