/**
 * Centered spinning ring. Parent should set a min-height (e.g. min-h-[400px]) so this fills the intended area.
 */
export default function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-full min-h-[inherit] w-full flex-1 flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className="h-12 w-12 shrink-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#f47b2a]"
        role="status"
        aria-label="Loading"
      />
      <span className="text-sm font-bold text-slate-500">กำลังโหลด…</span>
    </div>
  );
}
