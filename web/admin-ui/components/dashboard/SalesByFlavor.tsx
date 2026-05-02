"use client";

export default function SalesByFlavor() {
  const flavors = [
    { name: "สตรอว์เบอร์รี (Strawberry)", value: 45020, percentage: 38 },
    { name: "ช็อกโกแลต (Chocolate)", value: 35140, percentage: 30 },
    { name: "วานิลลา (Vanilla)", value: 20500, percentage: 17 },
    { name: "ชาเขียวมัทฉะ (Matcha)", value: 17800, percentage: 15 },
  ];

  return (
    <div className="vibrant-card !rounded-[40px] p-8 h-full shadow-2xl shadow-orange-900/[0.03]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-[22px] font-black text-[#334155] tracking-tight mb-1">Sales by Flavor</h3>
          <p className="text-[14px] font-semibold text-slate-400">Popularity across flavors</p>
        </div>
      </div>

      <div className="space-y-8">
        {flavors.map((flavor, i) => (
          <div key={i} className="group animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-[#f47b2a] transition-colors duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f47b2a] group-hover:text-white transition-colors">
                    <path d="M17 10c-2-2-4 0-5 0s-3-2-5 0-3 2-3 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8s-1-2-3-2Z"/>
                    <path d="M12 10V6"/>
                    <path d="M10 4a2 2 0 1 1 4 0"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[15px] font-black text-[#334155] block mb-0.5">
                    {flavor.name}
                  </span>
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{flavor.percentage}% Contribution</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-black text-[#334155] block">฿{flavor.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2.5 bg-slate-100/80 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-[#f47b2a] to-[#FF9E5C] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_12px_rgba(244,123,42,0.3)]"
                style={{ width: `${flavor.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
