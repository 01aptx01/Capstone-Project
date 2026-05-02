interface DashboardCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: string;
  valueColor?: string;
}

export default function DashboardCard({ 
  title, 
  value, 
  subValue, 
  icon, 
  trend, 
  trendDirection = "neutral", 
  accentColor = "var(--card-accent)",
  valueColor = "#0F172A"
}: DashboardCardProps) {
  const trendBg = trendDirection === "up" ? "#ECFDF5" : trendDirection === "down" ? "#FEF2F2" : "#FFF7ED";
  const trendColor = trendDirection === "up" ? "#065F46" : trendDirection === "down" ? "#991B1B" : "#C2410C";
  const trendIcon = trendDirection === "up" ? "↗" : trendDirection === "down" ? "↘" : "";

  return (
    <div className="dashboard-metric bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {icon}
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#64748B] mb-1">{title}</div>
            <div className="text-[26px] font-extrabold leading-none flex items-baseline gap-2" style={{ color: valueColor }}>
              <span className="leading-none value-number">{value}</span>
              {subValue && (
                <span className="text-[14px] font-medium text-[#94A3B8]">{subValue}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {trend && (
        <div
          className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold z-10"
          style={{ backgroundColor: trendBg, color: trendColor }}
        >
          {trendIcon} {trend}
        </div>
      )}
    </div>
  );
}



