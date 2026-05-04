"use client";

import type { ApiCustomer } from "@/lib/admin-api";

type Props = {
  customers: ApiCustomer[];
  loading?: boolean;
  error?: string | null;
};

export default function CustomerTable({ customers, loading, error }: Props) {
  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.04)] animate-in fade-in duration-700">
      <div className="px-10 py-8 border-b border-white/40 bg-gradient-to-b from-white/50 to-transparent">
        <h2 className="text-[22px] font-black text-[#334155] tracking-tight mb-1">รายชื่อสมาชิก</h2>
        <p className="text-[#64748B] text-sm font-bold">
          ข้อมูลจาก <code className="text-xs font-mono bg-slate-100 px-1 rounded">/api/admin/customers</code>{" "}
          (ชุดที่โหลดในหน้านี้)
        </p>
      </div>
      {error && (
        <div className="mx-10 my-4 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/40 border-b border-white/40">
              <th className="px-10 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">เบอร์โทร</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">แต้ม</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">สมัครเมื่อ</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ใช้งานล่าสุด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/30">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-10 py-14 text-center text-slate-400 font-bold">
                  กำลังโหลด…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-10 py-14 text-center text-slate-400 font-bold">
                  ยังไม่มีสมาชิกในชุดนี้
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.user_id} className="hover:bg-white/70 transition-colors">
                  <td className="px-10 py-4 font-black text-slate-800">{c.phone_number}</td>
                  <td className="px-6 py-4 font-bold text-[#f47b2a]">{c.points?.toLocaleString?.() ?? c.points}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-10 py-4 text-sm font-bold text-slate-600">
                    {c.registered_at ? new Date(c.registered_at).toLocaleString("th-TH") : "—"}
                  </td>
                  <td className="px-10 py-4 text-sm font-bold text-slate-600">
                    {c.last_use ? new Date(c.last_use).toLocaleString("th-TH") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-10 py-5 bg-slate-50/40 border-t border-white/40 text-xs font-bold text-slate-400 uppercase tracking-widest">
        แสดง {customers.length} รายการ
      </div>
    </div>
  );
}
