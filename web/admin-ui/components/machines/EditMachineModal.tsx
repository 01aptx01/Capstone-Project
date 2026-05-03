"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

interface EditMachineModalProps {
  open: boolean;
  onClose: () => void;
  machine: Record<string, unknown> | null;
}

export default function EditMachineModal({ open, onClose, machine }: EditMachineModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "ปกติ",
  });

  useEffect(() => {
    if (machine) {
      queueMicrotask(() => {
        setFormData({
          name: String(machine.name ?? ""),
          location: String(machine.location ?? ""),
          status: String(machine.status ?? "ปกติ"),
        });
        const img = machine.image;
        setImagePreview(img != null && img !== "" ? String(img) : null);
      });
    }
  }, [machine]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating machine:", { ...formData, image: imagePreview });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="แก้ไขข้อมูลตู้ขายสินค้า">
      <div className="relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#f47b2a]">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10 p-2">
          {/* Section: Visual Identity */}
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <div className="relative group">
              <div className={`w-36 h-36 rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
                imagePreview ? 'border-[#f47b2a] bg-white shadow-2xl shadow-orange-100' : 'border-slate-100 bg-slate-50 hover:border-orange-200 hover:bg-orange-50'
              }`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in scale-95" />
                ) : (
                  <div className="text-center px-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      <i className="fi fi-rr-camera text-[24px] text-slate-300 group-hover:text-[#f47b2a]"></i>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#f47b2a]">แก้ไขรูปภาพ</span>
                  </div>
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
                  className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-xl z-20 active:scale-90"
                >
                  <i className="fi fi-rr-cross-small text-xl"></i>
                </button>
              )}
            </div>
            <p className="text-slate-400 text-[12px] font-bold text-center max-w-[200px]">อัปเดตรูปภาพที่ชัดเจนของตู้สินค้าเพื่อให้ง่ายต่อการระบุตำแหน่ง</p>
          </div>

          <div className="space-y-6">
            {/* Machine Name */}
            <div className="group space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] group-focus-within:text-[#f47b2a] transition-colors">ชื่อตู้ / หมายเลขตู้</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f47b2a] transition-colors">
                  <i className="fi fi-rr-quote-right"></i>
                </span>
                <input
                  type="text"
                  required
                  placeholder="เช่น Vending A01"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[#334155]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="group space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] group-focus-within:text-[#f47b2a] transition-colors">สถานที่ตั้ง (Location)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f47b2a] transition-colors">
                  <i className="fi fi-rr-marker"></i>
                </span>
                <input
                  type="text"
                  required
                  placeholder="ระบุสถานที่ตั้ง"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[#334155]"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Status */}
            <div className="group space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] group-focus-within:text-[#f47b2a] transition-colors">สถานะ</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f47b2a] transition-colors pointer-events-none">
                  <i className="fi fi-rr-power"></i>
                </span>
                <select
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[#334155] appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ปกติ">ปกติ (Online)</option>
                  <option value="ขัดข้อง">ขัดข้อง (Offline)</option>
                  <option value="ปิดปรับปรุง">ปิดปรับปรุง (Maintenance)</option>
                </select>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                  <i className="fi fi-rr-angle-small-down text-xl"></i>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 rounded-[28px] text-[15px] font-black hover:bg-slate-200 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-5 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
            >
              <span>บันทึกการแก้ไข</span>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-check text-lg"></i>
              </div>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

