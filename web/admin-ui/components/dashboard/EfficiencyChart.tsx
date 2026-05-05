"use client";

export default function EfficiencyChart() {
  const percentage = 90;
  const size = 180;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="vibrant-card !rounded-[40px] p-8 h-full shadow-2xl shadow-orange-900/[0.03] flex flex-col">
      <div className="mb-8">
        <h3 className="text-[22px] font-black text-[var(--text)] tracking-tight mb-1">System Efficiency</h3>
        <p className="text-[14px] font-semibold text-[var(--text-muted)]">Real-time machine health status</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center mb-8 relative">
        <svg height={size} width={size} className="transform -rotate-90 filter drop-shadow-2xl">
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--success)" />
              <stop offset="100%" stopColor="var(--success)" />
            </linearGradient>
            <filter id="outerGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle
            stroke="var(--surface-2)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-scale-in">
          <div className="bg-[var(--surface-1)]/40 backdrop-blur-md rounded-full w-[120px] h-[120px] flex flex-col items-center justify-center border border-[var(--border)]/60 shadow-inner">
            <span className="text-[42px] font-black text-[var(--text)] leading-none mb-1">{percentage}%</span>
            <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.2em]">Optimal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--success-bg)]/40 rounded-[24px] border border-emerald-100/50 group hover:bg-[var(--success-bg)] transition-all duration-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--success-bg)]0 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"></div>
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-black text-[var(--text)]">45</span>
              <span className="text-[12px] font-bold text-[var(--text-muted)]">UNITS</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[var(--surface-2)]/50 rounded-[24px] border border-[var(--border)] group hover:bg-orange-50/50 hover:border-orange-100 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]"></div>
              <span className="text-[11px] font-black text-[var(--text)]0 uppercase tracking-wider">Maint.</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-black text-[var(--text)]">5</span>
              <span className="text-[12px] font-bold text-[var(--text-muted)]">UNITS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

