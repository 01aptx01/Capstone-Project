"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ฟังก์ชันเซ็ต cookie โดยตรง (ไม่ต้อง import เพื่อลดความซับซ้อน)
function saveToken(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && phoneNumber) {
      setStep(2);
    } else if (step === 2 && otp.length === 6) {
      // ✅ เซ็ต cookie ก่อน redirect — proxy.ts จะอ่านได้
      saveToken("mock-token");
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF3E8] to-white flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 transition-all">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-inner">
            <span className="text-4xl">🥟</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#FF8A33] tracking-tight">MOD PAO</h1>
          <p className="text-gray-500 mt-2 text-center">เข้าสู่ระบบเพื่อเริ่มจองซาลาเปาร้อนๆ</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleAction}>

          {step === 1 && (
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08x-xxxxxxx"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-[#FF8A33] transition-all text-lg placeholder:text-gray-300"
                required
              />
              <p className="text-xs text-gray-400 mt-2.5 ml-1">ระบบจะส่งรหัส OTP ไปยังเบอร์นี้ทาง SMS</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="otp" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                รหัส OTP (6 หลัก)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  🔑
                </div>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="xxxxxx"
                  maxLength={6}
                  className="w-full px-5 py-4 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-[#FF8A33] transition-all text-lg tracking-[0.5em] font-mono placeholder:text-gray-300 placeholder:tracking-normal"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[#FF8A33] hover:text-orange-600 font-medium mt-3 ml-1 transition-colors"
              >
                ← เปลี่ยนเบอร์โทรศัพท์
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#FF8A33] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            {step === 1 ? "ขอรับรหัส OTP" : "ยืนยันตัวตน"}
            <span className="text-xl">→</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            ยังไม่มีบัญชี?{" "}
            <a href="#" className="font-bold text-[#FF8A33] hover:text-orange-600 transition-colors">
              สมัครสมาชิกใหม่
            </a>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">© 2024 MOD PAO. All rights reserved.</p>
    </div>
  );
}