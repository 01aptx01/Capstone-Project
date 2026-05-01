"use client";

export default function EfficiencyChart() {
  const percentage = 90;
  const radius = 55;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full">
      <h3 className="text-[18px] font-black text-[#0F172A] mb-8">Machine Efficiency</h3>
      
      <div className="flex flex-col items-center justify-center mb-8 relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#F1F5F9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#10B981"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-[24px] font-black text-[#0F172A] leading-none">{percentage}%</span>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
            <span className="text-[13px] font-bold text-[#64748B]">ตู้ที่ทำงานปกติ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-black text-[#0F172A]">45</span>
            <span className="text-[11px] font-medium text-[#94A3B8]">ตู้</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#FFF7ED] rounded-2xl border border-[#FFEDD5]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]"></div>
            <span className="text-[13px] font-bold text-[#64748B]">ซ่อมบำรุง / ออฟไลน์</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-black text-[#0F172A]">5</span>
            <span className="text-[11px] font-medium text-[#94A3B8]">ตู้</span>
          </div>
        </div>
      </div>
    </div>
  );
}
