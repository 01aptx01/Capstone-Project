/** Browser loads /product/img/... from Flask API (not broken Next rewrite in Docker). */
export function resolveProductImageSrc(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) {
    const base =
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
      "http://localhost:8000";
    return `${base}${v}`;
  }
  return v;
}
