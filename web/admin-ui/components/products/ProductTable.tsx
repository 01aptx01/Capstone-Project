"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/lib/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  code?: string;
  name: string;
  category?: string;
  machines?: number;
  quantity?: number;
  unit_price?: number;
  status?: string;
  image?: string;
};

interface ProductTableProps {
  category: string;
  machine: string;
  status: string;
}

export default function ProductTable({ category, machine, status }: ProductTableProps) {
  const { openEditProduct } = useUI();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
      const mockRes = await fetch("/mock/products.json");
      const mockData = await mockRes.json();
      setProducts(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };
    fetchData();
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchCategory = category === "All Categories" || p.category === category;
    const matchStatus = status === "All Statuses" || p.status === status;
    
    let matchMachine = true;
    if (machine === "Machine 1") matchMachine = (p.quantity || 0) > 50;
    if (machine === "Machine 2") matchMachine = (p.quantity || 0) <= 150;

    return matchCategory && matchStatus && matchMachine;
  });

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
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
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">ข้อมูลสินค้า</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">หมวดหมู่</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">จำนวนตู้ที่จำหน่าย</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">คงเหลือ</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">ราคา</th>
              <th className="px-8 py-6 text-left text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">สถานะ</th>
              <th className="px-8 py-6 text-center text-[12px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="w-1/3 h-5 rounded-lg bg-slate-50 animate-pulse" />
                        <div className="w-1/4 h-4 rounded-lg bg-slate-50 animate-pulse opacity-50" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
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
                              e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3081/3081918.png";
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-[16px] font-black text-[#334155] mb-0.5 group-hover:text-[#f47b2a] transition-colors">{p.name}</div>
                          <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{p.code || p.id}</div>
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
                      <span className="text-[17px] font-black text-[#334155]">{p.quantity} <span className="text-[13px] font-bold text-slate-400 ml-1">ชิ้น</span></span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[17px] font-black text-[#334155]">฿{(p.unit_price ?? 0).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-5">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditProduct(p)}
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

      {/* Pagination Footer */}
      <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-50 flex items-center justify-between">
        <div className="text-[13px] font-black text-slate-400 uppercase tracking-wider">
          แสดง 1-{filteredProducts.length} จาก {filteredProducts.length} รายการทั้งหมด
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 cursor-not-allowed">
            <i className="fi fi-rr-angle-left text-sm"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f47b2a] text-white text-[14px] font-black shadow-lg shadow-orange-200 transition-transform active:scale-95">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-300 hover:bg-slate-50 transition-all">
            <i className="fi fi-rr-angle-right text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

