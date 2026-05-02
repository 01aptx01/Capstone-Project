"use client";

import { useEffect, useState } from "react";

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
    
    // Mock machine logic: 
    // Machine 1 shows products with quantity > 50
    // Machine 2 shows products with quantity <= 150
    let matchMachine = true;
    if (machine === "Machine 1") matchMachine = (p.quantity || 0) > 50;
    if (machine === "Machine 2") matchMachine = (p.quantity || 0) <= 150;

    return matchCategory && matchStatus && matchMachine;
  });

  return (
    <div className="vibrant-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Machines</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#64748B] text-[14px]">
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#64748B] text-[14px]">
                  No products found matching your filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center text-xl shadow-sm overflow-hidden border border-[#FFDAB5]/30">
                        <img 
                          src={p.image || "/product/img/pao-cream.png"} 
                          alt="" 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3081/3081918.png";
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-[#0F172A] mb-0.5">{p.name}</div>
                        <div className="text-[12px] font-medium text-[#94A3B8]">{p.code || p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#475569]">{p.category}</td>
                  <td className="px-6 py-4 text-[14px] font-bold text-[#475569]">
                    {p.machines} <span className="font-medium text-[#94A3B8]">Active</span>
                  </td>
                  <td className="px-6 py-4 text-[16px] font-extrabold text-[#0F172A]">{p.quantity}</td>
                  <td className="px-6 py-4 text-[15px] font-bold text-[#0F172A]">฿{(p.unit_price ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-[12px] font-bold border ${
                      p.status === "in_stock" 
                        ? "bg-[#ECFDF5] text-[#065F46] border-[#D1FAE5]" 
                        : p.status === "low_stock" 
                        ? "bg-[#FFF7ED] text-[#92400E] border-[#FFEDD5]" 
                        : "bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]"
                    }`}>
                      {p.status === "in_stock" ? "In Stock" : p.status === "low_stock" ? "Low Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-[#F8FAFC] px-6 py-5 border-t border-[#E2E8F0] flex items-center justify-between">
        <div className="text-[14px] font-bold text-[#64748B]">
          Showing 1-{filteredProducts.length} of {filteredProducts.length} results
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8] cursor-not-allowed">
            <span>‹</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FF6A00] text-white font-bold shadow-[0_4px_12px_rgba(255,106,0,0.2)]">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8] hover:bg-[#F1F5F9] transition-all">
            <span>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}



