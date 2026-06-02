const MAX_IMAGE_URL_LEN = 200;

/** Accept empty, site-relative paths, or http(s) URLs. */
export function isValidProductImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.length > MAX_IMAGE_URL_LEN) return false;
  if (v.startsWith("/")) return !/\s/.test(v);
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Trim image path/URL for preview (use resolveProductImageSrc for <img src>). */
export function productImagePreviewSrc(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return v;
}

/** Absolute URL for catalogue paths (browser → Flask API, not Next container localhost). */
export function resolveProductImageSrc(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) {
    const base =
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_ADMIN_API_URL?.replace(/\/$/, "")) ||
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
      "http://localhost:8000";
    return `${base}${v}`;
  }
  return v;
}
