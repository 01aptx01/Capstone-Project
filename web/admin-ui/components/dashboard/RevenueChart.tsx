"use client";

import { useState } from "react";

export default function RevenueChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = [
    { label: "ม.ค.", val: 40, projected: false },
    { label: "ก.พ.", val: 35, projected: false },
    { label: "มี.ค.", val: 55, projected: false },
    { label: "เม.ย.", val: 85, projected: false },
    { label: "พ.ค.", val: 110, projected: false },
    { label: "มิ.ย.", val: 95, projected: false },
  ];

  const maxVal = 130;
  const height = 300;
  const width = 800;
  const padding = 50;
  
  const points = data.map((d, i) => ({
    x: padding + (i * (width - 2 * padding) / (data.length - 1)),
    y: height - padding - (d.val / maxVal * (height - 2 * padding)),
    val: d.val,
    label: d.label,
    projected: d.projected
  }));

  // Create straight line path
  const getCurvePath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return path;
  };

  const actualPoints = points;
  const lastActual = actualPoints[actualPoints.length - 1];
  
  const linePath = getCurvePath(actualPoints);
  const areaPath = `${linePath} L ${lastActual.x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="vibrant-card !rounded-[40px] p-10 h-full shadow-2xl shadow-orange-900/[0.03] group/chart">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[24px] font-black text-[#334155] tracking-tight">กราฟยอดการขาย</h3>
          </div>
          <p className="text-[14px] font-semibold text-slate-400">วิเคราะห์ประสิทธิภาพการทำงานและแนวโน้มยอดขายเชิงลึก</p>
        </div>
      </div>

      <div className="relative w-full overflow-visible" style={{ height: `${height}px` }}>
        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute z-30 pointer-events-none transition-all duration-300 ease-out animate-in fade-in zoom-in"
            style={{ 
              left: `${points[hoveredIndex].x}px`, 
              top: `${points[hoveredIndex].y - 80}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-4 min-w-[120px] text-center">
              <div className="text-[11px] font-black text-slate-400 uppercase mb-1">{points[hoveredIndex].label}</div>
              <div className="text-[20px] font-black text-[#334155]">฿{points[hoveredIndex].val}k</div>
            </div>
            <div className="w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white mx-auto -mt-1.5 backdrop-blur-xl"></div>
          </div>
        )}

        {/* Y Axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[13px] font-bold text-slate-500 pr-6 py-[50px]">
          <span>150k</span>
          <span>100k</span>
          <span>50k</span>
          <span>0</span>
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f47b2a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f47b2a" stopOpacity="0" />
            </linearGradient>
            <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 1, 2, 3].map((i) => (
            <line 
              key={i}
              x1={padding} 
              y1={padding + (i * (height - 2 * padding) / 3)} 
              x2={width - padding} 
              y2={padding + (i * (height - 2 * padding) / 3)} 
              stroke="#F1F5F9" 
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area (Removed for clean styling) */}

          {/* Main Curve */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="#f47b2a" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="drop-shadow-[0_8px_16px_rgba(244,123,42,0.25)] animate-in fade-in duration-700"
          />

          {/* Vertical Hover Indicator */}
          {hoveredIndex !== null && (
            <line 
              x1={points[hoveredIndex].x} 
              y1={padding} 
              x2={points[hoveredIndex].x} 
              y2={height - padding} 
              stroke="#f47b2a" 
              strokeWidth="2" 
              strokeOpacity="0.2"
              className="animate-in fade-in"
            />
          )}

          {/* Interactive Points */}
          {points.map((p, i) => (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)} 
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="16" 
                fill="transparent" 
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredIndex === i ? "10" : "7"} 
                fill="white" 
                stroke="#f47b2a" 
                strokeWidth={hoveredIndex === i ? "5" : "4"} 
                className="transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              {i === actualPoints.length - 1 && !hoveredIndex && (
                <circle cx={p.x} cy={p.y} r="16" fill="#f47b2a" fillOpacity="0.1" className="animate-ping" />
              )}
            </g>
          ))}
        </svg>

        {/* X Axis */}
        <div className="absolute left-0 bottom-0 w-full flex justify-between px-[50px] text-[14px] font-bold text-slate-600 uppercase tracking-widest">
          {data.map((d, i) => (
            <span key={i} className={hoveredIndex === i ? "text-[#f47b2a] transition-colors" : ""}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

