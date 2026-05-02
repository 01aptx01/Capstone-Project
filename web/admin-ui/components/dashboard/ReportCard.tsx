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
  iconBg = "#FFF7ED",
  iconColor = "#FF6A00"
}: ReportCardProps) {
  if (isFeatured) {
    return (
      <div className="relative overflow-hidden bg-[#10B981] rounded-[24px] p-6 text-white shadow-[0_20px_50px_rgba(16,185,129,0.2)] h-full flex flex-col justify-between" role="region" aria-label={title}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="text-[14px] font-bold opacity-90">{title}</div>
            {trend && (
              <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[12px] font-bold" role="status" aria-label={`Trend ${trend}`}>{trendDirection === "up" ? "+" : ""}{trend}</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="text-[42px] font-black leading-none mb-2">{value}</div>
          {subValue && <div className="text-[12px] font-medium opacity-90 text-center">{subValue}</div>}
        </div>

        {/* Abstract background shape */}
        <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 110L40 70L70 90L110 30" stroke="white" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    );
  }

  const trendColor = trendDirection === "up" ? "#10B981" : trendDirection === "down" ? "#EF4444" : "#64748B";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 h-full flex flex-col justify-between" role="region" aria-label={title}>
      <div className="flex justify-between items-start mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border"
          style={{ backgroundColor: iconBg, borderColor: `${iconBg}CC`, color: iconColor }}
          aria-hidden={icon ? "true" : "false"}
        >
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 font-bold text-[12px]" style={{ color: trendColor }} role="status" aria-label={`Trend ${trend}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-[13px] font-bold text-[#64748B] mb-1">{title}</div>
        <div className="text-[28px] font-black text-[#0F172A] leading-tight flex items-baseline gap-1">
          {value}
          {subValue && <span className="text-[13px] font-medium text-[#94A3B8]">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}
