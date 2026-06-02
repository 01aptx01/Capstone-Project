"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import { updateProduct, deleteProduct } from "@/lib/admin-api";
import { uiLabelToApiCategory } from "@/lib/admin-mappers";
import { isValidProductImageUrl } from "@/lib/product-images";
import ProductImageUrlField from "@/components/products/ProductImageUrlField";
import { ADMIN_PRODUCTS_REFRESH_EVENT } from "@/components/products/ProductTable";
import { useLang } from "@/lib/i18n/lang";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Record<string, unknown> | null;
}

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "meat",
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
    if (!open) setShowDeleteConfirm(false);
  }, [open]);

  useEffect(() => {
    if (product) {
      queueMicrotask(() => {
        setFormData({
          name: String(product.name || ""),
          category: String(product.category || "meat"),
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

  const handleDelete = async () => {
    if (!Number.isFinite(productId)) return;
    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success(t("deleteProduct.toastDeleted"));
      window.dispatchEvent(new Event(ADMIN_PRODUCTS_REFRESH_EVENT));
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("deleteProduct.toastFailed");
      toast.error(msg);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!Number.isFinite(productId)) {
      setFormError(t("editProduct.errorNotFound"));
      return;
    }
    const price = parseFloat(formData.unit_price);
    if (!formData.name.trim() || Number.isNaN(price)) {
      setFormError(t("addProduct.errorInvalid"));
      return;
    }
    if (!isValidProductImageUrl(formData.image_url)) {
      setFormError(t("productImage.invalidUrl"));
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
      toast.success(t("editProduct.toastSaved"));
      window.dispatchEvent(new Event(ADMIN_PRODUCTS_REFRESH_EVENT));
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
    <>
    <Modal open={open} onClose={onClose} title={t("editProduct.title")}>
      <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--primary)]">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {formError && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 text-rose-800 text-sm font-bold">{formError}</div>
        )}

        {Number.isFinite(productId) && (
          <p className="text-xs font-bold text-[var(--text-muted)]">{t("editProduct.idLabel")} {productId}</p>
        )}

        <div className="space-y-4">
          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.name")}</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.imageUrl")}</label>
            <ProductImageUrlField
              value={formData.image_url}
              onChange={(image_url) => setFormData({ ...formData, image_url })}
              disabled={submitting}
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
                <option value="meat">meat</option>
                <option value="vegetarian">vegetarian</option>
                <option value="sweet">sweet</option>
              </select>
            </div>
            <div className="group space-y-1.5">
              <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.unitPrice")}</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)]"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="text-[12px] font-black text-[var(--text-muted)] ml-1 uppercase tracking-[0.1em]">{t("addProduct.label.description")}</label>
            <textarea
              rows={3}
              className="w-full px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

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
            className="flex-[2] px-6 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-[20px] text-[15px] font-black shadow-[0_12px_30px_rgba(244,123,42,0.25)] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? t("editProduct.saving") : t("editProduct.save")}
          </button>
        </div>

        <div className="pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={submitting || !Number.isFinite(productId)}
            className="w-full px-6 py-4 rounded-[20px] text-[14px] font-black text-white bg-rose-500 hover:bg-rose-600 border-2 border-rose-600 shadow-[0_4px_14px_rgba(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fi fi-rr-trash"></i>
            {t("deleteProduct.button")}
          </button>
        </div>
      </form>
    </Modal>

    <Modal
      open={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      title={t("deleteProduct.confirmTitle")}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <i className="fi fi-rr-triangle-warning text-rose-600 text-lg"></i>
          </div>
          <p className="text-[14px] font-bold text-rose-800 leading-relaxed">
            {t("deleteProduct.confirmBody").replace("{name}", formData.name)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            className="flex-1 py-4 rounded-[20px] bg-[var(--surface-2)] text-[var(--text-muted)] font-black text-[14px] hover:bg-[var(--border)] transition-all disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="flex-[2] py-4 rounded-[20px] bg-rose-600 text-white font-black text-[14px] hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? t("deleteProduct.deleting") : t("deleteProduct.confirmYes")}
          </button>
        </div>
      </div>
    </Modal>
  </>
  );
}
