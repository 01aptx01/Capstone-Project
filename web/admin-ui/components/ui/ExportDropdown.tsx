"use client";

import { useEffect, useRef, useState } from "react";

type Column = { key: string; label?: string };

export default function ExportDropdown({ data, fetchUrl, filename = "export", title = "Exported Data", columns }: { data?: any[]; fetchUrl?: string; filename?: string; title?: string; columns?: Column[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function resolveData() {
    if (data && Array.isArray(data)) return data;
    if (fetchUrl) {
      setLoading(true);
      try {
        const r = await fetch(fetchUrl);
        const j = await r.json();
        return Array.isArray(j) ? j : [];
      } catch (e) {
        return [];
      } finally {
        setLoading(false);
      }
    }
    return [];
  }

  function toCSV(arr: any[], cols?: Column[]) {
    if (!arr || arr.length === 0) return "";
    const keys = cols && cols.length ? cols.map((c) => c.key) : Object.keys(arr[0]);
    const header = (cols && cols.length ? cols.map((c) => c.label || c.key) : keys).map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",");
    const rows = arr.map((row) => keys.map((k) => {
      let v = row[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") v = JSON.stringify(v);
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(","));
    return [header, ...rows].join("\n");
  }

  async function downloadCSV() {
    const arr = await resolveData();
    const csv = toCSV(arr, columns as Column[] | undefined);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  async function downloadPDF() {
    const arr = await resolveData();
    const keys = columns && columns.length ? columns.map((c) => c.key) : (arr[0] ? Object.keys(arr[0]) : []);
    const labels = columns && columns.length ? columns.map((c) => c.label || c.key) : keys;

    // Build printable HTML
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!win) {
      alert("Unable to open print window. Please allow popups.");
      return;
    }
    const style = `
      body{ font-family: Inter, Arial, sans-serif; color:#0F172A; padding:20px }
      h1{ font-size:18px; margin-bottom:12px }
      table{ width:100%; border-collapse:collapse; font-size:12px }
      th, td{ border:1px solid #E6E9EF; padding:8px; text-align:left }
      th{ background:#F8FAFC; font-weight:700 }
      @media print { thead {display: table-header-group} }
    `;
    let html = `<!doctype html><html><head><title>${title}</title><meta charset="utf-8"><style>${style}</style></head><body>`;
    html += `<h1>${title}</h1>`;
    html += `<table><thead><tr>${labels.map((l) => `<th>${String(l)}</th>`).join("")}</tr></thead><tbody>`;
    for (const row of arr) {
      html += `<tr>${keys.map((k) => `<td>${String(row[k] ?? "")}</td>`).join("")}</tr>`;
    }
    html += `</tbody></table>`;
    html += `</body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Wait for content to render then print
    setTimeout(() => {
      try {
        win.print();
      } catch (e) {
        console.error(e);
      }
    }, 300);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-bold text-[#64748B] shadow-sm hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, marginTop: 8, background: "white", border: "1px solid #E6E9EF", borderRadius: 8, boxShadow: "0 10px 30px rgba(2,6,23,0.06)", zIndex: 60 }}>
          <button onClick={downloadCSV} disabled={loading} style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: "transparent", border: 0 }}>Download CSV</button>
          <button onClick={downloadPDF} disabled={loading} style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: "transparent", border: 0 }}>Download PDF</button>
        </div>
      )}
    </div>
  );
}
