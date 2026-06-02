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

/** Preview src for <img> (relative paths work via Next rewrite to API). */
export function productImagePreviewSrc(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return v;
}
