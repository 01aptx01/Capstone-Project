"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface CreateCouponModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCouponModal({ open, onClose }: CreateCouponModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Small delay to trigger transition
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      // Wait for transition to end before unmounting
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const [formData, setFormData] = useState({
    campaignName: "",
    campaignDescription: "",
    couponCode: "",
    discountType: "Percentage",
    discountValue: "",
    minPurchase: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
    limitPerUser: "1",
  });

  // Body scroll lock
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating coupon:", formData);
    // Add success feedback or logic here
    onClose();
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
          opacity: show ? 1 : 0 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[#f47b2a] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fi fi-rr-ticket"></i>
            </div>
            <div>
              <h2 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">Create New Coupon</h2>
              <p className="text-[13px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">สร้างแคมเปญคูปองใหม่</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
          >
            <i className="fi fi-rr-cross-small text-xl"></i>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="p-8 space-y-10">
            
            {/* 1. Campaign Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">1</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign Information</p>
              </div>
              <div className="space-y-4">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Songkran Special 2026"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-bold text-slate-700"
                    value={formData.campaignName}
                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Campaign Description</label>
                  <textarea
                    rows={3}
                    placeholder="รายละเอียดเกี่ยวกับโปรโมชัน..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-bold text-slate-700 resize-none"
                    value={formData.campaignDescription}
                    onChange={(e) => setFormData({ ...formData, campaignDescription: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 2. Asset & Type */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">2</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset & Type</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น PAO2026"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-slate-800 tracking-widest"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Discount Type</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (฿)</option>
                  </select>
                </div>
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Discount Value</label>
                  <div className="relative">
                    {formData.discountType === "Fixed Amount" && (
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#f47b2a]">฿</span>
                    )}
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      className={`w-full ${formData.discountType === "Fixed Amount" ? "pl-12" : "px-6"} py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-slate-800`}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    />
                    {formData.discountType === "Percentage" && (
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[#f47b2a]">%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Requirements */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">3</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Requirements</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Minimum Purchase (฿)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all font-black text-slate-800"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Valid From</label>
                  <input
                    type="date"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-bold text-slate-700"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Valid To</label>
                  <input
                    type="date"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-bold text-slate-700"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 4. Utilization */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black flex items-center justify-center">4</span>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Utilization</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Usage Limit (Global)</label>
                  <input
                    type="number"
                    placeholder="ไม่จำกัด"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-black text-slate-800"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest group-focus-within:text-[#f47b2a] transition-colors">Limit per User</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-[#f47b2a]/30 focus:bg-white transition-all font-black text-slate-800"
                    value={formData.limitPerUser}
                    onChange={(e) => setFormData({ ...formData, limitPerUser: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[15px] rounded-[22px] hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white font-black text-[16px] rounded-[22px] shadow-[0_15px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_20px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 transition-all active:translate-y-0 active:scale-[0.98]"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
