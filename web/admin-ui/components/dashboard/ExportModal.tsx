"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-select all sections when modal opens with new sections
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      setSelectedSections(sections.map(s => s.id));
    }
  }, [isOpen, sections]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleFormat = (fmt: 'csv' | 'pdf') => {
    setExportFormats(prev => {
      const next = new Set(prev);
      if (next.has(fmt)) {
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
    if (selectedSections.length === 0) return;
    setIsExporting(true);
    try {
      const { allData, allColumns } = await buildExportData();
      const timestamp = new Date().toISOString().split('T')[0];
      const safeTitle = pageTitle.replace(/\s+/g, '_').toLowerCase();
      const filename = `${safeTitle}_${timestamp}`;

      if (exportFormats.has('csv')) exportToCSV(allData, allColumns, filename);
      if (exportFormats.has('pdf')) await exportToPDF(allData, allColumns, pageTitle, filename);

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatInfo = {
    csv: { label: "CSV (.csv)", icon: "fi-rr-file-csv", color: "#10B981", bg: "#ECFDF5", desc: "Excel / Database" },
    pdf: { label: "PDF (.pdf)", icon: "fi-rr-file-pdf", color: "#EF4444", bg: "#FEF2F2", desc: "Print / Share" },
  };

  const formatKeys: Array<'csv' | 'pdf'> = ['csv', 'pdf'];

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[32px] shadow-[0_32px_100px_rgba(15,23,42,0.2)] overflow-hidden border border-white/60 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[#f47b2a] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fi fi-rr-download" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-800 tracking-tight leading-none">ส่งออกข้อมูล</h2>
              <p className="text-[13px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">{pageTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm">
            <i className="fi fi-rr-cross-small text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-8 space-y-8">
          {/* 1. Data Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">1 — เลือกข้อมูลที่ต้องการ</p>
              <button 
                onClick={() => setSelectedSections(selectedSections.length === sections.length ? [] : sections.map(s => s.id))}
                className="text-[12px] font-black text-[#f47b2a] hover:underline uppercase tracking-wider"
              >
                {selectedSections.length === sections.length ? "Clear All" : "Select All"}
              </button>
            </div>
            <div className="space-y-2.5">
              {sections.map(section => {
                const isSelected = selectedSections.includes(section.id);
                return (
                  <div 
                    key={section.id} 
                    onClick={() => toggleSection(section.id)}
                    className={`p-4 rounded-[22px] border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                      isSelected ? "border-[#f47b2a] bg-orange-50/50 shadow-[0_8px_20px_rgba(244,123,42,0.08)]" : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? "bg-[#f47b2a] border-[#f47b2a] shadow-sm" : "border-slate-200"
                    }`}>
                      {isSelected && <i className="fi fi-rr-check text-[10px] text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-[15px] font-black ${isSelected ? "text-[#f47b2a]" : "text-slate-700"}`}>{section.label}</h3>
                      <p className={`text-[12px] font-medium ${isSelected ? "text-orange-700/60" : "text-slate-400"}`}>{section.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Format Selection */}
          <div className="space-y-4">
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">2 — รูปแบบไฟล์</p>
            <div className="grid grid-cols-2 gap-4">
              {formatKeys.map(fmt => {
                const info = formatInfo[fmt];
                const isSelected = exportFormats.has(fmt);
                return (
                  <div 
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`p-5 rounded-[22px] border-2 cursor-pointer transition-all duration-300 flex flex-col gap-3 ${
                      isSelected ? "shadow-lg scale-[1.02]" : "border-slate-100 opacity-60 hover:opacity-100"
                    }`}
                    style={{ borderColor: isSelected ? info.color : "", backgroundColor: isSelected ? info.bg : "white" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white shadow-sm" style={{ color: info.color }}>
                        <i className={`fi ${info.icon}`} />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-slate-800 border-slate-800" : "border-slate-200"}`}>
                        {isSelected && <i className="fi fi-rr-check text-[8px] text-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-black" style={{ color: isSelected ? info.color : "#64748B" }}>{info.label}</div>
                      <div className="text-[11px] font-bold opacity-60">{info.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[15px] rounded-2xl hover:bg-slate-50 transition-all active:scale-95">ยกเลิก</button>
          <button 
            onClick={handleExport}
            disabled={isExporting || selectedSections.length === 0}
            className="flex-[2] py-4 bg-gradient-to-r from-[#f47b2a] to-[#FB923C] text-white font-black text-[16px] rounded-2xl shadow-[0_15px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_20px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 transition-all disabled:opacity-40 disabled:pointer-events-none active:translate-y-0"
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fi fi-rr-spinner animate-spin" /> กำลังส่งออก...
              </span>
            ) : (
              <span>ดาวน์โหลดข้อมูล ({selectedSections.length} รายการ)</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

