"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("reg_token");
    
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-screen items-center justify-center fixed inset-0 z-[9999]" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-inner" style={{ background: "var(--warn-bg)", color: "var(--primary)" }}>
           <i className="fi fi-rr-spinner animate-spin text-3xl"></i>
        </div>
        <div className="font-black tracking-widest uppercase text-sm" style={{ color: "var(--text-muted)" }}>Logging Out</div>
      </div>
    </div>
  );
}
