"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createCoupon, listCoupons, updateCoupon } from "@/lib/admin-api";
import { apiCouponToUiRow, type UiCouponRow } from "@/lib/admin-mappers";

export const ADMIN_COUPONS_REFRESH_EVENT = "admin-coupons-refresh";
export const ADMIN_COUPON_CREATE_OPEN_EVENT = "admin-coupon-create-open";

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string | null {
  const s = local.trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parsePointsCost(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return 0;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

type CouponFormState = {
  code: string;
  type: "fixed_amount" | "percent";
  discount_amount: string;
  points_cost: string;
  expire_local: string;
  is_active: boolean;
};

function emptyForm(): CouponFormState {
  return {
    code: "",
    type: "fixed_amount",
    discount_amount: "",
    points_cost: "0",
    expire_local: "",
    is_active: true,
  };
}

function rowToForm(row: UiCouponRow): CouponFormState {
  return {
    code: row.id,
    type: row.type === "PERCENT" ? "percent" : "fixed_amount",
    discount_amount: String(row.discount_amount),
    points_cost: String(row.points_cost ?? 0),
    expire_local: toDatetimeLocalValue(row.expiry),
    is_active: row.is_active,
  };
}

export default function CouponTable() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<UiCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<UiCouponRow | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCoupons({ page: 1, per_page: 500 });
      setRows(res.items.map(apiCouponToUiRow));
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "โหลดคูปองไม่สำเร็จ");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener(ADMIN_COUPONS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_COUPONS_REFRESH_EVENT, onRefresh);
  }, [load]);

  useEffect(() => {
    const onOpenCreate = () => {
      setForm(emptyForm());
      setFormError(null);
      setCreateOpen(true);
    };
    window.addEventListener(ADMIN_COUPON_CREATE_OPEN_EVENT, onOpenCreate);
    return () => window.removeEventListener(ADMIN_COUPON_CREATE_OPEN_EVENT, onOpenCreate);
  }, []);

  const openEdit = (row: UiCouponRow) => {
    setForm(rowToForm(row));
    setFormError(null);
    setEditRow(row);
  };

  const closeModals = () => {
    setCreateOpen(false);
    setEditRow(null);
    setFormError(null);
    setSaving(false);
  };

  const submitCreate = async () => {
    setFormError(null);
    const code = form.code.trim();
    if (!code) {
      setFormError("กรุณากรอกรหัสคูปอง");
      return;
    }
    const da = Number(form.discount_amount);
    if (!Number.isFinite(da) || da <= 0) {
      setFormError("ส่วนลดไม่ถูกต้อง");
      return;
    }
    const pc = parsePointsCost(form.points_cost);
    if (pc === null) {
      setFormError("แต้มที่ใช้แลกต้องเป็นจำนวนเต็ม ≥ 0");
      return;
    }
    const expireIso = fromDatetimeLocalValue(form.expire_local);
    setSaving(true);
    try {
      await createCoupon({
        code,
        type: form.type,
        discount_amount: da,
        expire_date: expireIso,
        is_active: form.is_active,
        points_cost: pc,
      });
      window.dispatchEvent(new Event(ADMIN_COUPONS_REFRESH_EVENT));
      closeModals();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "สร้างคูปองไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    setFormError(null);
    const code = form.code.trim();
    if (!code) {
      setFormError("กรุณากรอกรหัสคูปอง");
      return;
    }
    const da = Number(form.discount_amount);
    if (!Number.isFinite(da) || da <= 0) {
      setFormError("ส่วนลดไม่ถูกต้อง");
      return;
    }
    const pc = parsePointsCost(form.points_cost);
    if (pc === null) {
      setFormError("แต้มที่ใช้แลกต้องเป็นจำนวนเต็ม ≥ 0");
      return;
    }
    const expireIso = fromDatetimeLocalValue(form.expire_local);
    setSaving(true);
    try {
      await updateCoupon(editRow.promotion_id, {
        code,
        type: form.type,
        discount_amount: da,
        expire_date: expireIso,
        is_active: form.is_active,
        points_cost: pc,
      });
      window.dispatchEvent(new Event(ADMIN_COUPONS_REFRESH_EVENT));
      closeModals();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const tabs = ["ทั้งหมด", "กำลังใช้งาน (Active)", "หมดอายุ"];

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const q = search.trim().toLowerCase();
    return rows.filter((coupon) => {
      let tabMatch = true;
      const expiry = coupon.expiry ? new Date(coupon.expiry) : null;
      if (activeTab === "กำลังใช้งาน (Active)") {
        tabMatch = coupon.status === "active" && (!expiry || expiry >= now);
      } else if (activeTab === "หมดอายุ") {
        tabMatch = !!expiry && expiry < now;
      }

      const searchMatch =
        q === "" ||
        (coupon.name && coupon.name.toLowerCase().includes(q)) ||
        (coupon.id && coupon.id.toLowerCase().includes(q));

      return tabMatch && searchMatch;
    });
  }, [activeTab, search, rows]);

  const modalOpen = createOpen || !!editRow;

  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.04)] animate-in fade-in duration-700">
      <div className="px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-gradient-to-b from-white/60 to-transparent">
        <div>
          <h3 className="text-[28px] font-black text-[#334155] tracking-tight mb-2">คูปองส่วนลด</h3>
          <p className="text-[#64748B] font-bold text-[15px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f47b2a] animate-pulse"></span>
            ข้อมูลจาก API <code className="text-xs font-mono bg-slate-100 px-1 rounded">/api/admin/coupons</code>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm());
              setFormError(null);
              setCreateOpen(true);
            }}
            className="px-6 py-3 rounded-2xl bg-[#f47b2a] text-white text-sm font-black shadow-md hover:opacity-95 transition-opacity"
          >
            สร้างคูปองใหม่
          </button>
          <div className="flex bg-slate-100/60 p-1.5 rounded-[22px] border border-white shadow-inner backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 sm:px-8 py-3 rounded-2xl text-[12px] sm:text-[13px] font-black tracking-[0.05em] uppercase transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  activeTab === tab
                    ? "bg-white text-[#f47b2a] shadow-[0_8px_16px_rgba(0,0,0,0.08)] scale-100 translate-y-[-1px]"
                    : "text-[#94A3B8] hover:text-[#334155] hover:bg-white/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-12 mb-4 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}

      <div className="px-12 py-6 border-y border-white/40 bg-white/10 flex items-center gap-6">
        <div className="relative flex-1 group">
          <i className="fi fi-rr-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors text-lg"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสคูปอง..."
            className="w-full pl-14 pr-8 py-5 rounded-[24px] border border-white/60 bg-white/40 focus:bg-white focus:border-[#f47b2a] focus:ring-8 focus:ring-orange-500/5 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="px-8 py-5 bg-white border border-white rounded-[24px] shadow-sm flex items-center gap-3 text-[14px] font-black text-slate-600 hover:text-[#f47b2a] hover:border-[#f47b2a] hover:shadow-lg transition-all duration-300"
        >
          <i className="fi fi-rr-refresh"></i>
          รีเฟรช
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 border-b border-white/40">
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">คูปอง</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ส่วนลด</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">แลกแต้ม</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Utilization</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">หมดอายุ</th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-12 py-16 text-center text-slate-400 font-bold">
                  กำลังโหลด…
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-12 py-16 text-center text-slate-400 font-bold">
                  ไม่มีคูปองในชุดนี้
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon, index) => (
                <tr
                  key={`${coupon.promotion_id}-${coupon.id}`}
                  className="hover:bg-white/80 transition-all duration-500 group animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-white group-hover:scale-110 group-hover:rotate-[8deg] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <span className="drop-shadow-sm">🎟️</span>
                      </div>
                      <div>
                        <div className="text-[17px] font-black text-slate-800 mb-1 group-hover:text-[#f47b2a] transition-colors">{coupon.name}</div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/50 rounded-lg border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{coupon.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className="text-[12px] font-black text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm uppercase tracking-wider">{coupon.type}</span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-black text-[#f47b2a]">
                        {coupon.type === "PERCENT" ? `${coupon.discount_amount}%` : `฿${coupon.discount_amount}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className="text-[15px] font-black text-slate-700">
                      {coupon.points_cost > 0 ? `${coupon.points_cost.toLocaleString()} แต้ม` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-8 min-w-[200px]">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[18px] font-black text-slate-800">{coupon.usage}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redeemed</span>
                      </div>
                      <span className="text-[10px] font-black text-[#f47b2a] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                        Cap: {coupon.maxUsage || "∞"}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100/60 rounded-full overflow-hidden p-[2px] border border-white shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                          coupon.status === "inactive" ? "bg-slate-300" : "bg-gradient-to-r from-[#f47b2a] to-[#FF9E5C]"
                        }`}
                        style={{
                          width:
                            coupon.maxUsage > 0
                              ? `${Math.min(100, (coupon.usage / coupon.maxUsage) * 100)}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">ยอดใช้งานยังไม่มีใน API</p>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[13px] font-black text-slate-600">
                        <i className="fi fi-rr-calendar-clock text-[#f47b2a] opacity-60"></i>
                        {coupon.expiry || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                      <span
                        className={`text-[11px] font-black uppercase px-3 py-1 rounded-lg border ${
                          coupon.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : coupon.status === "expired"
                              ? "bg-slate-100 text-slate-500 border-slate-200"
                              : "bg-amber-50 text-amber-800 border-amber-100"
                        }`}
                      >
                        {coupon.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="text-xs font-black px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#f47b2a] hover:text-[#f47b2a] transition-colors"
                      >
                        แก้ไข
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-12 py-10 bg-slate-50/50 border-t border-white/40 flex justify-between items-center">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
          แสดง {filteredCoupons.length} รายการ
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <h4 className="text-xl font-black text-slate-800 mb-1">{createOpen ? "สร้างคูปอง" : "แก้ไขคูปอง"}</h4>
            <p className="text-sm text-slate-500 font-bold mb-6">รหัส ประเภทส่วนลด แต้มที่ใช้แลก (0 = ไม่บังคับแลกแต้ม)</p>
            {formError && <div className="mb-4 text-sm font-bold text-rose-600">{formError}</div>}
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">รหัสคูปอง</span>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  disabled={!!editRow && saving}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">ประเภท</span>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as "fixed_amount" | "percent" }))
                  }
                >
                  <option value="fixed_amount">จำนวนเงิน (fixed_amount)</option>
                  <option value="percent">เปอร์เซ็นต์ (percent)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">
                  {form.type === "percent" ? "เปอร์เซ็นต์ส่วนลด" : "จำนวนเงินส่วนลด (บาท)"}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  value={form.discount_amount}
                  onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">แต้มที่ใช้แลก (points_cost)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  value={form.points_cost}
                  onChange={(e) => setForm((f) => ({ ...f, points_cost: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">หมดอายุ (เว้นว่าง = ไม่หมดอายุ)</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  value={form.expire_local}
                  onChange={(e) => setForm((f) => ({ ...f, expire_local: e.target.value }))}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <span className="text-sm font-black text-slate-700">เปิดใช้งาน (active)</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                onClick={closeModals}
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#f47b2a] text-white font-black disabled:opacity-50"
                disabled={saving}
                onClick={createOpen ? submitCreate : submitEdit}
              >
                {saving ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
