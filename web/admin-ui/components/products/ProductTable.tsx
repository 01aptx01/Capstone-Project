"use client";

import { useCallback, useEffect, useState } from "react";
import { useUI } from "@/lib/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { listProducts } from "@/lib/admin-api";
import { enrichProductsWithStock, type UiProductRow } from "@/lib/admin-mappers";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const REFRESH = "admin-products-refresh";

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
      load();
    };
    window.addEventListener(REFRESH, onRefresh);
    return () => window.removeEventListener(REFRESH, onRefresh);
  }, [load]);

  const filteredProducts = products.filter((p) => {
    const matchCategory = category === "All Categories" || p.category === category;
    const matchStatus = status === "All Statuses" || p.status === status;

    let matchMachine = true;
    if (machine === "Machine 1") matchMachine = (p.quantity || 0) > 50;
    if (machine === "Machine 2") matchMachine = (p.quantity || 0) <= 150;

    return matchCategory && matchStatus && matchMachine;
  });

  const getStatusBadge = (st: string | undefined) => {
    switch (st) {
      case "in_stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
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
            <tr className="bg-slate-50/50">
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">ข้อมูลสินค้า</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">หมวดหมู่</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">จำนวนตู้ที่จำหน่าย</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">คงเหลือ</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">ราคา</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">สถานะ</th>
              <th className="px-8 py-6 text-center text-[12px] font-black text-slate-400 uppercase tracking-[0.15em]">จัดการ</th>
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
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <i className="fi fi-rr-search text-[32px]"></i>
                    </div>
                    <p className="text-[15px] font-bold text-slate-500">ไม่พบข้อมูลสินค้าที่ค้นหา</p>
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
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm overflow-hidden border border-slate-100 group-hover:border-orange-100 group-hover:scale-105 transition-all duration-500">
                          <img
                            src={p.image || "/product/img/pao-cream.png"}
                            alt=""
                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://cdn-icons-png.flaticon.com/512/3081/3081918.png";
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-[16px] font-black text-[#334155] mb-0.5 group-hover:text-[#f47b2a] transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                            {p.code || p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 bg-slate-50 rounded-xl text-[13px] font-bold text-[#475569] border border-slate-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[13px] font-black text-[#f47b2a]">
                          {p.machines}
                        </div>
                        <span className="text-[13px] font-bold text-slate-400">จุดติดตั้ง</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[17px] font-black text-[#334155]">
                        {p.quantity}{" "}
                        <span className="text-[13px] font-bold text-slate-400 ml-1">ชิ้น</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[17px] font-black text-[#334155]">
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
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#f47b2a] hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100 transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <i className="fi fi-rr-edit text-lg"></i>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100 transition-colors"
                          title="ดูประวัติสต็อก"
                        >
                          <i className="fi fi-rr-time-past text-lg"></i>
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

      <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-50 flex items-center justify-between">
        <div className="text-[13px] font-black text-slate-400 uppercase tracking-wider">
          แสดง {filteredProducts.length} รายการ (จากทั้งหมด {products.length} ที่โหลด)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-[#f47b2a]"
          >
            รีเฟรช
          </button>
        </div>
      </div>
    </div>
  );
}

export { REFRESH as ADMIN_PRODUCTS_REFRESH_EVENT };
