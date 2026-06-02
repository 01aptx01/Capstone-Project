"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { changeAdminPassword } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

const MIN_PASSWORD_LENGTH = 6;

type PasswordChangeFormProps = {
  inputClassName?: string;
  submitClassName?: string;
};

export default function PasswordChangeForm({
  inputClassName = "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] font-medium focus:outline-none focus:border-[var(--primary)] transition-colors",
  submitClassName = "w-full py-3.5 bg-[var(--primary)] text-[var(--primary-contrast)] font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-60 disabled:pointer-events-none",
}: PasswordChangeFormProps) {
  const { t } = useLang();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (form.newPass.length < MIN_PASSWORD_LENGTH) {
      setMsg({ type: "error", text: t("settings.password.errorMinLength") });
      return;
    }
    if (form.newPass !== form.confirm) {
      setMsg({ type: "error", text: t("settings.password.errorMismatch") });
      return;
    }

    setSubmitting(true);
    try {
      await changeAdminPassword({
        current_password: form.current,
        new_password: form.newPass,
      });
      setMsg({ type: "success", text: t("settings.password.success") });
      setForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      const apiError = isAxiosError(err)
        ? String(
            (err.response?.data as { error?: string })?.error ||
              t("settings.password.errorFailed"),
          )
        : t("settings.password.errorFailed");
      setMsg({ type: "error", text: apiError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {msg && (
        <div
          className={`px-4 py-3 rounded-xl text-[13px] font-bold mb-4 flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-[var(--success-bg)] border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-600"
          }`}
        >
          <i
            className={`fi ${msg.type === "success" ? "fi-rr-check" : "fi-rr-exclamation"}`}
          />
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">
            {t("settings.password.current")}
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => setForm((s) => ({ ...s, current: e.target.value }))}
            className={inputClassName}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">
            {t("settings.password.new")}
          </label>
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={form.newPass}
            onChange={(e) => setForm((s) => ({ ...s, newPass: e.target.value }))}
            className={inputClassName}
            disabled={submitting}
          />
          <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1.5 ml-1">
            {t("settings.password.hintMinLength")}
          </p>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">
            {t("settings.password.confirm")}
          </label>
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
            className={inputClassName}
            disabled={submitting}
          />
        </div>
        <button type="submit" className={submitClassName} disabled={submitting}>
          {submitting ? t("settings.password.submitting") : t("settings.password.submit")}
        </button>
      </form>
    </>
  );
}
