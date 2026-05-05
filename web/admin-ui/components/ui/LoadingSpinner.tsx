"use client";

import { useLang } from "@/lib/i18n/lang";

/**
 * Centered spinning ring. Parent should set a min-height (e.g. min-h-[400px]) so this fills the intended area.
 */
export default function LoadingSpinner({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { t } = useLang();
  const text = label ?? t("common.loading");
  return (
    <div
      className={`flex h-full min-h-[inherit] w-full flex-1 flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className="h-12 w-12 shrink-0 animate-spin rounded-full border-4"
        style={{
          borderColor: "var(--border)",
          borderTopColor: "var(--primary)",
        }}
        role="status"
        aria-label={text}
      />
      <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
        {text}
      </span>
    </div>
  );
}
