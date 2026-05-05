"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function LogoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear any local storage or cookies here
    // localStorage.removeItem("token");
    
    const timer = setTimeout(() => {
      // In a real app, you might hit an API endpoint first
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Dark Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
      
      {/* Modal Content */}
      <div className="relative z-10 logout-content animate-in zoom-in-95 duration-300">
        <div className="loader-wrapper">
          <div className="premium-loader"></div>
          <div className="loader-icon"><i className="fi fi-rr-exit"></i></div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3">กำลังออกจากระบบ...</h2>
        <p className="text-slate-500 font-medium text-[15px]">ขอบคุณที่ใช้งานระบบ MOD PAO Vending Management</p>
      </div>

      <style jsx>{`
        .logout-content {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          max-width: 400px;
          width: 90%;
        }

        .loader-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
        }

        .premium-loader {
          width: 100%;
          height: 100%;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #f47b2a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loader-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #f47b2a;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}
