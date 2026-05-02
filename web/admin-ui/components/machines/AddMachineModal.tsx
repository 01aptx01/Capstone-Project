"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AddMachineModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddMachineModal({ open, onClose }: AddMachineModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    serialNumber: "",
    type: "vending-cool",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding machine:", formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="เพิ่มตู้สินค้าใหม่">
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#FF6A00]">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7 relative">
        <div className="space-y-5">
          {/* Machine Name */}
          <div className="group space-y-2">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">ชื่อตู้สินค้า</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </span>
              <input
                type="text"
                required
                placeholder="เช่น ตู้หน้าตึก A, ตู้โรงอาหาร"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="group space-y-2">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">สถานที่ตั้ง</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              <input
                type="text"
                required
                placeholder="ระบุที่อยู่หรือจุดติดตั้ง"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Machine Type & Serial */}
          <div className="grid grid-cols-2 gap-5">
            <div className="group space-y-2">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">ประเภทตู้</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </span>
                <select
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A] appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="vending-cool">ตู้แช่เย็น (Cooling)</option>
                  <option value="vending-hot">ตู้เครื่องดื่มร้อน (Hot)</option>
                  <option value="vending-snack">ตู้ขนม (Snacks)</option>
                </select>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>
            <div className="group space-y-2">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">Serial Number</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 18l2-2 4 4"></path><path d="M12 18H3"></path><path d="M16 8l2 2 4-4"></path><path d="M12 8H3"></path><path d="M16 13l2 2 4-4"></path><path d="M12 13H3"></path></svg>
                </span>
                <input
                  type="text"
                  placeholder="SN-XXXXXX"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-[15px] font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#FF6A00] to-[#FF8C38] text-white rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(255,106,0,0.25)] hover:shadow-[0_15px_40px_rgba(255,106,0,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <span>ยืนยันการเพิ่มตู้</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </form>
    </Modal>
  );
}
