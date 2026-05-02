// app/(auth)/login/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ฟังก์ชันเซ็ต cookie อย่างง่าย
function saveToken(token: string) {
  // กำหนดอายุ 7 วัน (604800 วินาที)
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // 🚨 State สำหรับหน้าโปรไฟล์ผู้ใช้ใหม่
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  
  const otpRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ];

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && phoneNumber) {
      setStep(2);
    } else if (step === 2) {
      const otpString = otp.join("");
      if (otpString.length === 6) {
        
        // 🚨 [จำลองเงื่อนไข] ถ้าเบอร์ลงท้ายด้วย 9 ถือว่าเป็นผู้ใช้เก่า -> เข้า Home ทันที
        if (phoneNumber.endsWith("9")) {
          saveToken("mock-token-existing-user");
          router.push("/home");
        } else {
          // นอกนั้นถือว่าเป็นผู้ใช้ใหม่ -> ไปหน้าสร้างโปรไฟล์ (Step 3)
          setStep(3);
        }
      }
    } else if (step === 3 && displayName) {
      // 🚨 บันทึกโปรไฟล์ (จำลอง) แล้วเข้า Home
      saveToken("mock-token-new-user");
      // ในอนาคตคุณสามารถส่ง displayName และ profileImage ไปเซฟที่ Backend ได้ตรงนี้
      router.push("/home");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // 🚨 ฟังก์ชันจัดการอัปโหลดรูปภาพจำลอง
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans">
      
      {/* Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-[45vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/BG.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-end md:justify-center pt-[30vh] z-10 w-full max-w-lg mx-auto">
        
        <div className="w-full bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl pt-24 px-6 pb-8 md:pb-12 relative flex flex-col min-h-[60vh] md:min-h-0">
          
          {/* โลโก้ */}
          <div className="absolute -top-[65px] left-1/2 -translate-x-1/2 w-[130px] h-[130px] bg-white rounded-full p-2 shadow-sm border-[4px] border-[#F2F2F2]">
             <div className="w-full h-full bg-[#FF8A33] rounded-full flex items-center justify-center p-1 overflow-hidden">
                <img src="/MODPAO.svg" alt="MOD PAO Logo" className="w-full h-full object-contain" />
             </div>
          </div>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-extrabold text-[#2F4858] tracking-widest uppercase">MOD PAO</h1>
          </div>

          <form className="flex-1 flex flex-col" onSubmit={handleAction}>
            
            {/* STEP 1: เบอร์โทร */}
            {step === 1 && (
              <div className="flex flex-col flex-1 animate-fade-in">
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
                  <button type="submit" className="w-full bg-[#FF8A33] text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all">
                    ขอรหัส OTP
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="mb-8 text-center">
                  <p className="font-bold text-[#5C6D8A] mb-1">กรอกรหัส OTP 6 หลัก</p>
                  <p className="text-xs text-gray-400 mb-6">รหัสถูกส่งไปยังเบอร์ {phoneNumber}</p>
                  <div className="flex justify-center gap-2 md:gap-3 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index} ref={otpRefs[index]} type="text" inputMode="numeric" maxLength={1}
                        value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-gray-800 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF8A33] shadow-sm transition-colors"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-[#FF8A33] hover:text-orange-500 transition-colors">
                    เปลี่ยนเบอร์โทรศัพท์
                  </button>
                </div>
                <div className="mt-auto md:mt-4 flex flex-col gap-4 items-center">
                  <button type="submit" disabled={otp.join("").length !== 6} className="w-full bg-[#FF8A33] disabled:bg-gray-300 disabled:shadow-none text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all">
                    ยืนยันเข้าสู่ระบบ
                  </button>
                  <button type="button" className="text-sm font-bold text-[#A0AABF] hover:text-gray-600 underline underline-offset-4 decoration-2 decoration-gray-300">
                    ส่งรหัสใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            )}

            {/* 🚨 STEP 3: สร้างโปรไฟล์ (แสดงเมื่อเป็นผู้ใช้ใหม่) */}
            {step === 3 && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="mb-8 flex flex-col items-center">
                  <p className="font-bold text-[#2F4858] text-lg mb-1">ยินดีต้อนรับผู้ใช้ใหม่ 🎉</p>
                  <p className="text-xs text-gray-400 mb-6">ตั้งค่าโปรไฟล์ของคุณเพื่อเริ่มใช้งาน</p>
                  
                  {/* ปุ่มอัปโหลดรูปโปรไฟล์ */}
                  <div className="relative w-28 h-28 mb-6">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="text-gray-400 w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-xs font-bold">เปลี่ยนรูป</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label htmlFor="name" className="block text-sm font-bold text-[#5C6D8A] mb-2 text-center md:text-left">
                      ชื่อแสดงผล (Display Name)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="ใส่ชื่อของคุณ"
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#FF8A33] transition-colors text-center text-lg font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-auto md:mt-4">
                  <button type="submit" disabled={!displayName} className="w-full bg-[#FF8A33] disabled:bg-gray-300 disabled:shadow-none text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all">
                    เริ่มต้นใช้งานเลย
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