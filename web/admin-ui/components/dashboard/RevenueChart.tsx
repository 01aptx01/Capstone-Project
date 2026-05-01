"use client";

export default function RevenueChart() {
  // Data points for the chart
  const data = [
    { label: "ม.ค.", val: 40, projected: false },
    { label: "ก.พ.", val: 35, projected: false },
    { label: "มี.ค.", val: 55, projected: false },
    { label: "เม.ย.", val: 85, projected: false },
    { label: "พ.ค. (คาดการณ์)", val: 100, projected: true },
  ];

  const maxVal = 120;
  const height = 240;
  const width = 600;
  const padding = 40;
  
  const points = data.map((d, i) => ({
    x: padding + (i * (width - 2 * padding) / (data.length - 1)),
    y: height - padding - (d.val / maxVal * (height - 2 * padding)),
    projected: d.projected
  }));

  // Path for actual sales (up to the last non-projected point)
  const actualPoints = points.filter(p => !p.projected);
  const lastActual = actualPoints[actualPoints.length - 1];
  const firstProjected = points.find(p => p.projected);
  
  const linePath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${lastActual.x} ${height - padding} L ${padding} ${height - padding} Z`;

  // Path for projection
  const projectionPath = `M ${lastActual.x} ${lastActual.y} L ${firstProjected?.x} ${firstProjected?.y}`;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[18px] font-black text-[#0F172A] mb-1">Revenue Growth & Projections</h3>
          <p className="text-[13px] text-[#64748B]">เปรียบเทียบรายได้จริงกับตัวเลขคาดการณ์ในอนาคต</p>
        </div>
        <div className="flex items-center gap-6 text-[12px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6A00]"></span>
            <span className="text-[#64748B]">ยอดขายจริง</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#FFB27D]"></span>
            <span className="text-[#64748B]">คาดการณ์ (Projected)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Y Axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] font-bold text-[#94A3B8] pr-4 py-[40px]">
          <span>150k</span>
          <span>100k</span>
          <span>50k</span>
          <span>0</span>
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
            </linearGradient>
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
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
          ))}

          {/* Area under the curve */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Projection Line (Dashed) */}
          <path d={projectionPath} stroke="#FFB27D" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
          
          {/* Main Line */}
          <path d={linePath} fill="none" stroke="#FF6A00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="8" fill="white" stroke={p.projected ? "#FFB27D" : "#FF6A00"} strokeWidth="4" />
              {i === points.length - 1 && (
                <circle cx={p.x} cy={p.y} r="12" fill="#FF6A00" fillOpacity="0.2" className="animate-pulse" />
              )}
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="absolute left-0 bottom-0 w-full flex justify-between px-[40px] text-[11px] font-bold text-[#94A3B8]">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
