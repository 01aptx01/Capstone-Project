"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/lib/auth/otp";
import { getMember, registerMember } from "@/lib/api/members";
import { useUser } from "@/context/UserContext";
import { saveSession } from "@/lib/auth/session";
import { Alert, Button, Input, OtpInput } from "@/components/Ui";

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const RESEND_COOLDOWN_SEC = 60;

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone } = useUser();

  const isSubmittingRef = useRef(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const requestOtp = useCallback(async (phone: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setFormError(null);
    setDevHint(null);
    setIsSubmitting(true);
    try {
      const res = await sendOtp(phone);
      setResendSeconds(RESEND_COOLDOWN_SEC);
      if (res.delivery === "console" || res.delivery === "dev") {
        setDevHint("โหมดทดสอบ: ดูรหัส OTP ใน log ของ server");
      }
      setStep(2);
    } catch (err) {
      console.error("🔴 [requestOtp] Error requesting OTP:", err);
      setFormError(err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
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
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      try {
        const verified = await verifyOtp(phone, otpString);
        const accessToken = verified.access_token;
        saveSession(phone, accessToken);
        setPendingToken(accessToken);

        const member = await getMember(phone);
        if (member.found) {
          loginWithPhone(phone, accessToken, member.display_name || undefined);
          router.push("/home");
        } else {
          setStep(3);
          isSubmittingRef.current = false;
        }
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "ยืนยัน OTP ไม่สำเร็จ",
        );
        isSubmittingRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 3 && displayName) {
      const phone = normalizePhone(phoneNumber);
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      try {
        const accessToken = pendingToken;
        if (!accessToken) {
          setFormError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
          setStep(1);
          isSubmittingRef.current = false;
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
        isSubmittingRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isSubmittingRef.current) return;
    const phone = normalizePhone(phoneNumber);
    await requestOtp(phone);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div
        className="absolute top-0 left-0 w-full h-[42vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/BG.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/55 backdrop-blur-[2px]" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-end md:justify-center pt-[28vh] z-10 w-full max-w-lg mx-auto px-4 pb-6 md:pb-0">
        <div className="w-full bg-surface rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-lg pt-24 px-6 pb-8 md:pb-12 relative flex flex-col min-h-[58vh] md:min-h-0 border border-border/50">
          <div className="absolute -top-[65px] left-1/2 -translate-x-1/2 w-[130px] h-[130px] bg-surface rounded-full p-2 shadow-sm border-4 border-border">
            <div className="w-full h-full bg-brand rounded-full flex items-center justify-center p-1 overflow-hidden">
              <img
                src="/MODPAO.svg"
                alt="MOD PAO Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-8 mt-4">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-wide">
              MOD PAO
            </h1>
            <p className="text-xs text-muted mt-2">
              เช็กคะแนนสะสม แลกรับคูปองส่วนลด และดูเมนูสินค้าตู้น้ำอัจฉริยะมดเปา
            </p>
          </div>

          <form
            className="flex-1 flex flex-col gap-4"
            onSubmit={(e) => void handleAction(e)}
          >
            {formError && <Alert variant="error">{formError}</Alert>}
            {devHint && step === 2 && <Alert variant="info">{devHint}</Alert>}

            {step === 1 && (
              <div className="flex flex-col flex-1 animate-fade-in gap-6">
                <Input
                  id="phone"
                  type="tel"
                  label="เบอร์โทรศัพท์"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="063-xxx-xxxx"
                  center
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                >
                  ขอรหัส OTP
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col flex-1 animate-fade-in gap-6">
                <div className="text-center">
                  <p className="font-bold text-subtle mb-1">
                    กรอกรหัส OTP 6 หลัก
                  </p>
                  <p className="text-xs text-muted mb-6">
                    รหัสถูกส่งไปยังเบอร์ {phoneNumber}
                  </p>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-6 text-sm font-bold text-brand hover:text-brand-hover transition-colors touch-target"
                  >
                    เปลี่ยนเบอร์โทรศัพท์
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    disabled={otp.join("").length !== 6}
                  >
                    ยืนยันเข้าสู่ระบบ
                  </Button>
                  <button
                    type="button"
                    disabled={resendSeconds > 0 || isSubmitting}
                    onClick={() => void handleResend()}
                    className="text-sm font-semibold text-muted hover:text-foreground underline underline-offset-4 disabled:opacity-50 touch-target py-2"
                  >
                    {resendSeconds > 0
                      ? `ส่งรหัสใหม่ (${resendSeconds}s)`
                      : "ส่งรหัสใหม่อีกครั้ง"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col flex-1 animate-fade-in gap-6">
                <div className="flex flex-col items-center">
                  <p className="font-display font-bold text-lg text-foreground mb-1">
                    ยินดีต้อนรับผู้ใช้ใหม่
                  </p>
                  <p className="text-xs text-muted mb-6 text-center">
                    ตั้งค่าโปรไฟล์ของคุณเพื่อเริ่มใช้งาน
                  </p>
                  <div className="relative w-28 h-28 mb-6">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="text-muted w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
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
                        aria-label="อัปโหลดรูปโปรไฟล์"
                      />
                    </div>
                  </div>
                  <Input
                    id="name"
                    label="ชื่อแสดงผล"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ใส่ชื่อของคุณ"
                    center
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  disabled={!displayName}
                >
                  เริ่มต้นใช้งานเลย
                </Button>
              </div>
            )}
          </form>

          <div className="mt-10 pt-6 border-t border-border text-center">
            <span className="text-xs font-semibold text-muted">
              Terms of use
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
