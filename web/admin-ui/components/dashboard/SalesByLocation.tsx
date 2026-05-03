"use client";

export default function SalesByLocation() {
  const locations = [
    { name: "อาคาร LX (พหุวิทยาการ)", value: 56025, percentage: 45 },
    { name: "อาคารวิศวกรรมศาสตร์ S11", value: 32140, percentage: 26 },
    { name: "อาคาร CB1", value: 24335, percentage: 19 },
    { name: "หอพักนักศึกษา", value: 12000, percentage: 10 },
  ];

  return (
    <div className="vibrant-card !rounded-[40px] p-8 h-full shadow-2xl shadow-orange-900/[0.03]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-[22px] font-black text-[#334155] tracking-tight mb-1">Sales by Location</h3>
          <p className="text-[14px] font-semibold text-slate-400">Distribution across campus</p>
        </div>
      </div>

      <div className="space-y-8">
        {locations.map((loc, i) => (
          <div key={i} className="group animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-[#f47b2a] transition-colors duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f47b2a] group-hover:text-white transition-colors">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <span className="text-[15px] font-black text-[#334155] block mb-0.5">
                    {loc.name}
                  </span>
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{loc.percentage}% Contribution</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-black text-[#334155] block">฿{loc.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2.5 bg-slate-100/80 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-[#f47b2a] to-[#FF9E5C] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_12px_rgba(244,123,42,0.3)]"
                style={{ width: `${loc.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

