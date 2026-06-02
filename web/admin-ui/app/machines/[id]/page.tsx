"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getMachine,
  listProducts,
  updateMachineSlots,
  deleteMachine,
  type ApiMachineDetail,
  type ApiMachineSlotInput,
  type ApiProduct,
} from "@/lib/admin-api";
import Modal from "@/components/ui/Modal";
import { useLang } from "@/lib/i18n/lang";
import { blockNonIntegerKeys, digitsOnly } from "@/lib/integer-input";

const MAX_SLOTS = 6;
const ALL_SLOT_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

type SlotDraftRow = {
  rowKey: string;
  slot_number: number;
  product_id: number;
  quantity: number;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function slotsToDraft(slots: ApiMachineDetail["slots"]): SlotDraftRow[] {
  return (slots || [])
    .slice()
    .sort((a, b) => a.slot_number - b.slot_number)
    .map((s) => ({
      rowKey: `slot-${s.slot_number}`,
      slot_number: s.slot_number,
      product_id: s.product_id,
      quantity: s.quantity,
    }));
}

export default function MachineDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLang();
  const [machine, setMachine] = useState<ApiMachineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [slotDraft, setSlotDraft] = useState<SlotDraftRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    if (!machine) return false;
    const original = slotsToDraft(machine.slots);
    if (slotDraft.length !== original.length) return true;
    for (let i = 0; i < slotDraft.length; i++) {
      if (
        slotDraft[i].slot_number !== original[i].slot_number ||
        slotDraft[i].product_id !== original[i].product_id ||
        slotDraft[i].quantity !== original[i].quantity
      ) {
        return true;
      }
    }
    return false;
  }, [slotDraft, machine]);

  const handleBack = () => {
    if (isDirty) {
      setPendingNavUrl(null);
      setShowUnsavedModal(true);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        const url = new URL(anchor.href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          e.preventDefault();
          setPendingNavUrl(url.pathname + url.search);
          setShowUnsavedModal(true);
        }
      }
    };
    document.addEventListener("click", handleGlobalClick, true);
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, [isDirty]);

  const machineCode = machine?.machine_code ?? decodeURIComponent(id);

  const loadMachine = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getMachine(decodeURIComponent(id));
      setMachine(m);
      setSlotDraft(slotsToDraft(m.slots));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMachine();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("machine.detail.errorLoad"));
          setMachine(null);
          setSlotDraft([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMachine]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadMachine();
      toast.success(t("machine.detail.toastRefreshed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("machine.detail.toastRefreshFail"));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const first = await listProducts({ page: 1, per_page: 100 });
        const items = [...(first.items || [])];
        let page = 1;
        const pages = first.pages || 1;
        while (!cancelled && page < pages && page < 20) {
          page += 1;
          const next = await listProducts({ page, per_page: 100 });
          items.push(...(next.items || []));
        }
        if (!cancelled) setProducts(items);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productById = useMemo(() => {
    const m = new Map<number, ApiProduct>();
    for (const p of products) m.set(p.product_id, p);
    return m;
  }, [products]);

  const totalUnits = useMemo(
    () => slotDraft.reduce((s, sl) => s + (Number(sl.quantity) || 0), 0),
    [slotDraft]
  );

  const opStatus = (machine?.status || "online").toLowerCase();
  const operationalOnline = opStatus === "online";
  const operationalMaintenance = opStatus === "maintenance";

  const metrics = machine
    ? [
        {
          title: t("machine.detail.stat.slots"),
          value: String(slotDraft.length),
          color: "var(--text)",
        },
        {
          title: t("machine.detail.stat.qty"),
          value: String(totalUnits),
          color: "var(--text)",
        },
        {
          title: t("machine.detail.stat.socket"),
          value: machine.is_online ? t("machine.detail.socketOn") : t("machine.detail.socketOff"),
          color: machine.is_online ? "var(--chart-series-1)" : "var(--text-muted)",
        },
        {
          title: t("machine.detail.stat.dbUpdated"),
          value: machine.last_active || "—",
          color: "var(--text-muted)",
        },
        {
          title: t("machine.detail.stat.status"),
          value: machine.status,
          color: operationalOnline
            ? "var(--success)"
            : operationalMaintenance
              ? "var(--warn)"
              : "var(--danger)",
        },
      ]
    : [];

  const activateSlot = (slotNum: number) => {
    const usedProductIds = new Set(slotDraft.map((r) => r.product_id));
    const firstUnused = products.find((p) => !usedProductIds.has(p.product_id));
    const pid = firstUnused?.product_id ?? products[0]?.product_id ?? 1;
    setSlotDraft((prev) => [
      ...prev,
      {
        rowKey: `slot-${slotNum}-${Date.now()}`,
        slot_number: slotNum,
        product_id: pid,
        quantity: 0,
      },
    ]);
  };

  const getAvailableProducts = (rowKey: string, currentProductId: number) => {
    const usedByOthers = new Set(
      slotDraft.filter((r) => r.rowKey !== rowKey).map((r) => r.product_id)
    );
    return products.filter(
      (p) => !usedByOthers.has(p.product_id) || p.product_id === currentProductId
    );
  };

  const removeSlotRow = (rowKey: string) => {
    setSlotDraft((prev) => prev.filter((r) => r.rowKey !== rowKey));
  };

  const updateDraftRow = (
    rowKey: string,
    patch: Partial<Pick<SlotDraftRow, "product_id" | "quantity">>
  ) => {
    setSlotDraft((prev) =>
      prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r))
    );
  };

  const handleDeleteMachine = async () => {
    setDeleting(true);
    try {
      await deleteMachine(machineCode);
      toast.success(t("deleteMachine.toastDeleted"));
      try {
        const { logAdminActivity } = await import("@/lib/activity-log");
        logAdminActivity({
          icon: "fi fi-rr-trash",
          color: "from-rose-500 to-rose-600",
          bg: "bg-rose-50",
          title: "ลบตู้สินค้าสำเร็จ",
          machine: machineCode,
          time: "เมื่อครู่นี้",
        });
      } catch (e) {
        console.error(e);
      }
      router.push("/machines");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("deleteMachine.toastFailed");
      toast.error(msg);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveSlots = async () => {
    if (!machine) return;
    setSaving(true);
    setError(null);

    const slotNumbers = slotDraft.map((r) => r.slot_number);
    if (new Set(slotNumbers).size !== slotNumbers.length) {
      setError(t("machine.detail.errorDuplicateSlot"));
      setSaving(false);
      return;
    }

    const productIds = slotDraft.map((r) => r.product_id);
    if (new Set(productIds).size !== productIds.length) {
      setError(t("machine.detail.errorDuplicateProduct"));
      setSaving(false);
      return;
    }

    const payload: ApiMachineSlotInput[] = slotDraft
      .slice()
      .sort((a, b) => a.slot_number - b.slot_number)
      .map((r) => ({
        slot_number: r.slot_number,
        product_id: r.product_id,
        quantity: Math.max(0, Math.floor(Number(r.quantity) || 0)),
      }));
    try {
      const updated = await updateMachineSlots(machine.machine_code, payload);
      setMachine(updated);
      setSlotDraft(slotsToDraft(updated.slots));
      toast.success(t("machine.detail.toastSaved"));
      try {
        const { logAdminActivity } = await import("@/lib/activity-log");
        logAdminActivity({
          icon: "fi fi-rr-edit",
          color: "from-[var(--primary)] to-[var(--primary)]",
          bg: "bg-orange-50",
          title: "แก้ไขสินค้าของตู้สำเร็จ",
          machine: machine.machine_code,
          time: "เมื่อครู่นี้",
        });
      } catch (err2) {
        console.error(err2);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("machine.detail.toastSaveFail"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleBack}
            className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--surface-1)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-black text-[var(--text)]">
                {loading ? "…" : machine?.machine_code || id}
              </h1>
              {!loading && machine && (
                <span
                  className={`px-3 py-1 text-[12px] font-bold rounded-full border flex items-center gap-1.5 ${
                    operationalOnline
                      ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-bg)]"
                      : operationalMaintenance
                        ? "bg-amber-50 text-amber-800 border-amber-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      operationalOnline
                        ? "bg-[var(--success)] animate-pulse"
                        : operationalMaintenance
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                  ></span>
                  {machine.status}
                </span>
              )}
            </div>
            <div className="text-[14px] font-bold text-[var(--text-muted)]">
              {machine?.location?.trim()
                ? machine.location
                : t("machine.detail.locationUnknown")}
            </div>
          </div>
        </div>
        <div className="shrink-0 self-start flex gap-2">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading || refreshing}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[13px] font-bold text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50 transition-colors"
          >
            {refreshing ? t("machine.detail.refreshing") : t("machine.detail.refresh")}
          </button>
          {!loading && machine && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || saving}
              className="px-4 py-2.5 rounded-xl border-2 border-rose-600 bg-rose-500 text-[13px] font-black text-white hover:bg-rose-600 shadow-[0_3px_10px_rgba(225,29,72,0.3)] hover:shadow-[0_4px_14px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <i className="fi fi-rr-trash"></i>
              {t("deleteMachine.button")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm font-bold">{error}</div>
      )}

      {!loading && machine && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              >
                <div className="text-[13px] font-bold text-[var(--text-muted)] mb-2">{m.title}</div>
                <div className="text-[22px] font-black leading-tight break-all" style={{ color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-[18px] font-black text-[var(--text)]">{t("machine.detail.stockBySlot")}</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (machine) setSlotDraft(slotsToDraft(machine.slots));
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[13px] font-bold text-[var(--text-muted)] hover:border-[var(--border)] disabled:opacity-50 transition-colors"
                >
                  {t("machine.detail.cancelEdit")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlots}
                  disabled={saving || productsLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)] text-[13px] font-bold hover:bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? t("machine.detail.saving") : t("machine.detail.saveStock")}
                </button>
              </div>
            </div>
            {productsLoading && (
              <p className="text-[13px] font-bold text-[var(--text-muted)] mb-4">{t("machine.detail.loadingProducts")}</p>
            )}
            {!productsLoading && products.length === 0 && (
              <p className="text-[13px] font-bold text-amber-700 mb-4">{t("machine.detail.noProducts")}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-3 px-2 font-black text-[var(--text-muted)]">{t("machine.detail.col.slot")}</th>
                    <th className="py-3 px-2 font-black text-[var(--text-muted)]">{t("machine.detail.col.product")}</th>
                    <th className="py-3 px-2 font-black text-[var(--text-muted)]">{t("machine.detail.col.qty")}</th>
                    <th className="py-3 px-2 font-black text-[var(--text-muted)]">{t("machine.detail.col.price")}</th>
                    <th className="py-3 px-2 font-black text-[var(--text-muted)] w-24"> </th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_SLOT_NUMBERS.map((slotNum) => {
                    const activeRow = slotDraft.find((r) => r.slot_number === slotNum);

                    if (!activeRow) {
                      return (
                        <tr key={slotNum} className="border-b border-[var(--border)] bg-[var(--surface-2)]/40">
                          <td className="py-3 px-2 font-bold align-middle text-[var(--text-muted)]">
                            {slotNum}
                          </td>
                          <td colSpan={3} className="py-3 px-2 align-middle">
                            <span className="text-[13px] font-bold text-[var(--text-muted)] italic">
                              — {t("machine.detail.slotEmpty")} —
                            </span>
                          </td>
                          <td className="py-3 px-2 align-middle">
                            <button
                              type="button"
                              onClick={() => activateSlot(slotNum)}
                              disabled={saving || productsLoading || products.length === 0}
                              className="text-[12px] font-bold text-[var(--primary)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t("machine.detail.slotActivate")}
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    const availableProducts = getAvailableProducts(activeRow.rowKey, activeRow.product_id);
                    const prod = productById.get(activeRow.product_id);
                    return (
                      <tr key={activeRow.rowKey} className="border-b border-[var(--border)]">
                        <td className="py-3 px-2 font-bold align-middle">{slotNum}</td>
                        <td className="py-3 px-2 align-middle">
                          <select
                            className="w-full max-w-[280px] rounded-lg border border-[var(--border)] px-2 py-1.5 font-bold text-[var(--text)] bg-[var(--surface-1)]"
                            value={activeRow.product_id}
                            onChange={(e) =>
                              updateDraftRow(activeRow.rowKey, {
                                product_id: Number(e.target.value),
                              })
                            }
                            disabled={saving || products.length === 0}
                          >
                            {!availableProducts.some((p) => p.product_id === activeRow.product_id) && (
                              <option value={activeRow.product_id}>
                                #{activeRow.product_id} {t("machine.detail.notInList")}
                              </option>
                            )}
                            {availableProducts.map((p) => (
                              <option key={p.product_id} value={p.product_id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 align-middle">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-24 rounded-lg border border-[var(--border)] px-2 py-1.5 font-black text-[var(--text)]"
                            value={String(activeRow.quantity)}
                            onKeyDown={blockNonIntegerKeys}
                            onChange={(e) => {
                              const v = digitsOnly(e.target.value);
                              updateDraftRow(activeRow.rowKey, {
                                quantity: v === "" ? 0 : parseInt(v, 10),
                              });
                            }}
                            disabled={saving}
                          />
                        </td>
                        <td className="py-3 px-2 align-middle font-bold">
                          {prod != null ? `฿${Number(prod.price).toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 px-2 align-middle">
                          <button
                            type="button"
                            onClick={() => removeSlotRow(activeRow.rowKey)}
                            disabled={saving}
                            className="text-[12px] font-bold text-rose-600 hover:underline disabled:opacity-50"
                          >
                            {t("machine.detail.removeSlot")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[12px] font-bold text-[var(--text-muted)]">
              {t("machine.detail.saveHint")
                .replace("{code}", machineCode)
                .replace("{max}", String(MAX_SLOTS))}
            </p>
          </div>
        </>
      )}
    </div>

    <Modal
      open={showDeleteConfirm}
      onClose={() => !deleting && setShowDeleteConfirm(false)}
      title={t("deleteMachine.confirmTitle")}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <i className="fi fi-rr-triangle-warning text-rose-600 text-lg"></i>
          </div>
          <p className="text-[14px] font-bold text-rose-800 leading-relaxed">
            {t("deleteMachine.confirmBody").replace("{code}", machineCode)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            className="flex-1 py-4 rounded-[22px] bg-[var(--surface-2)] text-[var(--text-muted)] font-black text-[14px] hover:bg-[var(--border)] transition-all disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteMachine()}
            disabled={deleting}
            className="flex-[2] py-4 rounded-[22px] bg-rose-600 text-white font-black text-[14px] hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? t("deleteMachine.deleting") : t("deleteMachine.confirmYes")}
          </button>
        </div>
      </div>
    </Modal>

    <Modal
      open={showUnsavedModal}
      onClose={() => setShowUnsavedModal(false)}
      title="มีข้อมูลที่ยังไม่ได้บันทึก"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <i className="fi fi-rr-triangle-warning text-rose-600 text-lg"></i>
          </div>
          <p className="text-[14px] font-bold text-rose-800 leading-relaxed">
            คุณมีการแก้ไขข้อมูลของตู้นี้ที่ยังไม่ได้ทำการบันทึก คุณต้องการออกจากหน้านี้โดยละทิ้งการเปลี่ยนแปลงหรือไม่?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowUnsavedModal(false)}
            className="flex-1 py-4 rounded-[22px] bg-[var(--surface-2)] text-[var(--text-muted)] font-black text-[14px] hover:bg-[var(--border)] transition-all"
          >
            ยังคงอยู่
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUnsavedModal(false);
              if (pendingNavUrl) {
                router.push(pendingNavUrl);
              } else {
                router.back();
              }
            }}
            className="flex-1 py-4 rounded-[22px] bg-rose-600 text-white font-black text-[14px] hover:bg-rose-700 transition-all active:scale-95"
          >
            ออกยกเลิก
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
