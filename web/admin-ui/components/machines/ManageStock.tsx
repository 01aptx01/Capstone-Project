"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import productsData from "@/lib/mock/products.json";

export default function ManageStock({ onCancel, onSave }: { onCancel: () => void, onSave: () => void }) {
  const [confirmAction, setConfirmAction] = useState<"save" | "cancel" | null>(null);
  const [portalMounted, setPortalMounted] = useState(false);
  const [stock, setStock] = useState(() => 
    productsData.slice(0, 5).map(p => ({
      id: p.code,
      name: p.name,
      quantity: Math.floor(Math.random() * 50) + 5,
      isEditing: false
    }))
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [initialQuantity, setInitialQuantity] = useState(10);

  useEffect(() => { setPortalMounted(true); }, []);
  useEffect(() => {
    document.body.style.overflow = (isAddModalOpen || confirmAction) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isAddModalOpen, confirmAction]);


  const availableProducts = productsData
    .filter(p => !stock.some(s => s.id === p.code))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const p = productsData.find(x => x.code === selectedProductId);
    if (!p) return;
    setStock(s => [...s, { id: p.code, name: p.name, quantity: initialQuantity, isEditing: false }]);
    setIsAddModalOpen(false);
    setSelectedProductId(null);
    setSearchQuery("");
    setInitialQuantity(10);
  };

  const toggleEdit = (id: string) => {
    setStock(s => s.map(item => item.id === id ? { ...item, isEditing: !item.isEditing } : item));
  };

  const updateQuantity = (id: string, newQty: number) => {
    setStock(s => s.map(item => item.id === id ? { ...item, quantity: Math.max(0, newQty) } : item));
  };

  const getStatus = (qty: number) => {
    if (qty === 0) return { label: "Out of Stock", color: "bg-rose-100 text-rose-600 border-rose-200" };
    if (qty < 10) return { label: "Low Stock", color: "bg-orange-100 text-[var(--primary)] border-orange-200" };
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-600 border-emerald-200" };
  };

  const handleSave = () => {
    setConfirmAction("save");
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
  };

  const confirmActionHandler = () => {
    if (confirmAction === "save") {
      onSave();
    } else if (confirmAction === "cancel") {
      onCancel();
    }
    setConfirmAction(null);
  };

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h3 className="text-[20px] font-black text-[var(--text)]">จัดการสต็อคสินค้า (Manage Stock)</h3>
          <p className="text-[var(--text-muted)] text-[14px] font-medium mt-1">อัปเดตจำนวนสินค้าภายในตู้</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-[14px] font-bold hover:bg-[var(--border)] transition-all"
        >
          <i className="fi fi-rr-plus"></i>
          เพิ่มสินค้าใหม่
        </button>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
              <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider w-[80px] whitespace-nowrap">Edit</th>
              <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">Product Name</th>
              <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider w-[200px] whitespace-nowrap">Quantity</th>
              <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider w-[150px] whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {stock.map((item) => {
              const status = getStatus(item.quantity);
              return (
                <tr key={item.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEdit(item.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        item.isEditing 
                          ? "bg-[var(--warn-bg)] text-[var(--primary)] border border-[var(--primary)]" 
                          : "bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-sm"
                      }`}
                    >
                      <i className={`fi ${item.isEditing ? 'fi-rr-check' : 'fi-rr-edit'}`}></i>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[15px] font-black text-[var(--text)]">{item.name}</div>
                    <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.isEditing ? (
                      <div className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1 w-max shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
                        >
                          <i className="fi fi-rr-minus-small"></i>
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center text-[15px] font-black text-[var(--text)] outline-none"
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
                        >
                          <i className="fi fi-rr-plus-small"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[16px] font-black text-[var(--text)] px-4">{item.quantity}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 border-t border-[var(--border)] pt-6">
        <button 
          onClick={handleCancel}
          className="px-8 py-3 bg-[var(--surface-1)] border-2 border-[var(--border)] text-[var(--text-muted)] rounded-xl font-bold shadow-sm hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] rounded-xl font-black shadow-[0_8px_20px_rgba(244,123,42,0.25)] hover:shadow-[0_10px_25px_rgba(244,123,42,0.35)] hover:-translate-y-0.5 transition-all"
        >
          Save Changes
        </button>
      </div>

      {isAddModalOpen && portalMounted && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          className="animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div className="bg-[var(--surface-1)] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/50">
              <div>
                <h3 className="text-[20px] font-black text-[var(--text)]">เพิ่มสินค้าใหม่</h3>
                <p className="text-[var(--text)]0 text-[14px] font-medium mt-1">เลือกสินค้าจากคลังเพื่อเพิ่มลงในตู้</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all"
              >
                <i className="fi fi-rr-cross-small text-xl"></i>
              </button>
            </div>
            
            <div className="p-8 flex flex-col gap-6 flex-1 overflow-hidden">
              <div className="relative group">
                <i className="fi fi-rr-search absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors text-lg"></i>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-2)] focus:bg-[var(--surface-1)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="flex-1 overflow-y-auto min-h-[200px] border border-[var(--border)] rounded-2xl p-2 bg-[var(--surface-2)]/30">
                {availableProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-3 py-10">
                    <i className="fi fi-rr-box-open text-4xl opacity-50"></i>
                    <p className="font-bold">ไม่พบสินค้าที่ค้นหา</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableProducts.map(p => (
                      <div 
                        key={p.code}
                        onClick={() => setSelectedProductId(p.code)}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedProductId === p.code ? 'border-[var(--primary)] bg-orange-50/50' : 'border-transparent hover:bg-[var(--surface-2)]'}`}
                      >
                        <div>
                          <div className="font-black text-[var(--text)] text-[15px]">{p.name}</div>
                          <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{p.code}</div>
                        </div>
                        {selectedProductId === p.code && (
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center">
                            <i className="fi fi-rr-check text-xs"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProductId && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between animate-in slide-in-from-bottom-4">
                  <div>
                    <div className="text-[13px] font-bold text-[var(--text)]0 mb-1">ระบุจำนวนเริ่มต้น</div>
                    <div className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1 w-max shadow-sm">
                      <button 
                        onClick={() => setInitialQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text)]0 flex items-center justify-center hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
                      >
                        <i className="fi fi-rr-minus-small"></i>
                      </button>
                      <input 
                        type="number" 
                        value={initialQuantity}
                        onChange={(e) => setInitialQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center text-[18px] font-black text-[var(--text)] outline-none"
                      />
                      <button 
                        onClick={() => setInitialQuantity(q => q + 1)}
                        className="w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text)]0 flex items-center justify-center hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
                      >
                        <i className="fi fi-rr-plus-small"></i>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleAddProduct}
                    className="px-8 py-3.5 bg-[var(--primary)] text-[var(--primary-contrast)] rounded-xl font-black shadow-[0_8px_20px_rgba(244,123,42,0.25)] hover:-translate-y-0.5 transition-all"
                  >
                    ยืนยันการเพิ่ม
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {confirmAction && portalMounted && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          className="animate-in fade-in duration-200"
        >
          <div className="bg-[var(--surface-1)] w-full max-w-sm rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${confirmAction === 'save' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                <i className={`fi ${confirmAction === 'save' ? 'fi-rr-disk' : 'fi-rr-cross-circle'} text-xl`}></i>
              </div>
              <div>
                <h3 className="text-[18px] font-black text-[var(--text)]">
                  {confirmAction === "save" ? "Confirm Save" : "Discard Changes"}
                </h3>
                <p className="text-[var(--text)]0 text-[13px] font-medium leading-tight">
                  Are you sure you want to {confirmAction === "save" ? "save these changes?" : "discard these changes?"}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 bg-[var(--surface-2)] text-[var(--text)] rounded-xl font-bold hover:bg-[var(--border)] transition-all text-[14px]"
              >
                No, go back
              </button>
              <button 
                onClick={confirmActionHandler}
                className={`px-5 py-2.5 text-[var(--primary-contrast)] rounded-xl font-black shadow-lg transition-all text-[14px] ${
                  confirmAction === 'save' 
                    ? 'bg-[var(--success-bg)]0 hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/40' 
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 hover:shadow-rose-500/40'
                }`}
              >
                Yes, {confirmAction === "save" ? "Save" : "Discard"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
