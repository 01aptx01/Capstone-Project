"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { updateMachine, deleteMachine } from "@/lib/admin-api";
import { ADMIN_MACHINES_REFRESH_EVENT } from "@/components/machines/AddMachineModal";
import { useLang } from "@/lib/i18n/lang";

interface EditMachineModalProps {
  open: boolean;
  onClose: () => void;
  machine: Record<string, unknown> | null;
}

export default function EditMachineModal({ open, onClose, machine }: EditMachineModalProps) {
  const { t } = useLang();
  const STATUS_OPTIONS = useMemo<{ value: string; label: string }[]>(
    () => [
      { value: "online", label: t("editMachine.option.online") },
      { value: "maintenance", label: t("editMachine.option.maintenance") },
      { value: "offline", label: t("editMachine.option.offline") },
    ],
    [t]
  );
  const [machineCode, setMachineCode] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("online");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) setShowDeleteConfirm(false);
  }, [open]);

  useEffect(() => {
    if (!machine) return;
    queueMicrotask(() => {
      const code = String(machine.id ?? machine.name ?? "").trim();
      setMachineCode(code);
      setLocation(String(machine.location ?? ""));
      const st = String(machine.status ?? "online").trim();
      setStatus(
        st === "maintenance" || st === "offline" || st === "online" ? st : "online"
      );
    });
  }, [machine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineCode) {
      toast.error(t("editMachine.errorNotFound"));
      return;
    }
    setSaving(true);
    try {
      await updateMachine(machineCode, {
        location: location.trim() === "" ? null : location.trim(),
        status,
      });
      toast.success(t("editMachine.toastSaved"));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ADMIN_MACHINES_REFRESH_EVENT));
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("editMachine.toastFailed");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!machineCode) return;
    setDeleting(true);
    try {
      await deleteMachine(machineCode);
      toast.success(t("deleteMachine.toastDeleted"));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ADMIN_MACHINES_REFRESH_EVENT));
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("deleteMachine.toastFailed");
      toast.error(msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
    <Modal open={open} onClose={onClose} title={t("editMachine.title")}>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
          <svg
            width="240"
            height="240"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[var(--primary)]"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 p-2">
          <p className="text-[12px] font-bold text-[var(--text-muted)] leading-relaxed">
            {t("editMachine.note")}
          </p>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em]">
              {t("editMachine.label.machineId")}
            </label>
            <input
              type="text"
              readOnly
              className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] text-[15px] font-bold text-[var(--text)] cursor-not-allowed"
              value={machineCode}
            />
          </div>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
              {t("editMachine.label.location")}
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                <i className="fi fi-rr-marker"></i>
              </span>
              <input
                type="text"
                placeholder={t("editMachine.placeholder.location")}
                className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-[0.2em] group-focus-within:text-[var(--primary)] transition-colors">
              {t("editMachine.label.status")}
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <i className="fi fi-rr-power"></i>
              </span>
              <select
                className="w-full pl-14 pr-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[var(--text)] appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <i className="fi fi-rr-angle-small-down text-xl"></i>
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-8 py-5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-[28px] text-[15px] font-black hover:bg-[var(--border)] transition-all active:scale-95 disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] px-8 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{saving ? t("editMachine.saving") : t("editMachine.save")}</span>
              <div className="w-8 h-8 bg-[var(--surface-1)]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-check text-lg"></i>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="w-full px-8 py-4 rounded-[24px] text-[14px] font-black text-white bg-rose-500 hover:bg-rose-600 border-2 border-rose-600 shadow-[0_4px_14px_rgba(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fi fi-rr-trash"></i>
              {t("deleteMachine.button")}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <Modal
      open={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      title={t("deleteMachine.confirmTitle")}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <i className="fi fi-rr-triangle-warning text-rose-600 text-lg"></i>
          </div>
          <p className="text-[14px] font-bold text-rose-800 leading-relaxed">
            {t("deleteMachine.confirmBody").replace("{code}", machineCode)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            className="flex-1 py-4 rounded-[22px] bg-[var(--surface-2)] text-[var(--text-muted)] font-black text-[14px] hover:bg-[var(--border)] transition-all disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-[2] py-4 rounded-[22px] bg-rose-600 text-white font-black text-[14px] hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? t("deleteMachine.deleting") : t("deleteMachine.confirmYes")}
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
