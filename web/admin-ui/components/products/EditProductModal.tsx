"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "หมูสับ/หมูแดง",
    unit_price: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || product.id || "",
        category: product.category || "หมูสับ/หมูแดง",
        unit_price: product.unit_price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        description: product.description || "",
      });
      setImagePreview(product.image || null);
    }
  }, [product]);

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
    console.log("Updating product:", { ...formData, image: imagePreview });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="แก้ไขข้อมูลสินค้า">
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#FF6A00]">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Image Upload Section */}
        <div className="flex justify-center mb-2">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
              imagePreview ? 'border-[#FF6A00] bg-white' : 'border-[#E2E8F0] bg-slate-50 hover:border-[#FF6A00] hover:bg-[#FFF7ED]'
            }`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-2">
                  <svg className="w-8 h-8 mx-auto text-[#94A3B8] mb-1 group-hover:text-[#FF6A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-bold text-[#94A3B8] group-hover:text-[#FF6A00]">แก้ไขรูปภาพ</span>
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
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">ชื่อสินค้า</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </span>
              <input
                type="text"
                required
                placeholder="ชื่อสินค้า"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Product Code */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">รหัสสินค้า (SKU)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="รหัสสินค้า"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            {/* Category */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">หมวดหมู่</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </span>
                <select
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A] appearance-none cursor-pointer"
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
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">ราคาต่อชิ้น (฿)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors font-bold">฿</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">จำนวนสต็อก</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-2-2H5L3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path><path d="M3 8h18"></path><path d="M10 12h4"></path></svg>
                </span>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A]"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em] group-focus-within:text-[#FF6A00] transition-colors">รายละเอียดสินค้า</label>
            <div className="relative">
              <textarea
                placeholder="ระบุรายละเอียดสินค้า..."
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#FF6A00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.05)] transition-all text-[15px] font-semibold text-[#0F172A] resize-none"
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
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#FF6A00] to-[#FF8C38] text-white rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(255,106,0,0.25)] hover:shadow-[0_15px_40px_rgba(255,106,0,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <span>บันทึกการแก้ไข</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </form>
    </Modal>
  );
}
