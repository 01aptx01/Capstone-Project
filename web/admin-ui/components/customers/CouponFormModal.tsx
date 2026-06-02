"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { createCoupon, updateCoupon, deleteCoupon } from "@/lib/admin-api";
import type { UiCouponRow } from "@/lib/admin-mappers";
import { ADMIN_COUPONS_REFRESH_EVENT } from "@/components/customers/coupon-constants";
import { useLang } from "@/lib/i18n/lang";
import {
  blockNonIntegerKeys,
  digitsOnly,
  parseDigitsToOptionalNonNegativeInt,
} from "@/lib/integer-input";

export type CouponFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  /** Required when mode is "edit" */
  editRow?: UiCouponRow | null;
};

type DiscountType = "Percentage" | "Fixed Amount";

const emptyForm = {
  couponName: "",
  discountType: "Percentage" as DiscountType,
  discountValue: "",
  pointsCost: "0",
  maxUses: "0",
  validTo: "",
  isActive: true,
};

/** Send YYYY-MM-DD; server stores end-of-day Asia/Bangkok as UTC. */
function fromDateInput(value: string): string | null {
  const s = value.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function isoExpiryToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function uiRowToFormData(row: UiCouponRow) {
  return {
    couponName: row.id,
    discountType: (row.type === "PERCENT" ? "Percentage" : "Fixed Amount") as DiscountType,
    discountValue: digitsOnly(String(Math.trunc(Number(row.discount_amount) || 0))),
    pointsCost: String(row.points_cost ?? 0),
    maxUses: String(row.maxUsage ?? 0),
    validTo: isoExpiryToDateInput(row.expiry),
    isActive: row.is_active,
  };
}

export default function CouponFormModal({ open, onClose, mode, editRow }: CouponFormModalProps) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setFormError(null);
      setShowDeleteConfirm(false);
      if (mode === "create") {
        setFormData(emptyForm);
      } else if (mode === "edit" && editRow) {
        setFormData(uiRowToFormData(editRow));
      }
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }
    setShow(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [open, mode, editRow]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  const headline =
    mode === "edit" ? t("coupon.editTitle") : t("createCoupon.headline");
  const subtitle =
    mode === "edit" ? t("coupon.editSubtitle") : t("createCoupon.subtitle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const code = formData.couponName.trim();
    if (!code) {
      setFormError(t("createCoupon.errorRequired"));
      return;
    }

    const discountRaw = digitsOnly(formData.discountValue);
    if (!discountRaw) {
      setFormError(t("createCoupon.errorDiscount"));
      return;
    }
    const discount = parseInt(discountRaw, 10);
    if (discount <= 0) {
      setFormError(t("createCoupon.errorDiscount"));
      return;
    }
    if (formData.discountType === "Percentage" && discount > 100) {
      setFormError(t("createCoupon.errorPercentMax"));
      return;
    }

    const points =
      formData.pointsCost.trim() === ""
        ? 0
        : parseDigitsToOptionalNonNegativeInt(formData.pointsCost);
    if (points === null || points < 0) {
      setFormError(t("createCoupon.errorPoints"));
      return;
    }

    const maxUsesParsed =
      formData.maxUses.trim() === ""
        ? 0
        : parseDigitsToOptionalNonNegativeInt(formData.maxUses);
    if (maxUsesParsed === null || maxUsesParsed < 0) {
      setFormError(t("createCoupon.errorMaxUses"));
      return;
    }

    if (mode === "edit" && !editRow) {
      setFormError(t("coupon.error.saveFailed"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code,
        type: formData.discountType === "Percentage" ? "percent" : "fixed_amount",
        discount_amount: discount,
        expire_date: fromDateInput(formData.validTo),
        is_active: formData.isActive,
        points_cost: points,
        max_uses: maxUsesParsed,
      };

      if (mode === "create") {
        await createCoupon(payload);
      } else {
        await updateCoupon(editRow!.promotion_id, payload);
      }

      window.dispatchEvent(new Event(ADMIN_COUPONS_REFRESH_EVENT));
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : mode === "create"
            ? t("createCoupon.errorFailed")
            : t("coupon.error.saveFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!editRow) return;
    setDeleting(true);
    try {
      await deleteCoupon(editRow.promotion_id);
      toast.success(t("deleteCoupon.toastDeleted"));
      window.dispatchEvent(new Event(ADMIN_COUPONS_REFRESH_EVENT));
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("deleteCoupon.toastFailed");
      toast.error(msg);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const primaryLabel =
    mode === "edit"
      ? submitting
        ? t("coupon.saving")
        : t("coupon.save")
      : submitting
        ? t("createCoupon.creating")
        : t("createCoupon.headline");

  const modal = createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: show ? 1 : 0 }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] w-full max-w-2xl rounded-[32px] shadow-[0_32px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-[var(--border)]/60 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: show ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          opacity: show ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-2)]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[var(--primary)] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fi fi-rr-ticket"></i>
            </div>
            <div>
              <h2 className="text-[22px] font-black text-[var(--text)] tracking-tight leading-none">{headline}</h2>
              <p className="text-[13px] text-[var(--text-muted)] font-bold mt-1.5 uppercase tracking-wider">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all shadow-sm disabled:opacity-50"
          >
            <i className="fi fi-rr-cross-small text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="p-8 space-y-10">
            {formError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-800">
                {formError}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] text-[11px] font-black flex items-center justify-center">1</span>
                <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Coupon Identity</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    Coupon Name (ชื่อคูปอง) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คูปองส่วนลดปีใหม่ 50 บาท"
                    className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-[var(--text)] tracking-normal"
                    value={formData.couponName}
                    onChange={(e) => setFormData({ ...formData, couponName: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    Discount Type
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] transition-all font-bold text-[var(--text)] appearance-none"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    disabled={submitting}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (฿)</option>
                  </select>
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.discountType === "Fixed Amount" && (
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[var(--primary)]">฿</span>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="0"
                      className={`w-full ${formData.discountType === "Fixed Amount" ? "pl-12" : "px-6"} py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-[var(--text)]`}
                      value={formData.discountValue}
                      onKeyDown={blockNonIntegerKeys}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: digitsOnly(e.target.value),
                        })
                      }
                      disabled={submitting}
                    />
                    {formData.discountType === "Percentage" && (
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[var(--primary)]">%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] text-[11px] font-black flex items-center justify-center">2</span>
                <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Redemption & Expiry</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    Points Cost
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("createCoupon.placeholder.points")}
                    className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] transition-all font-black text-[var(--text)]"
                    value={formData.pointsCost}
                    onKeyDown={blockNonIntegerKeys}
                    onChange={(e) =>
                      setFormData({ ...formData, pointsCost: digitsOnly(e.target.value) })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    {t("createCoupon.label.maxUses")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("createCoupon.placeholder.maxUses")}
                    className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] transition-all font-black text-[var(--text)]"
                    value={formData.maxUses}
                    onKeyDown={blockNonIntegerKeys}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: digitsOnly(e.target.value) })
                    }
                    disabled={submitting}
                  />
                  <p className="text-[11px] font-bold text-[var(--text-muted)] ml-2">{t("createCoupon.hint.maxUses")}</p>
                </div>
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                    {t("createCoupon.label.validTo")}
                  </label>
                  <p className="text-[11px] font-bold text-[var(--text-muted)] ml-2">
                    {t("coupon.hint.expiryBangkok")}
                  </p>
                  <input
                    type="date"
                    className="w-full px-6 py-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-[22px] outline-none focus:border-[var(--primary)]/30 focus:bg-[var(--surface-1)] transition-all font-bold text-[var(--text)]"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <label className="md:col-span-2 flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={submitting}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  <span className="text-sm font-black text-[var(--text)]">{t("createCoupon.label.activate")}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[var(--surface-2)]/50 border-t border-[var(--border)] space-y-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-4 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] font-black text-[15px] rounded-[22px] hover:bg-[var(--surface-2)] transition-all active:scale-95 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] font-black text-[16px] rounded-[22px] shadow-[0_15px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_20px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 transition-all active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                {primaryLabel}
              </button>
            </div>
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting}
                className="w-full py-3.5 rounded-[22px] border-2 border-rose-600 bg-rose-500 text-white font-black text-[14px] hover:bg-rose-600 shadow-[0_4px_14px_rgba(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="fi fi-rr-trash"></i>
                {t("deleteCoupon.button")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {modal}
      {showDeleteConfirm &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[199999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          >
            <div
              className="bg-[var(--surface-1)] w-full max-w-md rounded-[28px] shadow-[0_32px_100px_rgba(0,0,0,0.2)] border border-[var(--border)]/60 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-[var(--border)]">
                <h2 className="text-[20px] font-black text-[var(--text)]">
                  {t("deleteCoupon.confirmTitle")}
                </h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <i className="fi fi-rr-triangle-warning text-rose-600 text-lg"></i>
                  </div>
                  <p className="text-[14px] font-bold text-rose-800 leading-relaxed">
                    {t("deleteCoupon.confirmBody").replace("{code}", editRow?.id ?? "")}
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
                    onClick={() => void handleDeleteCoupon()}
                    disabled={deleting}
                    className="flex-[2] py-4 rounded-[22px] bg-rose-600 text-white font-black text-[14px] hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deleting ? t("deleteCoupon.deleting") : t("deleteCoupon.confirmYes")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
