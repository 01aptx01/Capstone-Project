"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "หมูสับ/หมูแดง",
    unit_price: "",
    quantity: "",
    description: "",
  });

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
    console.log("Adding product:", { ...formData, image: imagePreview });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="เพิ่มสินค้าใหม่ในคลัง">
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#f47b2a]">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Image Upload Section */}
        <div className="flex justify-center mb-2">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
              imagePreview ? 'border-[#f47b2a] bg-white' : 'border-[#E2E8F0] bg-slate-50 hover:border-[#f47b2a] hover:bg-[#FFF7ED]'
            }`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-2">
                  <svg className="w-8 h-8 mx-auto text-[#94A3B8] mb-1 group-hover:text-[#f47b2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-bold text-[#94A3B8] group-hover:text-[#f47b2a]">เพิ่มรูปภาพ</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {imagePreview && (
              <button 
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-[#E2E8F0] text-slate-400 rounded-full flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-all shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Product Name */}
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">ชื่อสินค้า</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </span>
              <input
                type="text"
                required
                placeholder="เช่น ซาลาเปาไส้หมูสับ, หมั่นโถวฟักทอง"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Product Code */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">รหัสสินค้า (SKU)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="เช่น PROD-001"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155]"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            {/* Category */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">หมวดหมู่</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </span>
                <select
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155] appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>หมูสับ/หมูแดง</option>
                  <option>ไส้หวาน</option>
                  <option>มังสวิรัติ</option>
                  <option>เครื่องดื่ม</option>
                </select>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">ราคาต่อชิ้น (฿)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors font-bold">฿</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155]"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">สต็อกเริ่มต้น</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-2-2H5L3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path><path d="M3 8h18"></path><path d="M10 12h4"></path></svg>
                </span>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155]"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#f47b2a] transition-colors">รายละเอียดสินค้า</label>
            <div className="relative">
              <textarea
                placeholder="ระบุรายละเอียดสินค้าเพิ่มเติม..."
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,123,42,0.05)] transition-all text-[15px] font-semibold text-[#334155] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-[15px] font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_15px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <span>ยืนยันการเพิ่มสินค้า</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </form>
    </Modal>
  );
}

