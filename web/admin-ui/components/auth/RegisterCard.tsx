"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import AuthCardWrapper from "./AuthCardWrapper";
import { acceptInvite, verifyInvite } from "@/lib/auth";

function RegisterCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [invalidInvite, setInvalidInvite] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ตรวจ invite token ตอนเปิดหน้า → ดึงอีเมลที่ถูกเชิญ (ล็อกไว้)
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setInvalidInvite("ไม่พบคำเชิญ — ลิงก์ไม่ถูกต้อง");
      setVerifying(false);
      return;
    }
    (async () => {
      try {
        const info = await verifyInvite(token);
        if (cancelled) return;
        setEmail(info.email);
      } catch (err) {
        if (cancelled) return;
        const msg = isAxiosError(err)
          ? String((err.response?.data as { error?: string })?.error || "คำเชิญไม่ถูกต้องหรือหมดอายุ")
          : "คำเชิญไม่ถูกต้องหรือหมดอายุ";
        setInvalidInvite(msg);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      await acceptInvite(token, password);
      router.replace("/");
    } catch (err) {
      const msg = isAxiosError(err)
        ? String((err.response?.data as { error?: string })?.error || "ลงทะเบียนไม่สำเร็จ")
        : "ลงทะเบียนไม่สำเร็จ";
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
        <h1 className="text-2xl font-black text-[var(--text)]">ตั้งค่าบัญชีผู้ดูแล</h1>
        <p className="text-[var(--text-muted)] text-[14px] mt-1 text-center">
          ตั้งรหัสผ่านเพื่อเริ่มใช้งาน MOD PAO Admin
        </p>
      </div>

      {verifying ? (
        <div className="py-10 text-center text-[var(--text-muted)] font-bold">
          <i className="fi fi-rr-spinner animate-spin text-2xl"></i>
          <div className="mt-3">กำลังตรวจสอบคำเชิญ...</div>
        </div>
      ) : invalidInvite ? (
        <div className="py-6 text-center">
          <div className="w-16 h-16 mx-auto bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mb-4">
            <i className="fi fi-rr-cross-circle"></i>
          </div>
          <p className="text-[var(--text)] font-black text-lg mb-2">คำเชิญใช้ไม่ได้</p>
          <p className="text-[var(--text-muted)] font-medium text-sm mb-6">{invalidInvite}</p>
          <button
            onClick={() => router.replace("/login")}
            className="text-[var(--primary)] font-bold hover:underline"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-bold mb-6 flex items-center gap-2">
              <i className="fi fi-rr-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">อีเมลที่ได้รับเชิญ</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[14px] font-medium text-[var(--text-muted)] cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-md">
                  ล็อก
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-muted)] font-medium mt-1.5">
                อีเมลนี้ถูกกำหนดจากคำเชิญ เปลี่ยนแปลงไม่ได้
              </p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">ตั้งรหัสผ่าน</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl focus:bg-[var(--surface-1)] focus:border-[var(--primary)] outline-none transition-all text-[14px] font-medium"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl focus:bg-[var(--surface-1)] focus:border-[var(--primary)] outline-none transition-all text-[14px] font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] font-black rounded-xl shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี & เข้าใช้งาน"}
            </button>
          </form>
        </>
      )}
    </AuthCardWrapper>
  );
}

export default function RegisterCard() {
  return (
    <Suspense fallback={<div style={{ width: "min(440px, 92vw)", minHeight: "480px" }} className="rounded-3xl bg-[var(--surface-1)]/80 animate-pulse" />}>
      <RegisterCardContent />
    </Suspense>
  );
}
