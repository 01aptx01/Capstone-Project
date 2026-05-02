"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any local storage or cookies here
    // localStorage.removeItem("token");
    
    const timer = setTimeout(() => {
      // In a real app, you might hit an API endpoint first
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="logout-page">
      <div className="logout-content animate-in">
        <div className="loader-wrapper">
          <div className="premium-loader"></div>
          <div className="loader-icon"><i className="fi fi-rr-exit"></i></div>
        </div>
        <h2>กำลังออกจากระบบ...</h2>
        <p>ขอบคุณที่ใช้งานระบบ MOD PAO Vending Management</p>
      </div>

      <style jsx>{`
        .logout-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-main);
        }

        .logout-content {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
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
          border-top: 4px solid var(--primary);
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
          color: var(--primary);
        }

        h2 {
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 12px;
        }

        p {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.6;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
