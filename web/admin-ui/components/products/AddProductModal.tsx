"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import { createProduct } from "@/lib/admin-api";
import { uiLabelToApiCategory } from "@/lib/admin-mappers";
import { ADMIN_PRODUCTS_REFRESH_EVENT } from "@/components/products/ProductTable";
import { useLang } from "@/lib/i18n/lang";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "หมูสับ/หมูแดง",
    unit_price: "",
    description: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const price = parseFloat(formData.unit_price);
    if (!formData.name.trim() || Number.isNaN(price)) {
      setFormError(t("addProduct.errorInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({
        name: formData.name.trim(),
        price,
        category: uiLabelToApiCategory(formData.category),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
      });
      toast.success(t("addProduct.toastCreated"));
      window.dispatchEvent(new Event(ADMIN_PRODUCTS_REFRESH_EVENT));
      setFormData({
        name: "",
        category: "หมูสับ/หมูแดง",
        unit_price: "",
        description: "",
        image_url: "",
      });
      onClose();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(
            (err.response?.data as { error?: string; message?: string })?.error ||
              (err.response?.data as { message?: string })?.message ||
              err.message
          )
        : err instanceof Error
          ? err.message
          : t("editMachine.toastFailed");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("addProduct.title")}>
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--primary)]">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {formError && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 text-rose-800 text-sm font-bold">{formError}</div>
        )}

        <div className="space-y-4">
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.name")}</label>
            <input
              type="text"
              required
              placeholder={t("addProduct.placeholder.name")}
              className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.imageUrl")}</label>
            <input
              type="url"
              placeholder={t("addProduct.placeholder.imageUrl")}
              className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)]"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.category")}</label>
              <select
                className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)] cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>หมูสับ/หมูแดง</option>
                <option>เจ / มังสวิรัติ</option>
                <option>ไส้หวาน</option>
              </select>
            </div>
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.unitPrice")}</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)]"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.description")}</label>
            <textarea
              placeholder={t("addProduct.placeholder.description")}
              rows={3}
              className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] font-medium">
          {t("addProduct.note")}
        </p>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-[20px] text-[15px] font-bold hover:bg-[var(--border)] transition-all active:scale-95"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_15px_40px_rgba(244,123,42,0.35)] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? t("addProduct.creating") : t("addProduct.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
