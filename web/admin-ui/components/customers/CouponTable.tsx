"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { listCoupons } from "@/lib/admin-api";
import { apiCouponToUiRow, type UiCouponRow } from "@/lib/admin-mappers";
import { useUI } from "@/lib/context/UIContext";
import { useLang } from "@/lib/i18n/lang";
import CouponFormModal from "@/components/customers/CouponFormModal";
import { ADMIN_COUPONS_REFRESH_EVENT } from "@/components/customers/coupon-constants";

type CouponTabId = "all" | "active" | "expired";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
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
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<CouponTabId>("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<UiCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editRow, setEditRow] = useState<UiCouponRow | null>(null);

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
      setError(e instanceof Error ? e.message : t("coupon.error.loadFailed"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

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
    setEditRow(row);
  };

  const closeEditModal = () => {
    setEditRow(null);
  };

  const tabItems = useMemo(
    () =>
      (["all", "active", "expired"] as const).map((id) => ({
        id,
        label:
          id === "all" ? t("coupon.tab.all") : id === "active" ? t("coupon.tab.active") : t("coupon.tab.expired"),
      })),
    [t]
  );

  const labelForCouponStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") return t("coupon.status.active");
    if (s === "inactive") return t("coupon.status.inactive");
    if (s === "expired") return t("coupon.status.expired");
    return status;
  };

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const q = search.trim().toLowerCase();
    return rows.filter((coupon) => {
      let tabMatch = true;
      const expiry = coupon.expiry ? new Date(coupon.expiry) : null;
      if (activeTab === "active") {
        tabMatch = coupon.status === "active" && (!expiry || expiry >= now);
      } else if (activeTab === "expired") {
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

  const capLabel = (maxUsage: number) =>
    t("coupon.capLabel").replace("{cap}", maxUsage > 0 ? String(maxUsage) : "∞");

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
          <h3 className="text-[28px] font-black text-[var(--text)] tracking-tight mb-2">{t("coupon.title")}</h3>
          <p className="text-[var(--text-muted)] font-bold text-[15px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
            {t("coupon.apiNote")}{" "}
            <code className="text-xs font-mono bg-[var(--surface-2)] px-1 rounded">/api/admin/coupons</code>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={openCreateCoupon}
            className="px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)] text-sm font-black shadow-md hover:opacity-95 transition-opacity"
          >
            {t("coupon.createNew")}
          </button>
          <div className="flex bg-[var(--surface-2)]/60 p-1.5 rounded-[22px] border border-[var(--border)] shadow-inner backdrop-blur-sm">
            {tabItems.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-6 sm:px-8 py-3 rounded-2xl text-[12px] sm:text-[13px] font-black tracking-[0.05em] uppercase transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  activeTab === id
                    ? "bg-[var(--surface-1)] text-[var(--primary)] shadow-[0_8px_16px_rgba(0,0,0,0.08)] scale-100 translate-y-[-1px]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-1)]/40"
                }`}
              >
                {label}
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
            placeholder={t("coupon.searchPlaceholder")}
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
            aria-label={t("coupon.filter.aria")}
          >
            <i className="fi fi-rr-filter"></i>
          </button>

          <button
            type="button"
            onClick={() => load()}
            className="px-8 py-5 bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] shadow-sm flex items-center gap-3 text-[14px] font-black text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
          >
            <i className="fi fi-rr-refresh"></i>
            {t("coupon.refresh")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ background: "var(--surface-1)" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)]/30 border-b border-[var(--border)]/40">
              <th className="px-12 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.coupon")}
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.type")}
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.discount")}
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.points")}
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.utilization")}
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {t("coupon.col.expiry")}
              </th>
              <th className="px-12 py-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">
                {t("coupon.col.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-12 py-16 text-center font-bold"
                  style={{ color: "var(--text-muted)", background: "var(--surface-1)" }}
                >
                  {t("coupon.loading")}
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-12 py-16 text-center font-bold"
                  style={{ color: "var(--text-muted)", background: "var(--surface-1)" }}
                >
                  {t("coupon.empty")}
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
                      {coupon.points_cost > 0
                        ? `${coupon.points_cost.toLocaleString()} ${t("coupon.pointsSuffix")}`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-8 min-w-[200px]">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[18px] font-black text-[var(--text)]">{coupon.usage}</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                          {t("coupon.redeemed")}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "var(--warn-bg)" }}>
                        {capLabel(coupon.maxUsage)}
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
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold">{t("coupon.usageNotInApi")}</p>
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
                        {labelForCouponStatus(coupon.status)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="text-xs font-black px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                      >
                        {t("coupon.edit")}
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
          {t("coupon.footer").replace("{n}", String(filteredCoupons.length))}
        </p>
      </div>

      <CouponFormModal
        open={editRow !== null}
        onClose={closeEditModal}
        mode="edit"
        editRow={editRow}
      />

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
                <h3 className="text-xl font-black text-[var(--text)]">{t("coupon.filter.title")}</h3>
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
                    {t("coupon.filter.status")}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, status: e.target.value as FilterState["status"] }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] font-bold text-[var(--text)] transition-all"
                  >
                    <option value="all">{t("coupon.filter.opt.allStatus")}</option>
                    <option value="active">{t("coupon.filter.opt.active")}</option>
                    <option value="inactive">{t("coupon.filter.opt.inactive")}</option>
                    <option value="expired">{t("coupon.filter.opt.expired")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    {t("coupon.filter.couponType")}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value as FilterState["type"] }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] font-bold text-[var(--text)] transition-all"
                  >
                    <option value="all">{t("coupon.filter.opt.allTypes")}</option>
                    <option value="PERCENT">{t("coupon.filter.opt.percent")}</option>
                    <option value="FIXED">{t("coupon.filter.opt.fixed")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    {t("coupon.filter.expiryDate")}
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
                  {t("coupon.filter.reset")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-4 bg-[var(--primary)] text-[var(--primary-contrast)] font-black text-[14px] rounded-2xl shadow-lg transition-all active:scale-95 hover:opacity-95"
                  style={{ boxShadow: "var(--shadow-primary)" }}
                >
                  {t("coupon.filter.apply")}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
