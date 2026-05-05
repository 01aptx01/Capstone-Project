"use client";

import { useLang } from "@/lib/i18n/lang";

export default function SalesByFlavor() {
  const { t } = useLang();
  const flavors = [
    { name: t("salesByFlavor.f1"), value: 75240, percentage: 30 },
    { name: t("salesByFlavor.f2"), value: 62700, percentage: 25 },
    { name: t("salesByFlavor.f3"), value: 37620, percentage: 15 },
    { name: t("salesByFlavor.f4"), value: 30100, percentage: 12 },
    { name: t("salesByFlavor.f5"), value: 25080, percentage: 10 },
    { name: t("salesByFlavor.f6"), value: 20060, percentage: 8 },
  ];

  return (
    <div className="vibrant-card !rounded-[40px] p-8 h-full shadow-2xl shadow-orange-900/[0.03]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-[22px] font-black text-[var(--text)] tracking-tight mb-1">{t("salesByFlavor.title")}</h3>
          <p className="text-[14px] font-semibold text-[var(--text-muted)]">{t("salesByFlavor.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-8">
        {flavors.map((flavor, i) => (
          <div key={i} className="group animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] group-hover:text-[var(--primary-contrast)] transition-colors">
                    <path d="M17 10c-2-2-4 0-5 0s-3-2-5 0-3 2-3 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8s-1-2-3-2Z"/>
                    <path d="M12 10V6"/>
                    <path d="M10 4a2 2 0 1 1 4 0"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[15px] font-black text-[var(--text)] block mb-0.5">
                    {flavor.name}
                  </span>
                  <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("salesByLocation.contribution").replace("{n}", String(flavor.percentage))}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-black text-[var(--text)] block">฿{flavor.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2.5 bg-[var(--surface-2)]/80 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_12px_rgba(244,123,42,0.3)]"
                style={{ width: `${flavor.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
