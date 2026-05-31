"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import AuthCardWrapper from "./AuthCardWrapper";
import { adminLogin } from "@/lib/auth";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      router.replace("/");
    } catch (err) {
      const msg = isAxiosError(err)
        ? String((err.response?.data as { error?: string })?.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardWrapper>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[var(--surface-1)] rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <Image src="/Logo_modpao.png" alt="logo" width={48} height={48} priority />
        </div>
        <h1 className="text-2xl font-black text-[var(--text)]">Welcome Back</h1>
        <p className="text-[var(--text)]0 text-sm mt-1">Sign in to MOD PAO Admin</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-bold mb-5 flex items-center gap-2 animate-in slide-in-from-top-2">
          <i className="fi fi-rr-exclamation"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-bold text-[var(--text)]0 mb-2">Email address</label>
          <input 
            type="email"
            required
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl focus:bg-[var(--surface-1)] focus:border-[var(--primary)] outline-none transition-all text-[15px] font-medium" 
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[var(--text)]0 mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl focus:bg-[var(--surface-1)] focus:border-[var(--primary)] outline-none transition-all text-[15px] font-medium" 
          />
    
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] font-black rounded-xl shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 transition-all mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCardWrapper>
  );
}
