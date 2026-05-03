"use client";

import PageWrapper from "@/components/layout/PageWrapper";
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
    <PageWrapper>
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[#334155] mb-2 tracking-tight">
            คลังสินค้าส่วนกลาง
          </h1>
          <p className="text-[#64748B] text-[16px] font-medium">จัดการรายการสินค้า สต็อก และราคาทุกตู้จำหน่ายในระบบ</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => openExportModal(productSections, "คลังสินค้า (Inventory)")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[#334155] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>Export รายงาน</span>
          </button>
          <button 
            onClick={openAddProduct}
            className="btn-primary"
          >
            <i className="fi fi-rr-plus flex items-center"></i>
            เพิ่มสินค้าใหม่
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="vibrant-card !rounded-[32px] p-8 animate-in opacity-0 delay-100 shadow-xl shadow-orange-900/[0.02]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#f47b2a]">
            <i className="fi fi-rr-filter text-lg"></i>
          </div>
          <h2 className="text-[18px] font-black text-[#334155]">ตัวกรองสินค้า</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.1em] ml-1">หมวดหมู่สินค้า</label>
            <div className="relative group">
              <i className="fi fi-rr-apps absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors"></i>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[#334155] outline-none appearance-none cursor-pointer hover:bg-slate-100 focus:bg-white focus:border-orange-100 transition-all shadow-inner"
              >
                <option>All Categories</option>
                <option>หมูสับ/หมูแดง</option>
                <option>ไส้หวาน</option>
                <option>มังสวิรัติ</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"></i>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.1em] ml-1">สถานที่ติดตั้ง (ตู้)</label>
            <div className="relative group">
              <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors"></i>
              <select 
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[#334155] outline-none appearance-none cursor-pointer hover:bg-slate-100 focus:bg-white focus:border-orange-100 transition-all shadow-inner"
              >
                <option>All Machines</option>
                <option>Machine 1</option>
                <option>Machine 2</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"></i>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.1em] ml-1">สถานะสต็อก</label>
            <div className="relative group">
              <i className="fi fi-rr-box-open absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f47b2a] transition-colors"></i>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[#334155] outline-none appearance-none cursor-pointer hover:bg-slate-100 focus:bg-white focus:border-orange-100 transition-all shadow-inner"
              >
                <option>All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"></i>
            </div>
          </div>

          <button 
            onClick={handleClear}
            className="h-[54px] bg-white border-2 border-slate-100 text-[#64748B] font-black text-[14px] rounded-[18px] hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <i className="fi fi-rr-refresh text-lg"></i>
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="animate-in opacity-0 delay-200">
        <ProductTable category={category} machine={machine} status={status} />
      </div>
    </PageWrapper>
  );
}

