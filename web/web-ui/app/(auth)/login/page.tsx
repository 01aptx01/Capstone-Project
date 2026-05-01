// app/(auth)/login/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ฟังก์ชันเซ็ต cookie โดยตรง
function saveToken(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  // เปลี่ยน OTP ให้เป็น Array สำหรับ 6 ช่อง
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && phoneNumber) {
      setStep(2);
    } else if (step === 2) {
      const otpString = otp.join("");
      if (otpString.length === 6) {
        saveToken("mock-token");
        router.push("/home");
      }
    }
  };

  // จัดการการพิมพ์ในช่อง OTP แต่ละช่อง
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // รับแค่ทีละตัวอักษร
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // เลื่อนโฟกัสไปช่องถัดไปถ้าพิมพ์เสร็จ
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // จัดการปุ่ม Backspace ในช่อง OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    // คอนเทนเนอร์หลัก 
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans">
      
      {/* 1. Background Image (ครึ่งบน) */}
      {/* 💡 เปลี่ยน /bg-login.jpg เป็นชื่อไฟล์รูปของคุณในโฟลเดอร์ public */}
      <div 
        className="absolute top-0 left-0 w-full h-[45vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/BG.png')" }}
      >
        <div className="absolute inset-0 bg-black/20"></div> {/* Overlay มืดลงนิดนึงให้ภาพสวย */}
      </div>

      {/* 2. ส่วนเนื้อหา */}
      <div className="relative flex-1 flex flex-col items-center justify-end md:justify-center pt-[30vh] z-10 w-full max-w-lg mx-auto">
        
        {/* กล่องสีขาว */}
        <div className="w-full bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl pt-16 px-6 pb-8 md:pb-12 relative flex flex-col min-h-[60vh] md:min-h-0">
          
          {/* 3. โลโก้ลอยทับขอบ */}
          <div className="absolute -top-[45px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] bg-white rounded-full p-2 shadow-sm border-[4px] border-[#F2F2F2]">
             {/* 💡 รูปโลโก้ SVG ของคุณ */}
             <div className="w-full h-full bg-[#FF8A33] rounded-full flex items-center justify-center p-1 overflow-hidden">
                <img src="/MODPAO.svg" alt="MOD PAO Logo" className="w-full h-full object-contain" />
             </div>
          </div>

          {/* ชื่อแอป */}
          <div className="text-center mb-8 mt-2">
            <h1 className="text-3xl font-extrabold text-[#2F4858] tracking-widest uppercase">MOD PAO</h1>
          </div>

          {/* ฟอร์ม */}
          <form className="flex-1 flex flex-col" onSubmit={handleAction}>
            
            {/* STEP 1: กรอกเบอร์โทร */}
            {step === 1 && (
              <div className="flex flex-col flex-1">
                <div className="mb-8">
                  <label htmlFor="phone" className="block text-sm font-bold text-[#5C6D8A] mb-2 text-center md:text-left">
                    เบอร์โทรศัพท์ (Phone Number)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#FF8A33] transition-colors text-center text-lg font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium shadow-sm"
                    required
                  />
                </div>

                <div className="mt-auto md:mt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#FF8A33] text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all"
                  >
                    ขอรหัส OTP
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: กรอก OTP */}
            {step === 2 && (
              <div className="flex flex-col flex-1">
                <div className="mb-8 text-center">
                  <p className="font-bold text-[#5C6D8A] mb-1">กรอกรหัส OTP 6 หลัก</p>
                  <p className="text-xs text-gray-400 mb-6">รหัสถูกส่งไปยังเบอร์ {phoneNumber}</p>
                  
                  {/* กล่อง OTP 6 ช่อง */}
                  <div className="flex justify-center gap-2 md:gap-3 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-gray-800 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF8A33] shadow-sm transition-colors"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-[#FF8A33] hover:text-orange-500 transition-colors"
                  >
                    เปลี่ยนเบอร์โทรศัพท์
                  </button>
                </div>

                <div className="mt-auto md:mt-4 flex flex-col gap-4 items-center">
                  <button
                    type="submit"
                    disabled={otp.join("").length !== 6}
                    className="w-full bg-[#FF8A33] disabled:bg-gray-300 disabled:shadow-none text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all"
                  >
                    ยืนยันเข้าสู่ระบบ
                  </button>
                  <button type="button" className="text-sm font-bold text-[#A0AABF] hover:text-gray-600 underline underline-offset-4 decoration-2 decoration-gray-300">
                    ส่งรหัสใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            )}
            
          </form>

          {/* Footer */}
          <div className="mt-12 md:mt-8 pt-6 border-t border-gray-100 text-center">
            <a href="#" className="text-xs font-bold text-[#A0AABF] hover:text-gray-600 transition-colors">
              Term of use
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}