"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterCard() {
  const [formData, setFormData] = useState({
    email: "",
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
    // Simulate auth check for pre-authorized email
    setTimeout(() => {
      setLoading(false);
      // Mock logic: Only allow if email contains 'invite' or 'newhire'
      if (!formData.email.includes("invite") && !formData.email.includes("newhire") && !formData.email.includes("register")) {
        setError("This email address has not been authorized by the First Admin.");
      } else {
        router.push("/");
      }
    }, 1000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-10 w-[500px] max-w-[95vw] animate-in zoom-in-95 duration-500 mx-auto">
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
          <input 
            type="email"
            name="email"
            required
            value={formData.email} 
            onChange={handleChange} 
            placeholder="e.g. newhire@example.com"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#f47b2a] outline-none transition-all text-[14px] font-medium" 
          />
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
    </div>
  );
}
