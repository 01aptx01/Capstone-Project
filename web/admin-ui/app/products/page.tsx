"use client";

import { useState } from "react";
import ProductTable from "@/components/products/ProductTable";
import productsData from "@/lib/mock/products.json";
import { useUI, ExportSection } from "@/lib/context/UIContext";

const productSections: ExportSection[] = [
  {
    id: "products_inventory",
    label: "คลังสินค้า (Inventory)",
    description: "รายการสินค้า, หมวดหมู่, สต็อก และราคา",
    columns: [
      { key: "code", label: "รหัสสินค้า" },
      { key: "name", label: "ชื่อสินค้า" },
      { key: "category", label: "หมวดหมู่" },
      { key: "machines", label: "จำนวนตู้" },
      { key: "quantity", label: "จำนวนสต็อก" },
      { key: "unit_price", label: "ราคา/ชิ้น (฿)" },
      { key: "status", label: "สถานะ" },
    ],
    fetchData: async () => productsData.map(p => ({
      code: p.code,
      name: p.name,
      category: p.category,
      machines: p.machines,
      quantity: p.quantity,
      unit_price: p.unit_price,
      status: p.status,
    })),
  },
];

export default function ProductsPage() {
  const { openExportModal, openAddProduct } = useUI();
  const [category, setCategory] = useState("All Categories");
  const [machine, setMachine] = useState("All Machines");
  const [status, setStatus] = useState("All Statuses");

  const handleClear = () => {
    setCategory("All Categories");
    setMachine("All Machines");
    setStatus("All Statuses");
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] mb-1">
            จัดการคลังสินค้าส่วนกลาง
          </h1>
          <p className="text-[#64748B] text-[15px]">Manage all products across active vending machines.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => openExportModal(productSections, "คลังสินค้า (Inventory)")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-bold text-[#64748B] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
          <button 
            onClick={openAddProduct}
            className="btn-primary px-5 py-2.5 text-[14px]"
          >
            <span>+</span>
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="vibrant-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Category Filter</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none cursor-pointer hover:border-[#FF6A00]/30 transition-colors"
              >
                <option>All Categories</option>
                <option>หมูสับ/หมูแดง</option>
                <option>ไส้หวาน</option>
                <option>มังสวิรัติ</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] text-[10px]">▼</div>
            </div>
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Machine Location</label>
            <div className="relative">
              <select 
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none cursor-pointer hover:border-[#FF6A00]/30 transition-colors"
              >
                <option>All Machines</option>
                <option>Machine 1</option>
                <option>Machine 2</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] text-[10px]">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Stock Status</label>
            <div className="relative">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none cursor-pointer hover:border-[#FF6A00]/30 transition-colors"
              >
                <option>All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] text-[10px]">▼</div>
            </div>
          </div>

          <button 
            onClick={handleClear}
            className="h-[46px] border border-[#E2E8F0] text-[#64748B] font-bold text-[14px] rounded-xl hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <ProductTable category={category} machine={machine} status={status} />
    </div>
  );
}
