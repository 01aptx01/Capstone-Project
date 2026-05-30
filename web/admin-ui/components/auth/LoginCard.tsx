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

  const handleGoogleLogin = () => {
    setError("ยังไม่รองรับการเข้าสู่ระบบด้วย Google");
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
          <div className="flex justify-end mt-2">
            <a href="#" className="text-[12px] font-bold text-[var(--primary)] hover:underline">Forgot password?</a>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] font-black rounded-xl shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 transition-all mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--border)]"></div>
        <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase">Or log in with</div>
        <div className="flex-1 h-px bg-[var(--border)]"></div>
      </div>

      <button 
        type="button" 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] font-bold py-3.5 px-4 rounded-xl hover:bg-[var(--surface-2)] transition-all shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
          <path fill="var(--warn)" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="var(--primary)" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="var(--success)" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="var(--chart-series-1)" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Continue with Google
      </button>
    </AuthCardWrapper>
  );
}
