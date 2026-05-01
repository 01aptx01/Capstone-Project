"use client";

export default function SalesByLocation() {
  const locations = [
    { name: "อาคารการเรียนรู้พหุวิทยาการ LX", value: 56025, percentage: 45 },
    { name: "อาคารคณะวิศวกรรมศาสตร์ S11", value: 32140, percentage: 26 },
    { name: "อาคาร CB1", value: 24335, percentage: 19 },
    { name: "หอพักนักศึกษา", value: 12000, percentage: 10 },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-[18px] font-black text-[#0F172A] mb-1">Sales by Location</h3>
          <p className="text-[13px] text-[#64748B]">ยอดขายแบ่งตามพื้นที่จัดตั้ง</p>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-white hover:border-[#FF6A00] transition-all">
            Filter Locations...
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {locations.map((loc, i) => (
          <div key={i} className="group">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#FFF7ED] rounded-lg flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <span className="text-[14px] font-bold text-[#334155] group-hover:text-[#FF6A00] transition-colors cursor-default">
                  {loc.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[15px] font-black text-[#0F172A]">฿{loc.value.toLocaleString()}</span>
                <span className="text-[12px] font-bold text-[#94A3B8] ml-2">({loc.percentage}%)</span>
              </div>
            </div>
            <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E5C] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,106,0,0.2)]"
                style={{ width: `${loc.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
