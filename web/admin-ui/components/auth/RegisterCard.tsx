"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCardWrapper from "./AuthCardWrapper";
import { Suspense } from "react";

function RegisterCardContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read pre-authorized email from URL (passed by the invitation flow)
  const authorizedEmail = searchParams?.get("email") || "newhire@example.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(s => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    // Simulate registration — email is locked to the invited address
    setTimeout(() => {
      setLoading(false);
      router.push(`/verify-otp?phone=${encodeURIComponent(formData.phone)}`);
    }, 1000);
  };

  return (
    <AuthCardWrapper>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <Image src="/Logo_modpao.png" alt="logo" width={48} height={48} priority />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
        <p className="text-slate-500 text-[14px] mt-1 text-center">Complete your profile to access the MOD PAO Admin Dashboard</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-bold mb-6 flex items-center gap-2">
          <i className="fi fi-rr-exclamation"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-slate-500 mb-2">Authorized Email</label>
          <div className="relative">
            <input 
              type="email"
              readOnly
              value={authorizedEmail}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-500 cursor-not-allowed select-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">Locked</span>
          </div>
          <p className="text-[12px] text-slate-400 font-medium mt-1.5">This email was authorized by the First Admin and cannot be changed.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-500 mb-2">First Name</label>
            <input 
              type="text"
              name="firstName"
              required
              value={formData.firstName} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-500 mb-2">Last Name</label>
            <input 
              type="text"
              name="lastName"
              required
              value={formData.lastName} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-500 mb-2">Position</label>
            <input 
              type="text"
              name="position"
              required
              value={formData.position} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-500 mb-2">Phone Number</label>
            <input 
              type="text"
              name="phone"
              required
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-slate-500 mb-2">New Password</label>
          <input 
            type="password" 
            name="password"
            required
            value={formData.password} 
            onChange={handleChange} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-slate-500 mb-2">Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            required
            value={formData.confirmPassword} 
            onChange={handleChange} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-black rounded-xl shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 transition-all mt-6"
        >
          {loading ? "Creating Account..." : "Register & Continue"}
        </button>
      </form>
    </AuthCardWrapper>
  );
}

export default function RegisterCard() {
  return (
    <Suspense fallback={<div style={{ width: "100%", minHeight: "700px" }} className="rounded-3xl bg-white/80 animate-pulse" />}>
      <RegisterCardContent />
    </Suspense>
  );
}
