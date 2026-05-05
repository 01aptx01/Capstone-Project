interface ReportCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  isFeatured?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export default function ReportCard({
  title,
  value,
  subValue,
  trend,
  trendDirection = "up",
  isFeatured = false,
  icon,
  iconBg = "var(--warn-bg)",
  iconColor = "var(--primary)"
}: ReportCardProps) {
  if (isFeatured) {
    return (
      <div
        className="relative overflow-hidden rounded-[32px] p-4 xl:p-6 h-full flex flex-col justify-between group animate-scale-in border"
        style={{
          background: "var(--primary)",
          color: "var(--primary-contrast)",
          boxShadow: "var(--shadow-primary)",
          borderColor: "var(--border)",
        }}
        role="region"
        aria-label={title}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[12px] font-black uppercase tracking-[0.1em] opacity-80">{title}</div>
            {trend && (
              <div
                className="backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black border flex items-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  borderColor: "rgba(255,255,255,0.18)",
                }}
                role="status"
                aria-label={`Trend ${trend}`}
              >
                <span className="text-[12px]">{trendDirection === "up" ? "↗" : "↘"}</span>
                {trend}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center flex-col relative z-10 py-4">
          <div className="text-[32px] xl:text-[40px] font-black leading-none mb-3 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] tracking-tighter">{value}</div>
          {subValue && (
            <div
              className="text-[11px] font-bold opacity-100 text-center tracking-wide px-4 py-2 rounded-[16px] backdrop-blur-md border shadow-inner"
              style={{
                background: "rgba(2, 6, 23, 0.22)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              {subValue}
            </div>
          )}
        </div>

        {/* Abstract background decorative element */}
        <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" style={{ background: "rgba(255,255,255,0.10)" }}></div>
        <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full blur-2xl group-hover:translate-x-12 transition-transform duration-1000" style={{ background: "rgba(255,255,255,0.08)" }}></div>
        
        <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "linear-gradient(45deg, rgba(255,255,255,0), rgba(255,255,255,0.06), rgba(255,255,255,0.10))" }}></div>
      </div>
    );
  }

  const trendColor =
    trendDirection === "up"
      ? "var(--success)"
      : trendDirection === "down"
        ? "var(--danger)"
        : "var(--text-muted)";

  return (
    <div
      className="vibrant-card !rounded-[32px] p-4 xl:p-6 group animate-scale-in h-full flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 border"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
      role="region"
      aria-label={title}
    >
      <div className="flex justify-between items-start mb-6">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg border border-[var(--border)] transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110"
          style={{ backgroundColor: iconBg, color: iconColor }}
          aria-hidden={icon ? "true" : "false"}
        >
          <div className="drop-shadow-sm">{icon}</div>
        </div>
        {trend && (
          <div
            className="flex items-center gap-1.5 font-black text-[12px] backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm"
            style={{
              color: trendColor,
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
            role="status"
            aria-label={`Trend ${trend}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={trendDirection === "up" ? "group-hover:animate-bounce" : ""}>
              {trendDirection === "up" ? (
                <path d="M7 17l9-9M16 17V8H7" />
              ) : (
                <path d="M7 7l9 9M16 7v9H7" />
              )}
            </svg>
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-[13px] xl:text-[15px] font-black mb-1.5" style={{ color: "var(--text-muted)" }}>{title}</div>
        <div className="text-[22px] xl:text-[28px] font-black leading-none flex items-baseline gap-1.5" style={{ color: "var(--text)" }}>
          {value}
          {subValue && <span className="text-[13px] font-bold tracking-wide" style={{ color: "var(--text-muted)" }}>{subValue}</span>}
        </div>
      </div>
    </div>
  );
}
