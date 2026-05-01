"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal.tsx";

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
  description?: string;
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", unit_price: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setSelected(data);
      setOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { name: form.name, unit_price: Number(form.unit_price || 0) };
      const res = await fetch("/api/products", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        await load();
        setCreateOpen(false);
        setForm({ name: "", unit_price: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Products</h3>
        <div>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded px-3 py-1 text-sm"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            + เพิ่มสินค้า
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              <th className="pb-2">Product Info</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Machines</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Unit Price</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  onClick={() => openDetails(p.id)}
                >
                  <td className="py-3 text-sm" style={{ color: "var(--foreground)" }}>
                    <div className="flex items-center gap-3">
                      <img src={p.image || "/product/img/pao-cream.png"} alt={p.name} className="h-8 w-8 rounded" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{p.code || p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm" style={{ color: "var(--muted)" }}>{p.category}</td>
                  <td className="py-3 text-sm" style={{ color: "var(--muted)" }}>{p.machines} Active</td>
                  <td className="py-3 text-sm" style={{ color: "var(--foreground)" }}>{p.quantity}</td>
                  <td className="py-3 text-sm" style={{ color: "var(--foreground)" }}>฿{(p.unit_price ?? 0).toFixed(2)}</td>
                  <td className="py-3 text-sm" style={{ color: "var(--muted)" }}>
                    <span className={`px-3 py-1 rounded-full text-xs`} style={{ backgroundColor: p.status === "in_stock" ? "#ECFDF5" : p.status === "low_stock" ? "#FFF7ED" : "#FEF2F2", color: p.status === "in_stock" ? "#065F46" : p.status === "low_stock" ? "#92400E" : "#991B1B" }}>
                      {p.status === "in_stock" ? "In Stock" : p.status === "low_stock" ? "Low Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={selected?.name}>
        {selected ? (
          <div>
            <div className="flex gap-4">
              <img src={selected.image || "/product/img/pao-cream.png"} alt="" className="h-24 w-24 rounded" />
              <div>
                <div className="text-lg font-semibold">{selected.name}</div>
                <div className="text-sm text-gray-500">{selected.category}</div>
                <div className="mt-2">{selected.description}</div>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create product">
        <form onSubmit={submitCreate}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Name</label>
              <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full rounded border p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Unit price</label>
              <input value={form.unit_price} onChange={(e) => setForm((s) => ({ ...s, unit_price: e.target.value }))} className="w-full rounded border p-2" />
            </div>
            <div className="text-right">
              <button type="submit" disabled={creating} className="rounded bg-blue-600 px-3 py-1 text-white">{creating ? "Creating..." : "Create"}</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}


