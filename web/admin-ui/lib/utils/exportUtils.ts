import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Utility functions for exporting data in various formats.
 */

export type ExportColumn = {
  key: string;
  label: string;
};

/**
 * Generates and triggers a download for a CSV file.
 */
export function exportToCSV(data: Record<string, unknown>[], columns: ExportColumn[], filename: string = "export") {
  if (!data || data.length === 0) {
    alert("ไม่มีข้อมูลที่จะส่งออก");
    return;
  }

  const header = columns.map(col => `"${String(col.label).replace(/"/g, '""')}"`).join(",");
  const rows = data.map(row => 
    columns.map(col => {
      const val = row[col.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" }); // Add BOM for Excel Thai support
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers a PDF download.
 * Uses html2canvas to capture a rendered table and jsPDF to save it.
 */
export async function exportToPDF(data: Record<string, unknown>[], columns: ExportColumn[], title: string = "รายงาน", filename: string = "export") {
  if (!data || data.length === 0) {
    alert("ไม่มีข้อมูลที่จะส่งออก");
    return;
  }

  // Create a temporary div for rendering
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.padding = "40px";
  container.style.background = "white";
  container.style.fontFamily = "'Inter', 'Sarabun', sans-serif";

  const tableHeader = `<tr>${columns.map(col => `<th style="background-color: #f8fafc; text-align: left; padding: 12px; font-weight: 600; border-bottom: 2px solid #e2e8f0; font-size: 14px;">${col.label}</th>`).join("")}</tr>`;
  const tableRows = data.map(row => 
    `<tr>${columns.map(col => `<td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${row[col.key] ?? "-"}</td>`).join("")}</tr>`
  ).join("");

  container.innerHTML = `
    <div style="color: #1e293b;">
      <h1 style="font-size: 24px; color: #0f172a; margin-bottom: 8px;">${title}</h1>
      <div style="font-size: 14px; color: #64748b; margin-bottom: 24px;">วันที่ส่งออก: ${new Date().toLocaleString('th-TH')}</div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8;">เอกสารนี้ถูกสร้างขึ้นโดยอัตโนมัติจากระบบจัดการตู้สินค้าอัจฉริยะ</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
  } finally {
    document.body.removeChild(container);
  }
}

