"use client";

import { useCallback, useEffect, useState } from "react";
import { useUI } from "@/lib/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_MACHINES_REFRESH_EVENT } from "@/components/machines/AddMachineModal";
import { listProducts } from "@/lib/admin-api";
import { enrichProductsWithStock, type UiProductRow } from "@/lib/admin-mappers";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useLang } from "@/lib/i18n/lang";
import ProductThumb from "@/components/products/ProductThumb";

const REFRESH = "admin-products-refresh";
export const ALL_MACHINES_FILTER = "All Machines";

interface ProductTableProps {
  category: string;
  machine: string;
  status: string;
  /** Server-side name/description filter from URL search (`?q=`). */
  listQuery?: string;
}

export default function ProductTable({
  category,
  machine,
  status,
  listQuery = "",
}: ProductTableProps) {
  const { openEditProduct } = useUI();
  const { t } = useLang();
  const [products, setProducts] = useState<UiProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = listQuery.trim();
      const { items } = await listProducts({
        page: 1,
        per_page: 200,
        ...(q ? { q } : {}),
      });
      const rows = await enrichProductsWithStock(items);
      setProducts(rows);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onRefresh = () => {
      void load();
    };
    window.addEventListener(REFRESH, onRefresh);
    window.addEventListener(ADMIN_MACHINES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(REFRESH, onRefresh);
      window.removeEventListener(ADMIN_MACHINES_REFRESH_EVENT, onRefresh);
    };
  }, [load]);

  const filteredProducts = products.filter((p) => {
    const matchCategory = category === "All Categories" || p.category === category;
    const matchStatus = status === "All Statuses" || p.status === status;

    const matchMachine =
      machine === ALL_MACHINES_FILTER ||
      Object.prototype.hasOwnProperty.call(p.quantity_by_machine ?? {}, machine);

    return matchCategory && matchStatus && matchMachine;
  });

  const quantityForRow = (p: UiProductRow) => {
    if (machine === ALL_MACHINES_FILTER) return p.quantity ?? 0;
    return p.quantity_by_machine?.[machine] ?? 0;
  };

  const getStatusBadge = (st: string | undefined) => {
    switch (st) {
      case "in_stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-[var(--success-bg)] text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-bg)]0 animate-pulse"></span>
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="vibrant-card !rounded-[32px] overflow-hidden shadow-xl shadow-orange-900/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)]/50">
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.info")}</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.category")}</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.machines")}</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.qty")}</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.price")}</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.status")}</th>
              <th className="px-8 py-6 text-center text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] whitespace-nowrap">{t("product.table.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="min-h-[400px]">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center">
                      <i className="fi fi-rr-search text-[32px]"></i>
                    </div>
                    <p className="text-[15px] font-bold text-[var(--text-muted)]">{t("product.table.empty")}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredProducts.map((p, index) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-[var(--surface-2)]/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <ProductThumb
                          src={p.image || "/product/img/pao-cream.png"}
                          alt=""
                          size="sm"
                          className="group-hover:border-orange-100 transition-colors duration-300"
                        />
                        <div>
                          <div className="text-[16px] font-black text-[var(--text)] mb-0.5 group-hover:text-[var(--primary)] transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            {p.code || p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 bg-[var(--surface-2)] rounded-xl text-[13px] font-bold text-[var(--text)] border border-[var(--border)]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[13px] font-black text-[var(--primary)]">
                          {p.machines}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text-muted)]">{t("product.table.installPoint")}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[17px] font-black text-[var(--text)]">
                        {quantityForRow(p)}{" "}
                        <span className="text-[13px] font-bold text-[var(--text-muted)] ml-1">{t("product.table.unit")}</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[17px] font-black text-[var(--text)]">
                        ฿{(p.unit_price ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5">{getStatusBadge(p.status)}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditProduct(p as unknown as Record<string, unknown>)}
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-orange-200 hover:shadow-lg hover: transition-colors"
                          title={t("product.table.titleEdit")}
                        >
                          <i className="fi fi-rr-edit text-lg"></i>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[var(--surface-2)]/50 px-8 py-6 border-t border-[var(--border)] flex items-center justify-between">
        <div className="text-[13px] font-black text-[var(--text-muted)] uppercase tracking-wider">
          {t("product.table.footer")
            .replace("{filtered}", String(filteredProducts.length))
            .replace("{total}", String(products.length))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm font-bold text-[var(--text)] hover:border-[var(--primary)]"
          >
            {t("product.refresh")}
          </button>
        </div>
      </div>
    </div>
  );
}

export { REFRESH as ADMIN_PRODUCTS_REFRESH_EVENT };
