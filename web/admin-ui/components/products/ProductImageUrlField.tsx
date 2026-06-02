"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  PRODUCT_IMAGE_CATALOG,
  productImagePreviewSrc,
} from "@/lib/product-images";
import { uploadProductImage } from "@/lib/admin-api";
import { useLang } from "@/lib/i18n/lang";

type ProductImageUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function ProductImageUrlField({
  value,
  onChange,
  disabled = false,
}: ProductImageUrlFieldProps) {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewSrc = productImagePreviewSrc(value);

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;
    setUploading(true);
    try {
      const { image_url } = await uploadProductImage(file);
      onChange(image_url);
      toast.success(t("productImage.uploadSuccess"));
      setCatalogOpen(false);
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(
            (err.response?.data as { error?: string })?.error || err.message
          )
        : err instanceof Error
          ? err.message
          : t("productImage.uploadFailed");
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          disabled={disabled || uploading}
          placeholder={t("addProduct.placeholder.imageUrl")}
          className="flex-1 min-w-0 px-5 py-4 bg-[var(--surface-2)] border-2 border-transparent rounded-[20px] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-1)] transition-all text-[15px] font-semibold text-[var(--text)] disabled:opacity-60"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => setCatalogOpen((o) => !o)}
            className="px-4 py-4 rounded-[20px] border-2 border-[var(--border)] bg-[var(--surface-1)] text-[13px] font-black text-[var(--text)] hover:border-orange-200 disabled:opacity-60 whitespace-nowrap"
          >
            {t("productImage.pickCatalog")}
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
            className="px-4 py-4 rounded-[20px] bg-[var(--surface-2)] border-2 border-transparent text-[13px] font-black text-[var(--primary)] hover:bg-orange-50 disabled:opacity-60 whitespace-nowrap"
          >
            {uploading ? t("productImage.uploading") : t("productImage.upload")}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {previewSrc ? (
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <img
            src={previewSrc}
            alt={t("productImage.previewAlt")}
            className="w-16 h-16 rounded-xl object-cover border border-[var(--border)] bg-[var(--surface-1)]"
            onError={(e) => {
              e.currentTarget.src =
                "https://cdn-icons-png.flaticon.com/512/3081/3081918.png";
            }}
          />
          <p className="text-[12px] font-bold text-[var(--text-muted)] break-all">{value}</p>
        </div>
      ) : null}

      {catalogOpen && (
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
          <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider">
            {t("productImage.catalogTitle")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRODUCT_IMAGE_CATALOG.map((item) => (
              <button
                key={item.path}
                type="button"
                disabled={disabled || uploading}
                onClick={() => {
                  onChange(item.path);
                  setCatalogOpen(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  value === item.path
                    ? "border-[var(--primary)] bg-orange-50/50"
                    : "border-[var(--border)] bg-[var(--surface-1)] hover:border-orange-200"
                }`}
              >
                <img
                  src={item.path}
                  alt={item.label}
                  className="w-14 h-14 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="text-[11px] font-bold text-[var(--text)] text-center leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium">{t("productImage.uploadHint")}</p>
        </div>
      )}
    </div>
  );
}
