"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { updateMachine } from "@/lib/admin-api";
import { ADMIN_MACHINES_REFRESH_EVENT } from "@/components/machines/AddMachineModal";

interface EditMachineModalProps {
  open: boolean;
  onClose: () => void;
  machine: Record<string, unknown> | null;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "online", label: "พร้อมขาย (online)" },
  { value: "maintenance", label: "ซ่อมบำรุง (maintenance)" },
  { value: "offline", label: "ปิด / ออฟไลน์ (offline)" },
];

export default function EditMachineModal({ open, onClose, machine }: EditMachineModalProps) {
  const [machineCode, setMachineCode] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("online");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!machine) return;
    queueMicrotask(() => {
      const code = String(machine.id ?? machine.name ?? "").trim();
      setMachineCode(code);
      setLocation(String(machine.location ?? ""));
      const st = String(machine.status ?? "online").trim();
      setStatus(
        st === "maintenance" || st === "offline" || st === "online" ? st : "online"
      );
    });
  }, [machine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineCode) {
      toast.error("ไม่พบรหัสตู้");
      return;
    }
    setSaving(true);
    try {
      await updateMachine(machineCode, {
        location: location.trim() === "" ? null : location.trim(),
        status,
      });
      toast.success("บันทึกข้อมูลตู้แล้ว");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ADMIN_MACHINES_REFRESH_EVENT));
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "บันทึกไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="แก้ไขข้อมูลตู้ขายสินค้า">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 p-12 opacity-5 pointer-events-none">
          <svg
            width="240"
            height="240"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#f47b2a]"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 p-2">
          <p className="text-[12px] font-bold text-slate-500 leading-relaxed">
            รหัสตู้ (machine_code) อ่านอย่างเดียวจากฐานข้อมูล — แก้ได้เฉพาะสถานที่และสถานะปฏิบัติการ
          </p>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em]">
              รหัสตู้
            </label>
            <input
              type="text"
              readOnly
              className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-[24px] text-[15px] font-bold text-slate-600 cursor-not-allowed"
              value={machineCode}
            />
          </div>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] group-focus-within:text-[#f47b2a] transition-colors">
              สถานที่ตั้ง (location)
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f47b2a] transition-colors">
                <i className="fi fi-rr-marker"></i>
              </span>
              <input
                type="text"
                placeholder="เว้นว่างได้ — จะบันทึกเป็นค่าว่างในระบบ"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[#334155]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="group space-y-2">
            <label className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-[0.2em] group-focus-within:text-[#f47b2a] transition-colors">
              สถานะปฏิบัติการ (status ในฐานข้อมูล)
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <i className="fi fi-rr-power"></i>
              </span>
              <select
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:border-[#f47b2a]/30 focus:bg-white focus:shadow-[0_10px_30px_rgba(244,123,42,0.08)] transition-all text-[15px] font-bold text-[#334155] appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <i className="fi fi-rr-angle-small-down text-xl"></i>
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 rounded-[28px] text-[15px] font-black hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] px-8 py-5 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white rounded-[28px] text-[16px] font-black shadow-[0_20px_40px_rgba(244,123,42,0.25)] hover:shadow-[0_25px_50px_rgba(244,123,42,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{saving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}</span>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-check text-lg"></i>
              </div>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
