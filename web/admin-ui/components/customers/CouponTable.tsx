"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { listCoupons, updateCoupon } from "@/lib/admin-api";
import { apiCouponToUiRow, type UiCouponRow } from "@/lib/admin-mappers";
import { useUI } from "@/lib/context/UIContext";

export const ADMIN_COUPONS_REFRESH_EVENT = "admin-coupons-refresh";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

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

type FilterState = {
  status: "all" | "active" | "inactive" | "expired";
  type: "all" | "PERCENT" | "FIXED";
  expiryDate: string;
};

const initialFilters: FilterState = {
  status: "all",
  type: "all",
  expiryDate: "",
};

export default function CouponTable() {
  const { openCreateCoupon } = useUI();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<UiCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editRow, setEditRow] = useState<UiCouponRow | null>(null);
  const [form, setForm] = useState<CouponFormState>(() => ({
    code: "",
    type: "fixed_amount",
    discount_amount: "",
    points_cost: "0",
    expire_local: "",
    is_active: true,
  }));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

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

  const openEdit = (row: UiCouponRow) => {
    setForm(rowToForm(row));
    setFormError(null);
    setEditRow(row);
  };

  const closeEditModal = () => {
    setEditRow(null);
    setFormError(null);
    setSaving(false);
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
      closeEditModal();
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

      const statusMatch =
        filters.status === "all" ||
        (filters.status === "expired"
          ? !!expiry && expiry < now
          : coupon.status === filters.status);
      const typeMatch =
        filters.type === "all" ||
        (filters.type === "PERCENT" ? coupon.type === "PERCENT" : coupon.type !== "PERCENT");
      const dateMatch =
        !filters.expiryDate ||
        (coupon.expiry
          ? new Date(coupon.expiry).toISOString().slice(0, 10) === filters.expiryDate
          : false);

      return tabMatch && searchMatch && statusMatch && typeMatch && dateMatch;
    });
  }, [activeTab, search, rows, filters]);

  const clearFilters = () => {
    setFilters(initialFilters);
    setIsFilterOpen(false);
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.type !== "all" || !!filters.expiryDate;

  return (
    <div className="rounded-[48px] overflow-hidden animate-in fade-in duration-700 surface-card" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" style={{ background: "var(--surface-1)" }}>
        <div>
          <h3 className="text-[28px] font-black text-[var(--text)] tracking-tight mb-2">คูปองส่วนลด</h3>
          <p className="text-[var(--text-muted)] font-bold text-[15px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
            ข้อมูลจาก API <code className="text-xs font-mono bg-[var(--surface-2)] px-1 rounded">/api/admin/coupons</code>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={openCreateCoupon}
            className="px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)] text-sm font-black shadow-md hover:opacity-95 transition-opacity"
          >
            สร้างคูปองใหม่
          </button>
          <div className="flex bg-[var(--surface-2)]/60 p-1.5 rounded-[22px] border border-[var(--border)] shadow-inner backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 sm:px-8 py-3 rounded-2xl text-[12px] sm:text-[13px] font-black tracking-[0.05em] uppercase transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  activeTab === tab
                    ? "bg-[var(--surface-1)] text-[var(--primary)] shadow-[0_8px_16px_rgba(0,0,0,0.08)] scale-100 translate-y-[-1px]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-1)]/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mx-12 mb-4 px-4 py-3 rounded-xl text-sm font-bold border"
          style={{ background: "var(--warn-bg)", color: "var(--text)", borderColor: "var(--border)" }}
        >
          {error}
        </div>
      )}

      <div className="px-12 py-6 border-y flex items-center gap-4" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="relative flex-1 group">
          <i className="fi fi-rr-search absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors text-lg"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสคูปอง..."
            className="w-full pl-14 pr-8 py-5 rounded-[24px] border outline-none transition-all duration-300 font-bold placeholder:text-[var(--text-muted)]"
            style={{
              borderColor: "var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--text)",
              boxShadow: "none",
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`w-14 h-14 rounded-[22px] border-2 flex items-center justify-center text-xl transition-all duration-300 ${
              hasActiveFilters
                ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-contrast)] shadow-lg "
                : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-sm"
            }`}
            aria-label="Advanced filter"
          >
            <i className="fi fi-rr-filter"></i>
          </button>

          <button
            type="button"
            onClick={() => load()}
            className="px-8 py-5 bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] shadow-sm flex items-center gap-3 text-[14px] font-black text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
          >
            <i className="fi fi-rr-refresh"></i>
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ background: "var(--surface-1)" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)]/30 border-b border-[var(--border)]/40">
              <th className="px-12 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">คูปอง</th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Type</th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">ส่วนลด</th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">แลกแต้ม</th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Utilization</th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">หมดอายุ</th>
              <th className="px-12 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-12 py-16 text-center font-bold"
                  style={{ color: "var(--text-muted)", background: "var(--surface-1)" }}
                >
                  กำลังโหลด…
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-12 py-16 text-center font-bold"
                  style={{ color: "var(--text-muted)", background: "var(--surface-1)" }}
                >
                  ไม่มีคูปองในชุดนี้
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon, index) => (
                <tr
                  key={`${coupon.promotion_id}-${coupon.id}`}
                  className="hover:bg-[var(--surface-2)] transition-all duration-500 group animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl shadow-inner border border-[var(--border)] group-hover:scale-110 group-hover:rotate-[8deg] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{ background: "var(--surface-2)" }}
                    >
                        <span className="drop-shadow-sm">🎟️</span>
                      </div>
                      <div>
                        <div className="text-[17px] font-black text-[var(--text)] mb-1 group-hover:text-[var(--primary)] transition-colors">{coupon.name}</div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface-2)]/50 rounded-lg border border-[var(--border)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"></span>
                        <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-widest">{coupon.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className="text-[12px] font-black text-[var(--text)] bg-[var(--surface-1)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm uppercase tracking-wider">{coupon.type}</span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-black text-[var(--primary)]">
                        {coupon.type === "PERCENT" ? `${coupon.discount_amount}%` : `฿${coupon.discount_amount}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className="text-[15px] font-black text-[var(--text)]">
                      {coupon.points_cost > 0 ? `${coupon.points_cost.toLocaleString()} แต้ม` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-8 min-w-[200px]">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[18px] font-black text-[var(--text)]">{coupon.usage}</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Redeemed</span>
                      </div>
                      <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "var(--warn-bg)" }}>
                        Cap: {coupon.maxUsage || "∞"}
                      </span>
                    </div>
                    <div className="h-2.5 bg-[var(--surface-2)]/60 rounded-full overflow-hidden p-[2px] border border-[var(--border)] shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                          coupon.status === "inactive" ? "bg-[var(--border)]" : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]"
                        }`}
                        style={{
                          width:
                            coupon.maxUsage > 0
                              ? `${Math.min(100, (coupon.usage / coupon.maxUsage) * 100)}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold">ยอดใช้งานยังไม่มีใน API</p>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[13px] font-black text-[var(--text)]">
                        <i className="fi fi-rr-calendar-clock text-[var(--primary)] opacity-60"></i>
                        {coupon.expiry || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                      <span
                        className={`text-[11px] font-black uppercase px-3 py-1 rounded-lg border ${
                          coupon.status === "active"
                            ? "bg-[var(--success-bg)]"
                            : coupon.status === "expired"
                              ? "bg-[var(--surface-2)] border-[var(--border)]"
                              : "bg-[var(--warn-bg)] border-[var(--border)]"
                        }`}
                        style={{
                          color:
                            coupon.status === "active"
                              ? "var(--success)"
                              : coupon.status === "expired"
                                ? "var(--text-muted)"
                                : "var(--warn)",
                        }}
                      >
                        {coupon.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="text-xs font-black px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
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

      <div className="px-12 py-10 border-t flex justify-between items-center" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          แสดง {filteredCoupons.length} รายการ
        </p>
      </div>

      {editRow && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[var(--overlay)]/50 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[var(--surface-1)] rounded-3xl shadow-2xl max-w-md w-full p-8 border border-[var(--border)] max-h-[90vh] overflow-y-auto"
          >
            <h4 className="text-xl font-black text-[var(--text)] mb-1">แก้ไขคูปอง</h4>
            <p className="text-sm text-[var(--text)] font-bold mb-6">รหัส ประเภทส่วนลด แต้มที่ใช้แลก (0 = ไม่บังคับแลกแต้ม)</p>
            {formError && <div className="mb-4 text-sm font-bold text-rose-600">{formError}</div>}
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black text-[var(--text)] uppercase">รหัสคูปอง</span>
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-bold"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  disabled={saving}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-[var(--text)] uppercase">ประเภท</span>
                <select
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-bold"
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
                <span className="text-xs font-black text-[var(--text)] uppercase">
                  {form.type === "percent" ? "เปอร์เซ็นต์ส่วนลด" : "จำนวนเงินส่วนลด (บาท)"}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-bold"
                  value={form.discount_amount}
                  onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-[var(--text)] uppercase">แต้มที่ใช้แลก (points_cost)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-bold"
                  value={form.points_cost}
                  onChange={(e) => setForm((f) => ({ ...f, points_cost: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-[var(--text)] uppercase">หมดอายุ (เว้นว่าง = ไม่หมดอายุ)</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-bold"
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
                <span className="text-sm font-black text-[var(--text)]">เปิดใช้งาน (active)</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-[var(--border)] font-bold text-[var(--text)]"
                onClick={closeEditModal}
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)] font-black disabled:opacity-50"
                disabled={saving}
                onClick={submitEdit}
              >
                {saving ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[var(--overlay)]/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              className="bg-[var(--surface-1)] w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[var(--text)]">Advanced Filter</h3>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  <i className="fi fi-rr-cross-small text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, status: e.target.value as FilterState["status"] }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] font-bold text-[var(--text)] transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    Coupon Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value as FilterState["type"] }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] font-bold text-[var(--text)] transition-all"
                  >
                    <option value="all">All Types</option>
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (฿)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={filters.expiryDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] font-bold text-[var(--text)] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 py-4 bg-[var(--surface-2)] text-[var(--text)] font-black text-[14px] rounded-2xl transition-all active:scale-95 hover:opacity-90"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-4 bg-[var(--primary)] text-[var(--primary-contrast)] font-black text-[14px] rounded-2xl shadow-lg transition-all active:scale-95 hover:opacity-95"
                  style={{ boxShadow: "var(--shadow-primary)" }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
