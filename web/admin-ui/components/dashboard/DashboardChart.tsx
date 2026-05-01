"use client";

import { useState } from "react";

const sampleData = [20, 40, 120, 240, 310, 210, 140, 80];
const labels = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];
const yLabels = ["$400", "$300", "$200", "$100", "$0"];

export default function DashboardChart() {
  const [period, setPeriod] = useState("Day");
  const maxValue = 400;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[18px] font-bold text-[#0F172A]">
          แนวโน้มยอดขาย <span className="text-[#64748B] font-medium ml-1">(Real-time)</span>
        </h3>
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          {["Day", "Week", "Month"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                period === p ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[300px] w-full flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[12px] font-medium text-[#94A3B8] pr-6 pb-6 h-[260px]">
          {yLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative h-[260px]">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-[#E2E8F0]" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around px-4">
            {sampleData.map((v, i) => {
              const heightPercent = (v / maxValue) * 100;
              const isHighlighted = labels[i] === "2pm";
              return (
                <div key={i} className="group relative flex flex-col items-center w-12">
                  <div 
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isHighlighted ? "bg-[#FF6A00]" : "bg-[#FFDAB5] hover:bg-[#FFC68C]"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="absolute -bottom-8 whitespace-nowrap text-[12px] font-bold text-[#64748B]">
                    {labels[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

