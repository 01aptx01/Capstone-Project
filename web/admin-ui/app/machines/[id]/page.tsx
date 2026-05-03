"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMachine } from "@/lib/admin-api";
import type { ApiMachineDetail } from "@/lib/admin-api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MachineDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [machine, setMachine] = useState<ApiMachineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await getMachine(decodeURIComponent(id));
        if (!cancelled) setMachine(m);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "โหลดข้อมูลตู้ไม่สำเร็จ");
          setMachine(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalUnits =
    machine?.slots?.reduce((s, sl) => s + (sl.quantity || 0), 0) ?? 0;
  const isOnline = machine?.status === "online";

  const metrics = machine
    ? [
        {
          title: "ช่องทั้งหมด",
          value: String(machine.slots?.length ?? 0),
          color: "#1e293b",
        },
        {
          title: "จำนวนชิ้นในตู้",
          value: String(totalUnits),
          color: "#1e293b",
        },
        {
          title: "อัปเดตล่าสุด",
          value: machine.last_active || "—",
          color: "#64748B",
        },
        {
          title: "สถานะ",
          value: machine.status,
          color: isOnline ? "#10B981" : "#F43F5E",
        },
      ]
    : [];

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#FF6A00] hover:border-[#FF6A00] hover:shadow-md transition-all group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-black text-[#1e293b]">
                {loading ? "…" : machine?.machine_code || id}
              </h1>
              {!loading && machine && (
                <span
                  className={`px-3 py-1 text-[12px] font-bold rounded-full border flex items-center gap-1.5 ${
                    isOnline
                      ? "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#10B981] animate-pulse" : "bg-rose-500"}`}
                  ></span>
                  {machine.status}
                </span>
              )}
            </div>
            <div className="text-[14px] font-bold text-[#94A3B8]">
              {machine?.location || id}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}

      {!loading && machine && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              >
                <div className="text-[13px] font-bold text-[#64748B] mb-2">{m.title}</div>
                <div className="text-[22px] font-black leading-tight break-all" style={{ color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-[18px] font-black text-[#1e293b] mb-6">สต็อกตามช่อง</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-2 font-black text-slate-400">ช่อง</th>
                    <th className="py-3 px-2 font-black text-slate-400">สินค้า</th>
                    <th className="py-3 px-2 font-black text-slate-400">จำนวน</th>
                    <th className="py-3 px-2 font-black text-slate-400">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  {(machine.slots || [])
                    .slice()
                    .sort((a, b) => a.slot_number - b.slot_number)
                    .map((s) => (
                      <tr key={s.id} className="border-b border-slate-50">
                        <td className="py-3 px-2 font-bold">{s.slot_number}</td>
                        <td className="py-3 px-2">
                          {s.product?.name || `product #${s.product_id}`}
                        </td>
                        <td className="py-3 px-2 font-black">{s.quantity}</td>
                        <td className="py-3 px-2">
                          {s.product != null ? `฿${Number(s.product.price).toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
