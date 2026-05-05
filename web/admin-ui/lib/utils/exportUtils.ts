import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Utility functions for exporting data in various formats.
 */

export type ExportColumn = {
  key: string;
  label: string;
};

export type ExportPDFSection = {
  label: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
};

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

let sarabunBase64Cache: string | null = null;

async function getSarabunBase64(): Promise<string> {
  if (sarabunBase64Cache) return sarabunBase64Cache;
  const res = await fetch("/fonts/Sarabun-Regular.ttf");
  if (!res.ok) {
    throw new Error(`โหลดฟอนต์ไทยไม่สำเร็จ (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  sarabunBase64Cache = arrayBufferToBase64(buf);
  return sarabunBase64Cache;
}

function registerSarabun(doc: jsPDF, base64: string): void {
  doc.addFileToVFS("Sarabun-Regular.ttf", base64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun", "normal");
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

/**
 * Generates and triggers a download for a CSV file.
 * Optional metadata rows (report title + export time) appear above the header.
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string = "export",
  meta?: { reportTitle?: string }
) {
  if (!data || data.length === 0) {
    alert("ไม่มีข้อมูลที่จะส่งออก");
    return;
  }

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const emptyRow = columns.map(() => '""').join(",");
  const padFirstColumn = (text: string) =>
    columns
      .map((c, i) => (i === 0 ? esc(text) : '""'))
      .join(",");

  const lines: string[] = [];
  if (meta?.reportTitle) {
    lines.push(padFirstColumn(`รายงาน: ${meta.reportTitle}`));
    lines.push(padFirstColumn(`ส่งออกเมื่อ: ${new Date().toLocaleString("th-TH")}`));
    lines.push(emptyRow);
  }

  const header = columns.map((col) => esc(String(col.label))).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '""';
        return esc(String(val));
      })
      .join(",")
  );

  lines.push(header, ...rows);
  const csvContent = lines.join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const MM_MARGIN = 14;
const PRIMARY: [number, number, number] = [244, 123, 42];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_400: [number, number, number] = [148, 163, 184];

/**
 * PDF export: vector tables via jspdf-autotable, Thai font (Sarabun), one table per section.
 */
export async function exportToPDFSections(
  sections: ExportPDFSection[],
  pageTitle: string,
  filename: string
): Promise<void> {
  if (!sections.length) {
    alert("ไม่มีข้อมูลที่จะส่งออก");
    return;
  }

  let fontBase64: string;
  try {
    fontBase64 = await getSarabunBase64();
  } catch (e) {
    console.error(e);
    alert(e instanceof Error ? e.message : "โหลดฟอนต์ไทยไม่สำเร็จ");
    return;
  }

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  registerSarabun(doc, fontBase64);

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = MM_MARGIN;

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...SLATE_900);
  doc.text(pageTitle, MM_MARGIN, y);
  y += 9;

  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text(
    `วันที่ส่งออก: ${new Date().toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}`,
    MM_MARGIN,
    y
  );
  y += 10;

  const drawFooter = (data: { pageNumber: number }) => {
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_400);
    const total = doc.getNumberOfPages();
    const footer = `เอกสารจากระบบจัดการตู้สินค้า — หน้า ${data.pageNumber} / ${total}`;
    doc.text(footer, pageW / 2, pageH - 6, { align: "center" });
  };

  for (let si = 0; si < sections.length; si++) {
    const section = sections[si]!;
    if (y > pageH - 50) {
      doc.addPage();
      doc.setFont("Sarabun", "normal");
      y = MM_MARGIN;
    }

    doc.setFont("Sarabun", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(section.label, MM_MARGIN, y);
    y += 6;

    const head = [section.columns.map((c) => c.label)];
    const body =
      section.rows.length === 0
        ? [section.columns.map((_, i) => (i === 0 ? "ไม่มีข้อมูลในชุดนี้" : "—"))]
        : section.rows.map((row) => section.columns.map((col) => formatCell(row[col.key])));

    autoTable(doc, {
      startY: y,
      head,
      body,
      margin: { left: MM_MARGIN, right: MM_MARGIN },
      theme: "striped",
      styles: {
        font: "Sarabun",
        fontSize: 9,
        cellPadding: 2.8,
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        textColor: SLATE_900,
      },
      headStyles: {
        font: "Sarabun",
        /** Theme `striped` defaults head to bold; only `normal` is registered — bold would fall back to Helvetica and garble Thai. */
        fontStyle: "normal",
        fillColor: [248, 250, 252],
        textColor: SLATE_900,
        fontSize: 9.5,
      },
      footStyles: {
        font: "Sarabun",
        fontStyle: "normal",
      },
      alternateRowStyles: { fillColor: [255, 252, 249] },
      showHead: "everyPage",
      didDrawPage: drawFooter,
    });

    const last = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY;
    y = (last ?? y) + (si < sections.length - 1 ? 12 : 8);
  }

  doc.save(`${filename}.pdf`);
}
