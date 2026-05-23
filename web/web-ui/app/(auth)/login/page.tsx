"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/lib/auth/otp";
import { getMember, registerMember } from "@/lib/api/members";
import { useUser } from "@/context/UserContext";
import { saveSession } from "@/lib/auth/session";

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const RESEND_COOLDOWN_SEC = 60;

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone } = useUser();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const requestOtp = useCallback(async (phone: string) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await sendOtp(phone);
      setResendSeconds(RESEND_COOLDOWN_SEC);
      if (res.delivery === "console") {
        setFormError(
          "โหมดทดสอบ: ดูรหัส OTP ใน log ของ server (ยังไม่ได้ตั้งค่า Twilio)",
        );
      }
      setStep(2);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (step === 1) {
      const phone = normalizePhone(phoneNumber);
      if (phone.length !== 10) {
        setFormError("กรุณากรอกเบอร์โทร 10 หลัก");
        return;
      }
      setPhoneNumber(phone);
      await requestOtp(phone);
      return;
    }

    if (step === 2) {
      const otpString = otp.join("");
      if (otpString.length !== 6) return;

      const phone = normalizePhone(phoneNumber);
      setIsSubmitting(true);
      try {
        const verified = await verifyOtp(phone, otpString);
        const accessToken = verified.access_token;
        saveSession(phone, accessToken);
        setPendingToken(accessToken);

        const member = await getMember(phone);
        if (member.found) {
          loginWithPhone(
            phone,
            accessToken,
            member.display_name || undefined,
          );
          router.push("/home");
        } else {
          setStep(3);
        }
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "ยืนยัน OTP ไม่สำเร็จ",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 3 && displayName) {
      const phone = normalizePhone(phoneNumber);
      setIsSubmitting(true);
      try {
        const accessToken = pendingToken;
        if (!accessToken) {
          setFormError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
          setStep(1);
          return;
        }
        saveSession(phone, accessToken);
        await registerMember(displayName);
        loginWithPhone(phone, accessToken, displayName);
        router.push("/home");
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "สร้างบัญชีไม่สำเร็จ",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    const phone = normalizePhone(phoneNumber);
    await requestOtp(phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);
    if (value !== "" && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans">
      <div
        className="absolute top-0 left-0 w-full h-[45vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/BG.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-end md:justify-center pt-[30vh] z-10 w-full max-w-lg mx-auto">
        <div className="w-full bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl pt-24 px-6 pb-8 md:pb-12 relative flex flex-col min-h-[60vh] md:min-h-0">
          <div className="absolute -top-[65px] left-1/2 -translate-x-1/2 w-[130px] h-[130px] bg-white rounded-full p-2 shadow-sm border-[4px] border-[#F2F2F2]">
            <div className="w-full h-full bg-[#FF8A33] rounded-full flex items-center justify-center p-1 overflow-hidden">
              <img
                src="/MODPAO.svg"
                alt="MOD PAO Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-extrabold text-[#2F4858] tracking-widest uppercase">
              MOD PAO
            </h1>
            <p className="text-xs text-gray-400 mt-2">
              ทดสอบ: 0631723422 (สมาชิกมีในระบบ)
            </p>
          </div>

          <form
            className="flex-1 flex flex-col"
            onSubmit={(e) => void handleAction(e)}
          >
            {formError && (
              <p className="text-red-500 text-sm font-bold text-center mb-4">
                {formError}
              </p>
            )}

            {step === 1 && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="mb-8">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-[#5C6D8A] mb-2 text-center md:text-left"
                  >
                    เบอร์โทรศัพท์ (Phone Number)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="063-xxx-xxxx"
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#FF8A33] transition-colors text-center text-lg font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium shadow-sm"
                    required
                  />
                </div>
                <div className="mt-auto md:mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#FF8A33] text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? "กำลังส่ง..." : "ขอรหัส OTP"}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="mb-8 text-center">
                  <p className="font-bold text-[#5C6D8A] mb-1">
                    กรอกรหัส OTP 6 หลัก
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                    รหัสถูกส่งไปยังเบอร์ {phoneNumber}
                  </p>
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
                    disabled={otp.join("").length !== 6 || isSubmitting}
                    className="w-full bg-[#FF8A33] disabled:bg-gray-300 disabled:shadow-none text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? "กำลังตรวจสอบ..." : "ยืนยันเข้าสู่ระบบ"}
                  </button>
                  <button
                    type="button"
                    disabled={resendSeconds > 0 || isSubmitting}
                    onClick={() => void handleResend()}
                    className="text-sm font-bold text-[#A0AABF] hover:text-gray-600 underline underline-offset-4 decoration-2 decoration-gray-300 disabled:opacity-50"
                  >
                    {resendSeconds > 0
                      ? `ส่งรหัสใหม่ (${resendSeconds}s)`
                      : "ส่งรหัสใหม่อีกครั้ง"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="mb-8 flex flex-col items-center">
                  <p className="font-bold text-[#2F4858] text-lg mb-1">
                    ยินดีต้อนรับผู้ใช้ใหม่
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                    ตั้งค่าโปรไฟล์ของคุณเพื่อเริ่มใช้งาน
                  </p>
                  <div className="relative w-28 h-28 mb-6">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="text-gray-400 w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-[#5C6D8A] mb-2 text-center md:text-left"
                    >
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
                  <button
                    type="submit"
                    disabled={!displayName || isSubmitting}
                    className="w-full bg-[#FF8A33] disabled:bg-gray-300 disabled:shadow-none text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(255,138,51,0.3)] hover:bg-orange-500 active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? "กำลังสร้างบัญชี..." : "เริ่มต้นใช้งานเลย"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-12 md:mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-xs font-bold text-[#A0AABF]">
              Term of use
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
