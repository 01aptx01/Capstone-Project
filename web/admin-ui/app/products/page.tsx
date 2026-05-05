"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductTable, { ADMIN_PRODUCTS_REFRESH_EVENT } from "@/components/products/ProductTable";
import { listProductCategories, listProducts } from "@/lib/admin-api";
import { apiCategoryToLabel, enrichProductsWithStock } from "@/lib/admin-mappers";
import { useUI, ExportSection } from "@/lib/context/UIContext";
import { useLang } from "@/lib/i18n/lang";

const ALL_CATEGORIES = "All Categories";
const ALL_MACHINES = "All Machines";
const ALL_STATUSES = "All Statuses";

function ProductsPageClient() {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("q")?.trim() ?? "";
  const { openExportModal, openAddProduct } = useUI();
  const { t } = useLang();
  const productSections: ExportSection[] = useMemo(
    () => [
      {
        id: "products_inventory",
        label: t("page.products.exportTitle"),
        description: t("page.products.export.desc"),
        columns: [
          { key: "code", label: t("page.products.export.col.code") },
          { key: "name", label: t("page.products.export.col.name") },
          { key: "category", label: t("page.products.export.col.category") },
          { key: "machines", label: t("page.products.export.col.machines") },
          { key: "quantity", label: t("page.products.export.col.qty") },
          { key: "unit_price", label: t("page.products.export.col.price") },
          { key: "status", label: t("page.products.export.col.status") },
        ],
        fetchData: async () => {
          const { items } = await listProducts({ page: 1, per_page: 500 });
          const rows = await enrichProductsWithStock(items);
          return rows.map((p) => ({
            code: p.code,
            name: p.name,
            category: p.category,
            machines: p.machines,
            quantity: p.quantity,
            unit_price: p.unit_price,
            status: p.status,
          })) as Record<string, unknown>[];
        },
      },
    ],
    [t]
  );
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([ALL_CATEGORIES]);
  const [machine, setMachine] = useState(ALL_MACHINES);
  const [status, setStatus] = useState(ALL_STATUSES);

  const loadCategoryOptions = useCallback(async () => {
    try {
      const codes = await listProductCategories();
      const labels = codes
        .map((c) => apiCategoryToLabel(c))
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a.localeCompare(b, "en"));
      setCategoryOptions([ALL_CATEGORIES, ...labels]);
    } catch (e) {
      console.error(e);
      setCategoryOptions([ALL_CATEGORIES]);
    }
  }, []);

  useEffect(() => {
    void loadCategoryOptions();
  }, [loadCategoryOptions]);

  useEffect(() => {
    const onProductsChange = () => {
      void loadCategoryOptions();
    };
    window.addEventListener(ADMIN_PRODUCTS_REFRESH_EVENT, onProductsChange);
    return () => window.removeEventListener(ADMIN_PRODUCTS_REFRESH_EVENT, onProductsChange);
  }, [loadCategoryOptions]);

  useEffect(() => {
    if (category !== ALL_CATEGORIES && !categoryOptions.includes(category)) {
      setCategory(ALL_CATEGORIES);
    }
  }, [categoryOptions, category]);

  const handleClear = () => {
    setCategory(ALL_CATEGORIES);
    setMachine(ALL_MACHINES);
    setStatus(ALL_STATUSES);
  };

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in opacity-0">
        <div>
          <h1 className="text-[36px] font-black text-[var(--text)] mb-2 tracking-tight">
            {t("page.products.title")}
          </h1>
          <p className="text-[var(--text-muted)] text-[16px] font-medium">{t("page.products.subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => openExportModal(productSections, t("page.products.exportTitle"))}
            className="px-6 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 active:translate-y-0 active:scale-95"
          >
            <i className="fi fi-rr-download text-sm"></i>
            <span>{t("page.products.exportReport")}</span>
          </button>
          <button 
            onClick={openAddProduct}
            className="btn-primary"
          >
            <i className="fi fi-rr-plus flex items-center"></i>
            {t("page.products.addProduct")}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="vibrant-card !rounded-[32px] p-8 animate-in opacity-0 delay-100 shadow-xl shadow-orange-900/[0.02]">
        <div className="flex items-center gap-3 mb-8 border-b border-[var(--border)] pb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[var(--primary)]">
            <i className="fi fi-rr-filter text-lg"></i>
          </div>
          <h2 className="text-[18px] font-black text-[var(--text)]">{t("page.products.filterTitle")}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] ml-1">{t("page.products.categoryLabel")}</label>
            <div className="relative group">
              <i className="fi fi-rr-apps absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors"></i>
              <select 
                value={categoryOptions.includes(category) ? category : ALL_CATEGORIES}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--surface-2)] border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[var(--text)] outline-none appearance-none cursor-pointer hover:bg-[var(--surface-2)] focus:bg-[var(--surface-1)] focus:border-orange-100 transition-all shadow-inner"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === ALL_CATEGORIES ? t("page.products.allCategories") : opt}
                  </option>
                ))}
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"></i>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] ml-1">{t("page.products.machineLabel")}</label>
            <div className="relative group">
              <i className="fi fi-rr-marker absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors"></i>
              <select 
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full bg-[var(--surface-2)] border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[var(--text)] outline-none appearance-none cursor-pointer hover:bg-[var(--surface-2)] focus:bg-[var(--surface-1)] focus:border-orange-100 transition-all shadow-inner"
              >
                <option value={ALL_MACHINES}>{t("page.products.allMachines")}</option>
                <option>Machine 1</option>
                <option>Machine 2</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"></i>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] ml-1">{t("page.products.stockStatusLabel")}</label>
            <div className="relative group">
              <i className="fi fi-rr-box-open absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors"></i>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--surface-2)] border-2 border-transparent rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-bold text-[var(--text)] outline-none appearance-none cursor-pointer hover:bg-[var(--surface-2)] focus:bg-[var(--surface-1)] focus:border-orange-100 transition-all shadow-inner"
              >
                <option value={ALL_STATUSES}>{t("page.products.allStatuses")}</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"></i>
            </div>
          </div>

          <button 
            onClick={handleClear}
            className="h-[54px] bg-[var(--surface-1)] border-2 border-[var(--border)] text-[var(--text-muted)] font-black text-[14px] rounded-[18px] hover:bg-[var(--surface-2)] hover:border-[var(--border)] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <i className="fi fi-rr-refresh text-lg"></i>
            {t("page.products.clearFilters")}
          </button>
        </div>
      </div>

      {/* Table Section — LoadingSpinner shown inside ProductTable while fetching */}
      <div className="animate-in opacity-0 delay-200 min-h-[480px]">
        <ProductTable
          category={category}
          machine={machine}
          status={status}
          listQuery={listQuery}
        />
      </div>
    </PageWrapper>
  );
}

function ProductsPageFallback() {
  const { t } = useLang();
  return (
    <PageWrapper>
      <p className="px-4 py-16 text-center text-sm font-bold text-[var(--text-muted)]">{t("common.loading")}</p>
    </PageWrapper>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageClient />
    </Suspense>
  );
}
