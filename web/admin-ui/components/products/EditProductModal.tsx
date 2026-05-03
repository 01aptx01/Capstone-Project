"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { updateProduct } from "@/lib/admin-api";
import { uiLabelToApiCategory } from "@/lib/admin-mappers";
import { ADMIN_PRODUCTS_REFRESH_EVENT } from "@/components/products/ProductTable";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Record<string, unknown> | null;
}

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "หมูสับ/หมูแดง",
    unit_price: "",
    description: "",
    image_url: "",
  });

  const productId =
    product && typeof product.product_id === "number"
      ? product.product_id
      : product && typeof product.product_id === "string"
        ? parseInt(product.product_id, 10)
        : NaN;

  useEffect(() => {
    if (product) {
      queueMicrotask(() => {
        setFormData({
          name: String(product.name || ""),
          category: String(product.category || "หมูสับ/หมูแดง"),
          unit_price:
            product.unit_price !== undefined && product.unit_price !== null
              ? String(product.unit_price)
              : "",
          description: String(product.description || ""),
          image_url: String(product.image || ""),
        });
        setFormError(null);
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!Number.isFinite(productId)) {
      setFormError("ไม่พบรหัสสินค้า");
      return;
    }
    const price = parseFloat(formData.unit_price);
    if (!formData.name.trim() || Number.isNaN(price)) {
      setFormError("กรอกชื่อและราคาให้ถูกต้อง");
      return;
    }
    setSubmitting(true);
    try {
      await updateProduct(productId, {
        name: formData.name.trim(),
        price,
        category: uiLabelToApiCategory(formData.category),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
      });
      window.dispatchEvent(new Event(ADMIN_PRODUCTS_REFRESH_EVENT));
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="แก้ไขข้อมูลสินค้า">
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#f47b2a]">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {formError && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 text-rose-800 text-sm font-bold">{formError}</div>
        )}

        {Number.isFinite(productId) && (
          <p className="text-xs font-bold text-slate-400">รหัสสินค้า (product_id): {productId}</p>
        )}

        <div className="space-y-4">
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em]">ชื่อสินค้า</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white transition-all text-[15px] font-semibold text-[#334155]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em]">ลิงก์รูปภาพ (URL)</label>
            <input
              type="url"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white transition-all text-[15px] font-semibold text-[#334155]"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em]">หมวดหมู่</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white transition-all text-[15px] font-semibold text-[#334155] cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>หมูสับ/หมูแดง</option>
                <option>เจ / มังสวิรัติ</option>
                <option>ไส้หวาน</option>
              </select>
            </div>
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em]">ราคาต่อชิ้น (฿)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white transition-all text-[15px] font-semibold text-[#334155]"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[#94A3B8] ml-1 uppercase tracking-[0.1em]">รายละเอียด</label>
            <textarea
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:border-[#f47b2a] focus:bg-white transition-all text-[15px] font-semibold text-[#334155] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

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
            disabled={submitting}
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(244,123,42,0.25)] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
