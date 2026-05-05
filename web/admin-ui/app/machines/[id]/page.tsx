"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getMachine,
  listProducts,
  updateMachineSlots,
  type ApiMachineDetail,
  type ApiMachineSlotInput,
  type ApiProduct,
} from "@/lib/admin-api";

const MAX_SLOTS_PER_MACHINE = 24;

type SlotDraftRow = {
  rowKey: string;
  slot_number: number;
  product_id: number;
  quantity: number;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function slotsToDraft(slots: ApiMachineDetail["slots"]): SlotDraftRow[] {
  return (slots || [])
    .slice()
    .sort((a, b) => a.slot_number - b.slot_number)
    .map((s) => ({
      rowKey: `slot-${s.slot_number}`,
      slot_number: s.slot_number,
      product_id: s.product_id,
      quantity: s.quantity,
    }));
}

export default function MachineDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [machine, setMachine] = useState<ApiMachineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [slotDraft, setSlotDraft] = useState<SlotDraftRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const machineCode = machine?.machine_code ?? decodeURIComponent(id);

  const loadMachine = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getMachine(decodeURIComponent(id));
      setMachine(m);
      setSlotDraft(slotsToDraft(m.slots));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMachine();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "โหลดข้อมูลตู้ไม่สำเร็จ");
          setMachine(null);
          setSlotDraft([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMachine]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadMachine();
      toast.success("รีเฟรชข้อมูลจากระบบแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "รีเฟรชไม่สำเร็จ");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const first = await listProducts({ page: 1, per_page: 100 });
        const items = [...(first.items || [])];
        let page = 1;
        const pages = first.pages || 1;
        while (!cancelled && page < pages && page < 20) {
          page += 1;
          const next = await listProducts({ page, per_page: 100 });
          items.push(...(next.items || []));
        }
        if (!cancelled) setProducts(items);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productById = useMemo(() => {
    const m = new Map<number, ApiProduct>();
    for (const p of products) m.set(p.product_id, p);
    return m;
  }, [products]);

  const totalUnits = useMemo(
    () => slotDraft.reduce((s, sl) => s + (Number(sl.quantity) || 0), 0),
    [slotDraft]
  );

  const opStatus = (machine?.status || "online").toLowerCase();
  const operationalOnline = opStatus === "online";
  const operationalMaintenance = opStatus === "maintenance";

  const metrics = machine
    ? [
        {
          title: "ช่องทั้งหมด",
          value: String(slotDraft.length),
          color: "#1e293b",
        },
        {
          title: "จำนวนชิ้นในตู้",
          value: String(totalUnits),
          color: "#1e293b",
        },
        {
          title: "เชื่อมต่อ Socket (is_online)",
          value: machine.is_online ? "เชื่อมต่อ" : "ไม่เชื่อมต่อ",
          color: machine.is_online ? "#0ea5e9" : "#94a3b8",
        },
        {
          title: "อัปเดตล่าสุด (DB)",
          value: machine.last_active || "—",
          color: "#64748B",
        },
        {
          title: "สถานะปฏิบัติการ (status)",
          value: machine.status,
          color: operationalOnline
            ? "#10B981"
            : operationalMaintenance
              ? "#d97706"
              : "#F43F5E",
        },
      ]
    : [];

  const addSlotRow = () => {
    const nextNum =
      slotDraft.length === 0
        ? 1
        : Math.max(...slotDraft.map((r) => r.slot_number), 0) + 1;
    if (nextNum > MAX_SLOTS_PER_MACHINE) return;
    const defaultPid = products[0]?.product_id ?? 1;
    setSlotDraft((prev) => [
      ...prev,
      {
        rowKey: `new-${nextNum}-${Date.now()}`,
        slot_number: nextNum,
        product_id: defaultPid,
        quantity: 0,
      },
    ]);
  };

  const removeSlotRow = (rowKey: string) => {
    setSlotDraft((prev) => prev.filter((r) => r.rowKey !== rowKey));
  };

  const updateDraftRow = (
    rowKey: string,
    patch: Partial<Pick<SlotDraftRow, "product_id" | "quantity">>
  ) => {
    setSlotDraft((prev) =>
      prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r))
    );
  };

  const handleSaveSlots = async () => {
    if (!machine) return;
    setSaving(true);
    setError(null);
    const payload: ApiMachineSlotInput[] = slotDraft
      .slice()
      .sort((a, b) => a.slot_number - b.slot_number)
      .map((r) => ({
        slot_number: r.slot_number,
        product_id: r.product_id,
        quantity: Math.max(0, Math.floor(Number(r.quantity) || 0)),
      }));
    try {
      const updated = await updateMachineSlots(machine.machine_code, payload);
      setMachine(updated);
      setSlotDraft(slotsToDraft(updated.slots));
      toast.success("บันทึกสต็อกแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกสต็อกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                    operationalOnline
                      ? "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]"
                      : operationalMaintenance
                        ? "bg-amber-50 text-amber-800 border-amber-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      operationalOnline
                        ? "bg-[#10B981] animate-pulse"
                        : operationalMaintenance
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                  ></span>
                  {machine.status}
                </span>
              )}
            </div>
            <div className="text-[14px] font-bold text-[#94A3B8]">
              {machine?.location?.trim()
                ? machine.location
                : "ไม่ระบุสถานที่"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing}
          className="shrink-0 self-start px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#64748B] hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50 transition-colors"
        >
          {refreshing ? "กำลังรีเฟรช…" : "รีเฟรชจากระบบ"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}

      {!loading && machine && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-[18px] font-black text-[#1e293b]">สต็อกตามช่อง</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addSlotRow}
                  disabled={
                    saving ||
                    productsLoading ||
                    slotDraft.length >= MAX_SLOTS_PER_MACHINE ||
                    products.length === 0
                  }
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#64748B] hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  เพิ่มช่อง
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (machine) setSlotDraft(slotsToDraft(machine.slots));
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#64748B] hover:border-slate-400 disabled:opacity-50 transition-colors"
                >
                  ยกเลิกการแก้ไข
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlots}
                  disabled={saving || productsLoading}
                  className="px-4 py-2 rounded-xl bg-[#FF6A00] text-white text-[13px] font-bold hover:bg-[#e85f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "กำลังบันทึก…" : "บันทึกสต็อก"}
                </button>
              </div>
            </div>
            {productsLoading && (
              <p className="text-[13px] font-bold text-[#94A3B8] mb-4">กำลังโหลดรายการสินค้า…</p>
            )}
            {!productsLoading && products.length === 0 && (
              <p className="text-[13px] font-bold text-amber-700 mb-4">
                ยังไม่มีสินค้าในระบบ — เพิ่มสินค้าก่อนจึงจะตั้งสต็อกตู้ได้
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-2 font-black text-slate-400">ช่อง</th>
                    <th className="py-3 px-2 font-black text-slate-400">สินค้า</th>
                    <th className="py-3 px-2 font-black text-slate-400">จำนวน</th>
                    <th className="py-3 px-2 font-black text-slate-400">ราคา</th>
                    <th className="py-3 px-2 font-black text-slate-400 w-24"> </th>
                  </tr>
                </thead>
                <tbody>
                  {slotDraft.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 px-2 text-center font-bold text-[#94A3B8]">
                        ยังไม่มีช่องสต็อก — กด &quot;เพิ่มช่อง&quot; เพื่อเริ่มต้น
                      </td>
                    </tr>
                  )}
                  {slotDraft
                    .slice()
                    .sort((a, b) => a.slot_number - b.slot_number)
                    .map((row) => {
                      const prod = productById.get(row.product_id);
                      return (
                        <tr key={row.rowKey} className="border-b border-slate-50">
                          <td className="py-3 px-2 font-bold align-middle">{row.slot_number}</td>
                          <td className="py-3 px-2 align-middle">
                            <select
                              className="w-full max-w-[280px] rounded-lg border border-slate-200 px-2 py-1.5 font-bold text-[#1e293b] bg-white"
                              value={row.product_id}
                              onChange={(e) =>
                                updateDraftRow(row.rowKey, {
                                  product_id: Number(e.target.value),
                                })
                              }
                              disabled={saving || products.length === 0}
                            >
                              {!products.some((p) => p.product_id === row.product_id) && (
                                <option value={row.product_id}>
                                  #{row.product_id} (ไม่พบในรายการ)
                                </option>
                              )}
                              {products.map((p) => (
                                <option key={p.product_id} value={p.product_id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-2 align-middle">
                            <input
                              type="number"
                              min={0}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 font-black text-[#1e293b]"
                              value={row.quantity}
                              onChange={(e) =>
                                updateDraftRow(row.rowKey, {
                                  quantity: Number(e.target.value),
                                })
                              }
                              disabled={saving}
                            />
                          </td>
                          <td className="py-3 px-2 align-middle font-bold">
                            {prod != null ? `฿${Number(prod.price).toFixed(2)}` : "—"}
                          </td>
                          <td className="py-3 px-2 align-middle">
                            <button
                              type="button"
                              onClick={() => removeSlotRow(row.rowKey)}
                              disabled={saving}
                              className="text-[12px] font-bold text-rose-600 hover:underline disabled:opacity-50"
                            >
                              ลบช่อง
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[12px] font-bold text-[#94A3B8]">
              ตู้: {machineCode} — บันทึกจะแทนที่สต็อกทั้งหมดของตู้นี้ (สูงสุด {MAX_SLOTS_PER_MACHINE}{" "}
              ช่อง)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
