import ProductTable from "../../components/ProductTable";

export const metadata = { title: 'Inventory Management' };

export default function ProductsPage() {
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
          <button className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-sm hover:bg-[#F8FAFC] transition-all">
            <span>📥</span>
            Export
          </button>
          <button className="flex items-center gap-2 bg-[#FF6A00] hover:bg-[#E55F00] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(255,106,0,0.15)] transition-all">
            <span>+</span>
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Category Filter</label>
            <div className="relative">
              <select className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none">
                <option>All Categories</option>
                <option>หมูสับ/หมูแดง</option>
                <option>ไส้หวาน</option>
                <option>มังสวิรัติ</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">▼</div>
            </div>
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Machine Location</label>
            <div className="relative">
              <select className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none">
                <option>All Machines</option>
                <option>Machine 1</option>
                <option>Machine 2</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#94A3B8] uppercase mb-2 tracking-wider">Stock Status</label>
            <div className="relative">
              <select className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[#0F172A] outline-none appearance-none">
                <option>All Statuses</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">▼</div>
            </div>
          </div>

          <button className="h-[46px] border border-[#E2E8F0] text-[#64748B] font-bold text-[14px] rounded-xl hover:bg-[#F8FAFC] transition-all">
            Clear
          </button>
        </div>
      </div>

      {/* Table Section */}
      <ProductTable />
    </div>
  );
}

