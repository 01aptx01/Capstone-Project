"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  exportToCSV,
  exportToPDFSections,
  type ExportColumn,
  type ExportPDFSection,
} from "@/lib/utils/exportUtils";
import { ExportSection } from "@/lib/context/UIContext";
import { useLang } from "@/lib/i18n/lang";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ExportSection[];
  pageTitle: string;
}

export default function ExportModal({ isOpen, onClose, sections, pageTitle }: ExportModalProps) {
  const { t } = useLang();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [exportFormats, setExportFormats] = useState<Set<'csv' | 'pdf'>>(new Set(['csv']));
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-select all sections when modal opens with new sections
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      queueMicrotask(() => {
        setSelectedSections(sections.map((s) => s.id));
      });
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

  const handleExport = async () => {
    if (selectedSections.length === 0) return;
    setIsExporting(true);
    try {
      type Fetched = { section: (typeof sections)[number]; rows: Record<string, unknown>[] };
      const fetched: Fetched[] = [];
      for (const sectionId of selectedSections) {
        const section = sections.find((s) => s.id === sectionId);
        if (section) {
          const rows = await section.fetchData();
          fetched.push({ section, rows });
        }
      }

      if (fetched.length === 0) {
        alert(t("exportModal.selectAtLeast"));
        return;
      }

      const allData: Record<string, unknown>[] = [];
      const allColumns: ExportColumn[] = [];
      for (const { section, rows } of fetched) {
        if (allData.length > 0) {
          allData.push({ [section.columns[0].key]: "" });
        }
        if (fetched.length > 1) {
          allData.push({ [section.columns[0].key]: `— ${section.label} —` });
        }
        allData.push(...rows);
        section.columns.forEach((col) => {
          if (!allColumns.find((c) => c.key === col.key)) {
            allColumns.push(col);
          }
        });
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const safeTitle = pageTitle.replace(/\s+/g, "_").toLowerCase();
      const filename = `${safeTitle}_${timestamp}`;

      if (exportFormats.has("csv")) {
        if (allData.length === 0) {
          alert(t("exportModal.noCsvData"));
        } else {
          exportToCSV(allData, allColumns, filename, { reportTitle: pageTitle });
        }
      }
      if (exportFormats.has("pdf")) {
        const pdfSections: ExportPDFSection[] = fetched.map(({ section, rows }) => ({
          label: section.label,
          columns: section.columns,
          rows,
        }));
        await exportToPDFSections(pdfSections, pageTitle, filename);
      }

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatInfo = {
    csv: { label: "CSV (.csv)", icon: "fi-rr-file-csv", color: "var(--success)", bg: "var(--success-bg)", desc: "Excel / Database" },
    pdf: { label: "PDF (.pdf)", icon: "fi-rr-file-pdf", color: "var(--danger)", bg: "var(--danger-bg)", desc: "Print / Share" },
  };

  const formatKeys: Array<'csv' | 'pdf'> = ['csv', 'pdf'];

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[var(--overlay)]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--surface-1)] w-full max-w-lg rounded-[32px] shadow-[0_32px_100px_rgba(15,23,42,0.2)] overflow-hidden border border-[var(--border)]/60 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[var(--primary)] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fi fi-rr-download" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight leading-none">{t("exportModal.title")}</h2>
              <p className="text-[13px] text-[var(--text-muted)] font-bold mt-1.5 uppercase tracking-wider">{pageTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all shadow-sm">
            <i className="fi fi-rr-cross-small text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-8 space-y-8">
          {/* 1. Data Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{t("exportModal.step1")}</p>
              <button 
                onClick={() => setSelectedSections(selectedSections.length === sections.length ? [] : sections.map(s => s.id))}
                className="text-[12px] font-black text-[var(--primary)] hover:underline uppercase tracking-wider"
              >
                {selectedSections.length === sections.length ? t("exportModal.clearAll") : t("exportModal.selectAll")}
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
                      isSelected ? "border-[var(--primary)] bg-orange-50/50 shadow-[0_8px_20px_rgba(244,123,42,0.08)]" : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border)]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? "bg-[var(--primary)] border-[var(--primary)] shadow-sm" : "border-[var(--border)]"
                    }`}>
                      {isSelected && <i className="fi fi-rr-check text-[10px] text-[var(--primary-contrast)]" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-[15px] font-black ${isSelected ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>{section.label}</h3>
                      <p className={`text-[12px] font-medium ${isSelected ? "text-orange-700/60" : "text-[var(--text-muted)]"}`}>{section.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Format Selection */}
          <div className="space-y-4">
            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{t("exportModal.step2")}</p>
            <div className="grid grid-cols-2 gap-4">
              {formatKeys.map(fmt => {
                const info = formatInfo[fmt];
                const isSelected = exportFormats.has(fmt);
                return (
                  <div 
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`p-5 rounded-[22px] border-2 cursor-pointer transition-all duration-300 flex flex-col gap-3 ${
                      isSelected ? "shadow-lg scale-[1.02]" : "border-[var(--border)] opacity-60 hover:opacity-100"
                    }`}
                    style={{ borderColor: isSelected ? info.color : "", backgroundColor: isSelected ? info.bg : "white" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-[var(--surface-1)] shadow-sm" style={{ color: info.color }}>
                        <i className={`fi ${info.icon}`} />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-[var(--text)] border-[var(--border)]" : "border-[var(--border)]"}`}>
                        {isSelected && <i className="fi fi-rr-check text-[8px] text-[var(--primary-contrast)]" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-black" style={{ color: isSelected ? info.color : "var(--text-muted)" }}>{info.label}</div>
                      <div className="text-[11px] font-bold opacity-60">{info.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-[var(--surface-2)]/50 border-t border-[var(--border)] flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] font-black text-[15px] rounded-2xl hover:bg-[var(--surface-2)] transition-all active:scale-95">{t("common.cancel")}</button>
          <button 
            onClick={handleExport}
            disabled={isExporting || selectedSections.length === 0}
            className="flex-[2] py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-contrast)] font-black text-[16px] rounded-2xl shadow-[0_15px_30px_rgba(244,123,42,0.25)] hover:shadow-[0_20px_40px_rgba(244,123,42,0.35)] hover:-translate-y-1 transition-all disabled:opacity-40 disabled:pointer-events-none active:translate-y-0"
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fi fi-rr-spinner animate-spin" /> {t("exportModal.exporting")}
              </span>
            ) : (
              <span>{t("exportModal.download").replace("{n}", String(selectedSections.length))}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

