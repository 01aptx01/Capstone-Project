"use client";

import React, { useState, useEffect } from "react";
import { exportToCSV, exportToPDF, ExportColumn } from "@/lib/utils/exportUtils";
import { ExportSection } from "@/lib/context/UIContext";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ExportSection[];
  pageTitle: string;
}

export default function ExportModal({ isOpen, onClose, sections, pageTitle }: ExportModalProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [exportFormats, setExportFormats] = useState<Set<'csv' | 'pdf'>>(new Set(['csv']));
  const [isExporting, setIsExporting] = useState(false);

  // Auto-select all sections when modal opens with new sections
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      setSelectedSections(sections.map(s => s.id));
    }
  }, [isOpen, sections]);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleFormat = (fmt: 'csv' | 'pdf') => {
    setExportFormats(prev => {
      const next = new Set(prev);
      if (next.has(fmt)) {
        // Don't allow deselecting both
        if (next.size > 1) next.delete(fmt);
      } else {
        next.add(fmt);
      }
      return next;
    });
  };

  const buildExportData = async () => {
    const allData: Record<string, unknown>[] = [];
    const allColumns: ExportColumn[] = [];

    for (const sectionId of selectedSections) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const data = await section.fetchData();
        if (allData.length > 0) {
          allData.push({ [section.columns[0].key]: "" });
        }
        if (selectedSections.length > 1) {
          allData.push({ [section.columns[0].key]: `— ${section.label} —` });
        }
        allData.push(...data);
        section.columns.forEach(col => {
          if (!allColumns.find(c => c.key === col.key)) {
            allColumns.push(col);
          }
        });
      }
    }

    return { allData, allColumns };
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      alert("กรุณาเลือกข้อมูลอย่างน้อย 1 อย่าง");
      return;
    }
    if (exportFormats.size === 0) {
      alert("กรุณาเลือกรูปแบบไฟล์อย่างน้อย 1 อย่าง");
      return;
    }

    setIsExporting(true);
    try {
      const { allData, allColumns } = await buildExportData();
      const timestamp = new Date().toISOString().split('T')[0];
      const safeTitle = pageTitle.replace(/\s+/g, '_').toLowerCase();
      const filename = `${safeTitle}_${timestamp}`;

      if (exportFormats.has('csv')) {
        exportToCSV(allData, allColumns, filename);
      }
      if (exportFormats.has('pdf')) {
        await exportToPDF(allData, allColumns, pageTitle, filename);
      }

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    } finally {
      setIsExporting(false);
    }
  };

  const formatInfo = {
    csv: { label: "CSV (.csv)", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ), color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", desc: "เหมาะสำหรับ Excel / ฐานข้อมูล" },
    pdf: { label: "PDF (.pdf)", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M9 15v-4h2a2 2 0 0 1 0 4H9z"/>
        <path d="M14 11v4"/>
        <path d="M14 11h2"/>
        <path d="M14 13h1.5"/>
      </svg>
    ), color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", desc: "เหมาะสำหรับพิมพ์ / แชร์" },
  };

  const formatKeys: Array<'csv' | 'pdf'> = ['csv', 'pdf'];
  const exportingBoth = exportFormats.has('csv') && exportFormats.has('pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-[6px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_25px_60px_-10px_rgba(15,23,42,0.2)] overflow-hidden border border-[#E2E8F0] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF7ED] rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#0F172A] tracking-tight leading-none">
                ส่งออกข้อมูล
              </h2>
              <p className="text-[12px] text-[#64748B] font-medium mt-0.5">{pageTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-full transition-all text-[#94A3B8] hover:text-[#0F172A]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">

          {/* Section selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-[#94A3B8] uppercase tracking-widest">
                1 — เลือกข้อมูล
              </p>
              <button
                onClick={() =>
                  selectedSections.length === sections.length
                    ? setSelectedSections([])
                    : setSelectedSections(sections.map(s => s.id))
                }
                className="text-[12px] font-bold text-[#FF6A00] hover:underline"
              >
                {selectedSections.length === sections.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
            </div>

            {sections.map(section => {
              const isSelected = selectedSections.includes(section.id);
              return (
                <div
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                    isSelected
                      ? "border-[#FF6A00] bg-[#FFF7ED] shadow-[0_4px_20px_rgba(255,106,0,0.08)]"
                      : "border-[#F1F5F9] hover:border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? "bg-[#FF6A00] border-[#FF6A00]" : "border-[#CBD5E1] bg-white"
                  }`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[14px] font-bold transition-colors ${isSelected ? "text-[#FF6A00]" : "text-[#1E293B]"}`}>
                      {section.label}
                    </h3>
                    <p className={`text-[12px] mt-0.5 transition-colors ${isSelected ? "text-[#C2410C]" : "text-[#64748B]"}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Format selector — CHECKBOXES (multi-select) */}
          <div className="space-y-3">
            <p className="text-[12px] font-extrabold text-[#94A3B8] uppercase tracking-widest">
              2 — รูปแบบไฟล์ (เลือกได้หลายแบบ)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {formatKeys.map(fmt => {
                const info = formatInfo[fmt];
                const isSelected = exportFormats.has(fmt);
                return (
                  <div
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                      isSelected
                        ? `border-[${info.color}] bg-[${info.bg}] shadow-[0_4px_16px_rgba(0,0,0,0.06)]`
                        : "border-[#F1F5F9] hover:border-[#E2E8F0] bg-white"
                    }`}
                    style={isSelected ? {
                      borderColor: info.color,
                      backgroundColor: info.bg,
                    } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all`}
                        style={isSelected ? { backgroundColor: info.color, borderColor: info.color } : { borderColor: "#CBD5E1", backgroundColor: "white" }}
                      >
                        {isSelected && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-[14px] font-bold"
                        style={{ color: isSelected ? info.color : "#475569" }}
                      >
                        {info.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-0.5" style={{ color: isSelected ? info.color : "#94A3B8" }}>
                      <span className="opacity-70">{info.icon}</span>
                      <span className="text-[11px] font-medium">{info.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {exportingBoth && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p className="text-[12px] font-semibold text-[#16A34A]">
                  จะดาวน์โหลด 2 ไฟล์พร้อมกัน (CSV + PDF)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-[#E2E8F0] text-[#64748B] font-bold text-[14px] rounded-xl hover:bg-white hover:text-[#0F172A] transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedSections.length === 0}
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#FF6A00] hover:bg-[#E55F00] text-white rounded-xl text-[15px] font-black shadow-[0_8px_24px_rgba(255,106,0,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] hover:-translate-y-0.5"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>กำลังส่งออก...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>
                  ดาวน์โหลด {[...exportFormats].map(f => f.toUpperCase()).join(' + ')}
                  {selectedSections.length > 0 ? ` (${selectedSections.length} ชุด)` : ''}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
