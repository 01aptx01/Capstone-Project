"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createCoupon } from "@/lib/admin-api";
import { ADMIN_COUPONS_REFRESH_EVENT } from "@/components/customers/CouponTable";

interface CreateCouponModalProps {
  open: boolean;
  onClose: () => void;
}

type DiscountType = "Percentage" | "Fixed Amount";

const emptyForm = {
  couponCode: "",
  discountType: "Percentage" as DiscountType,
  discountValue: "",
  pointsCost: "0",
  validTo: "",
  isActive: true,
};

function fromDateInput(value: string): string | null {
  const s = value.trim();
  if (!s) return null;
  const d = new Date(`${s}T23:59:59`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function CreateCouponModal({ open, onClose }: CreateCouponModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setFormData(emptyForm);
      setFormError(null);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const code = formData.couponCode.trim();
    if (!code) {
      setFormError("กรุณากรอกรหัสคูปอง (Coupon Code)");
      return;
    }

    const discount = Number(formData.discountValue);
    if (!Number.isFinite(discount) || discount <= 0) {
      setFormError("จำนวนส่วนลดต้องมากกว่า 0");
      return;
    }

    const points = formData.pointsCost.trim() === "" ? 0 : Number.parseInt(formData.pointsCost, 10);
    if (!Number.isFinite(points) || points < 0) {
      setFormError("แต้มที่ใช้แลกต้องเป็นจำนวนเต็มไม่น้อยกว่า 0");
      return;
    }

    setSubmitting(true);
    try {
      await createCoupon({
        code,
        type: formData.discountType === "Percentage" ? "percent" : "fixed_amount",
        discount_amount: discount,
        expire_date: fromDateInput(formData.validTo),
        is_active: formData.isActive,
        points_cost: points,
      });
      window.dispatchEvent(new Event(ADMIN_COUPONS_REFRESH_EVENT));
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "สร้างคูปองไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: show ? 1 : 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-[0_32px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-white/60 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: show ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          opacity: show ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[#f47b2a] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fi fi-rr-ticket"></i>
            </div>
            <div>
              <h2 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">Create New Coupon</h2>
              <p className="text-[13px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">สร้างคูปองใหม่ผ่าน API</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm disabled:opacity-50"
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
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">1</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Coupon Identity</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น PAO2026"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-slate-800 tracking-widest"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    disabled={submitting}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">
                    Discount Type
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    disabled={submitting}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (฿)</option>
                  </select>
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.discountType === "Fixed Amount" && (
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#f47b2a]">฿</span>
                    )}
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full ${formData.discountType === "Fixed Amount" ? "pl-12" : "px-6"} py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-slate-800`}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      disabled={submitting}
                    />
                    {formData.discountType === "Percentage" && (
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[#f47b2a]">%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">2</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Redemption & Expiry</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">
                    Points Cost
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0 = ไม่ต้องใช้แต้ม"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-black text-slate-800"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">
                    Valid To (เว้นว่าง = ไม่หมดอายุ)
                  </label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-bold text-slate-700"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <label className="md:col-span-2 flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={submitting}
                    className="w-5 h-5 accent-[#f47b2a]"
                  />
                  <span className="text-sm font-black text-slate-700">เปิดใช้งานทันที (is_active)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[15px] rounded-[22px] hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-4 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white font-black text-[16px] rounded-[22px] shadow-[0_15px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_20px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 transition-all active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? "กำลังสร้าง…" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
