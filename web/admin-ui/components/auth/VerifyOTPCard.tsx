"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCardWrapper from "./AuthCardWrapper";

function VerifyOTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams?.get("phone") || "your phone number";
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      if (code === "123456") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError("Invalid code, please try again.");
      }
    }, 1000);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    setError(null);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <AuthCardWrapper>
      {success && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-lg shadow-emerald-500/20">
            <i className="fi fi-rr-check text-4xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Verified!</h2>
          <p className="text-slate-500 font-medium">Redirecting to dashboard...</p>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
          <Image src="/Logo_modpao.png" alt="logo" width={48} height={48} priority />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">OTP Verification</h1>
        <p className="text-slate-500 text-[14px] text-center px-4">
          We've sent a 6-digit code to<br/>
          <span className="font-bold text-slate-700">{phone}</span>
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-bold mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
          <i className="fi fi-rr-exclamation"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all focus:ring-4 focus:ring-orange-500/10"
              maxLength={1}
              autoComplete="off"
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={loading || otp.join("").length < 6}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-black rounded-xl shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[14px] font-medium text-slate-500">
          Didn't receive the code?{" "}
          {timer > 0 ? (
            <span className="text-slate-400">Resend in <span className="font-bold text-slate-600">{timer}s</span></span>
          ) : (
            <button 
              onClick={handleResend}
              className="font-bold text-[#f47b2a] hover:text-[#d35e11] transition-colors"
            >
              Resend Code
            </button>
          )}
        </p>
      </div>
    </AuthCardWrapper>
  );
}

export default function VerifyOTPCard() {
  return (
    <Suspense fallback={<div className="animate-pulse w-[440px] h-[400px] bg-white/50 rounded-3xl mx-auto"></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
