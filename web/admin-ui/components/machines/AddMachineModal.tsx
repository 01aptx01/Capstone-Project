"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { createMachine } from "@/lib/admin-api";

export const ADMIN_MACHINES_REFRESH_EVENT = "admin-machines-refresh";

interface AddMachineModalProps {
  open: boolean;
  onClose: () => void;
}

type Phase = "form" | "success";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const initialForm = {
  machine_code: "",
  location: "",
  status: "online" as "online" | "maintenance" | "offline",
};

function messageFromAxios(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { error?: string; message?: string } | undefined;
    if (d && typeof d === "object") {
      if (typeof d.error === "string" && d.error) return d.error;
      if (typeof d.message === "string" && d.message) return d.message;
    }
    return err.message || "สร้างตู้ไม่สำเร็จ";
  }
  return "สร้างตู้ไม่สำเร็จ";
}

export default function AddMachineModal({ open, onClose }: AddMachineModalProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [machineId, setMachineId] = useState("");
  const [plainToken, setPlainToken] = useState("");
  const [copyLabel, setCopyLabel] = useState<"idle" | "copied" | "failed">("idle");
  const [uiMachineType, setUiMachineType] = useState("vending-cool");

  const resetAll = useCallback(() => {
    setPhase("form");
    setFormData(initialForm);
    setUiMachineType("vending-cool");
    setImagePreview(null);
    setSubmitting(false);
    setSubmitError(null);
    setMachineId("");
    setPlainToken("");
    setCopyLabel("idle");
  }, []);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open, resetAll]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = formData.machine_code.trim();
    if (!code) {
      setSubmitError("กรุณากรอกรหัสตู้ (Machine ID)");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const loc = formData.location.trim();
      const res = await createMachine({
        machine_code: code,
        location: loc ? loc : null,
        status: formData.status,
      });
      setMachineId(res.machine_code);
      setPlainToken(res.secret_token);
      setPhase("success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(ADMIN_MACHINES_REFRESH_EVENT));
      }
    } catch (err) {
      setSubmitError(messageFromAxios(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToken = async () => {
    setCopyLabel("idle");
    const ok = await copyToClipboard(plainToken);
    setCopyLabel(ok ? "copied" : "failed");
    if (ok) {
      window.setTimeout(() => setCopyLabel("idle"), 2000);
    }
  };

  const handleDone = () => {
    resetAll();
    onClose();
  };

  const modalTitle = phase === "success" ? "สร้างตู้สำเร็จ" : "เพิ่มตู้สินค้าใหม่";

  return (
    <Modal open={open} onClose={phase === "success" ? handleDone : onClose} title={modalTitle}>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--primary)]">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <path d="M9 6h6M9 10h6M9 14h6"></path>
          </svg>
        </div>

        {phase === "success" ? (
          <div className="relative z-10 space-y-6 p-2">
            <div className="rounded-[24px] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-[var(--surface-1)] px-6 py-6 shadow-[0_12px_40px_rgba(16,185,129,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--success-bg)]0 text-[var(--primary-contrast)] flex items-center justify-center shadow-lg shadow-emerald-200">
                  <i className="fi fi-rr-check text-2xl" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">บันทึกแล้ว</p>
                  <p className="text-lg font-black text-[var(--text)]">เก็บข้อมูลด้านล่างให้ปลอดภัย</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Machine ID</p>
                  <p className="text-[15px] font-black text-[var(--text)] font-mono tracking-tight break-all">{machineId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Secret token</p>
                  <p className="text-[13px] font-bold text-[var(--text)] font-mono break-all leading-relaxed bg-[var(--surface-1)]/80 border border-[var(--border)] rounded-xl px-4 py-3">
                    {plainToken}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyToken}
                className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[20px] bg-[var(--text)] text-[var(--primary-contrast)] text-[14px] font-black hover:bg-[var(--text)] transition-all active:scale-[0.98]"
              >
                <i className="fi fi-rr-copy" />
                Copy to Clipboard
                {copyLabel === "copied" && <span className="text-emerald-300 font-bold">· Copied!</span>}
                {copyLabel === "failed" && <span className="text-amber-200 font-bold">· Failed</span>}
              </button>
            </div>

            <p className="text-[13px] font-bold text-amber-900 leading-snug px-1">
              This token is shown only once. Copy it to your hardware agent&apos;s .env file immediately.
            </p>

            <button
              type="button"
              onClick={handleDone}
              className="w-full px-8 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] transition-all"
            >
              เสร็จสิ้น
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10 p-2">
            <div className="flex flex-col items-center justify-center gap-4 mb-4">
              <div className="relative group">
                <div
                  className={`w-36 h-36 rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
                    imagePreview
                      ? "border-[var(--primary)] bg-[var(--surface-1)] shadow-2xl "
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-orange-200 hover:bg-orange-50"
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in scale-95" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-16 h-16 bg-[var(--surface-1)] rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                        <i className="fi fi-rr-camera text-[24px] text-[var(--text-muted)] group-hover:text-[var(--primary)]"></i>
                      </div>
                      <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--primary)]">
                        อัปโหลดรูปภาพ (ไม่บันทึกในระบบ)
                      </span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-xl z-20 active:scale-90"
                  >
                    <i className="fi fi-rr-cross-small text-xl"></i>
                  </button>
                )}
              </div>
              <p className="text-[var(--text-muted)] text-[12px] font-bold text-center max-w-[260px]">
                รูปและประเภทตู้ด้านล่างใช้เพื่ออ้างอิงในหน้าจอเท่านั้น ข้อมูลที่ส่งไป API คือรหัสตู้ สถานที่ และสถานะ
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    รหัสตู้ (Machine ID) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <i className="fi fi-rr-barcode-read"></i>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="เช่น MP1-002"
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)] font-mono"
                      value={formData.machine_code}
                      onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    สถานที่ตั้ง (Location)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <i className="fi fi-rr-marker"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="ไม่บังคับ — เช่น หอใน มจธ."
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)]"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    สถานะตู้ (ส่งไป API)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
                      <i className="fi fi-rr-signal-alt"></i>
                    </span>
                    <select
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)] appearance-none cursor-pointer"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as typeof formData.status,
                        })
                      }
                    >
                      <option value="online">online</option>
                      <option value="maintenance">maintenance</option>
                      <option value="offline">offline</option>
                    </select>
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                      <i className="fi fi-rr-angle-small-down text-xl"></i>
                    </span>
                  </div>
                </div>

                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    ประเภทตู้ (อ้างอิงในหน้าจอ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
                      <i className="fi fi-rr-layers"></i>
                    </span>
                    <select
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)] appearance-none cursor-pointer"
                      value={uiMachineType}
                      onChange={(e) => setUiMachineType(e.target.value)}
                    >
                      <option value="vending-cool">ตู้แช่เย็น (Cooling)</option>
                      <option value="vending-hot">ตู้เครื่องดื่มร้อน (Hot)</option>
                      <option value="vending-snack">ตู้ขนม (Snacks)</option>
                    </select>
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                      <i className="fi fi-rr-angle-small-down text-xl"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-800">
                {submitError}
              </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-8 py-5 bg-[var(--surface-2)] text-[var(--text)]0 rounded-[28px] text-[15px] font-black hover:bg-[var(--border)] transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] px-8 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? (
                  <span>กำลังสร้าง…</span>
                ) : (
                  <>
                    <span>ยืนยันการเพิ่มตู้สินค้า</span>
                    <div className="w-8 h-8 bg-[var(--surface-1)]/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <i className="fi fi-rr-arrow-small-right text-xl"></i>
                    </div>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
