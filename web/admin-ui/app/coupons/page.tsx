"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import CouponTable from "@/components/customers/CouponTable";

export default function CouponsPage() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">คูปอง</h1>
          <p className="text-[#64748B] text-[16px] font-medium">
            จัดการคูปองและแคมเปญในระบบ
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <CouponTable />
      </div>
    </PageWrapper>
  );
}
