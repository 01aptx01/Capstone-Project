/** Built-in catalogue paths (match database/init.sql seed). */
export const PRODUCT_IMAGE_CATALOG: { path: string; label: string }[] = [
  { path: "/product/img/pao-moddaeng.png", label: "เปาหมูแดง" },
  { path: "/product/img/pao-moosub.png", label: "เปาหมูสับ" },
  { path: "/product/img/pao-shrimp.png", label: "เปากุ้ง" },
  { path: "/product/img/pao-tofu.png", label: "เปาเต้าหู้" },
  { path: "/product/img/pao-mushroom.png", label: "เปาเห็ดหอม" },
  { path: "/product/img/pao-cream.png", label: "เปาครีม" },
];

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
