"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { createMachine } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

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

// ──────────────────────────────────────────────
// ไอคอนกล้องขนาดเล็กสำหรับ preview box
// ──────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function messageFromAxios(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { error?: string; message?: string } | undefined;
    if (d && typeof d === "object") {
      if (typeof d.error === "string" && d.error) return d.error;
      if (typeof d.message === "string" && d.message) return d.message;
    }
    return err.message || fallback;
  }
  return fallback;
}

export default function AddMachineModal({ open, onClose }: AddMachineModalProps) {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("form");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [machineId, setMachineId] = useState("");
  const [plainToken, setPlainToken] = useState("");
  const [copyLabel, setCopyLabel] = useState<"idle" | "copied" | "failed">("idle");

  const resetAll = useCallback(() => {
    setPhase("form");
    setFormData(initialForm);
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
      setSubmitError(t("addMachine.errorRequired"));
      return;
    }
    if (code.length > 20) {
      setSubmitError(t("addMachine.errorCodeMaxLength"));
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
      try {
        const { logAdminActivity } = await import("@/lib/activity-log");
        logAdminActivity({
          icon: "fi fi-rr-plus",
          color: "from-[var(--primary)] to-[var(--primary)]",
          bg: "bg-orange-50",
          title: t("profile.activity.refill") ? "เพิ่มตู้สำเร็จ" : "เพิ่มตู้ใหม่สำเร็จ",
          machine: code,
          time: "เมื่อครู่นี้",
        });
      } catch (err2) {
        console.error(err2);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(ADMIN_MACHINES_REFRESH_EVENT));
      }
    } catch (err) {
      setSubmitError(messageFromAxios(err, t("addMachine.errorFailed")));
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

  const modalTitle = phase === "success" ? t("addMachine.modalTitleSuccess") : t("addMachine.modalTitleNew");

  return (
    <Modal open={open} onClose={phase === "success" ? handleDone : onClose} title={modalTitle}>
      <div>
        {phase === "success" ? (
          <div className="space-y-6 p-2">
            <div className="rounded-[24px] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-[var(--surface-1)] px-6 py-6 shadow-[0_12px_40px_rgba(16,185,129,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--success-bg)]0 text-[var(--primary-contrast)] flex items-center justify-center shadow-lg shadow-emerald-200">
                  <i className="fi fi-rr-check text-2xl" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">{t("addMachine.success.savedTag")}</p>
                  <p className="text-lg font-black text-[var(--text)]">{t("addMachine.success.headline")}</p>
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
              {t("addMachine.success.tokenWarning")}
            </p>

            <button
              type="button"
              onClick={handleDone}
              className="w-full px-8 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] transition-all"
            >
              {t("addMachine.success.done")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            {/* ── Image upload row ── */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              {/* Thumbnail / preview */}
              <div className="relative flex-shrink-0 group">
                <div
                  className={`w-[72px] h-[72px] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
                    imagePreview
                      ? "border-[var(--primary)] shadow-md"
                      : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)] hover:bg-orange-50/60"
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors opacity-50">
                      <CameraIcon />
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shadow-md z-20 active:scale-90"
                  >
                    <i className="fi fi-rr-cross-small text-sm"></i>
                  </button>
                )}
              </div>

              {/* Text side */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-[var(--text)]">
                  {imagePreview ? t("addMachine.upload.placeholder") : t("addMachine.upload.placeholder")}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 leading-snug">
                  {t("addMachine.uiNote")}
                </p>
                {!imagePreview && (
                  <span className="inline-block mt-2 text-[11px] font-black text-[var(--primary)] uppercase tracking-wider">
                    คลิกเพื่อเลือกรูป →
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    {t("addMachine.label.machineId")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <i className="fi fi-rr-barcode-read"></i>
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      placeholder={t("addMachine.placeholder.machineId")}
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)] font-mono"
                      value={formData.machine_code}
                      onChange={(e) =>
                        setFormData({ ...formData, machine_code: e.target.value.slice(0, 20) })
                      }
                    />
                  </div>
                </div>

                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                    {t("addMachine.label.location")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <i className="fi fi-rr-marker"></i>
                    </span>
                    <input
                      type="text"
                      placeholder={t("addMachine.placeholder.location")}
                      className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)]"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
                  {t("addMachine.label.status")}
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
                className="flex-1 px-8 py-5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-[28px] text-[15px] font-black hover:bg-[var(--border)] transition-all active:scale-95 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] px-8 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? (
                  <span>{t("addMachine.creating")}</span>
                ) : (
                  <>
                    <span>{t("addMachine.confirm")}</span>
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
