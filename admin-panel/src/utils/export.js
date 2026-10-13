// src/utils/export.js
// Excel / PDF download. The libraries load only when a button is clicked,
// so they do not slow down the normal pages.

const tanggalCetak = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** kolom = [{ header: "NIK", value: (baris, index) => baris.nik, width: 20 }] */
export async function eksporExcel({ namaFile, namaSheet, kolom, baris }) {
  const mod = await import("xlsx");
  const XLSX = mod.utils ? mod : mod.default;
  const isi = [
    kolom.map((k) => k.header),
    ...baris.map((b, i) => kolom.map((k) => k.value(b, i) ?? "")),
  ];
  const ws = XLSX.utils.aoa_to_sheet(isi);
  ws["!cols"] = kolom.map((k) => ({ wch: k.width ?? 16 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, (namaSheet || "Data").slice(0, 31));
  XLSX.writeFile(wb, `${namaFile}.xlsx`);
}

export async function eksporPdf({ namaFile, judul, subjudul, kolom, baris }) {
  const [{ jsPDF }, tabel] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const autoTable = tabel.default ?? tabel.autoTable;

  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text(judul, 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(100);
  let y = 56;
  if (subjudul) { doc.text(subjudul, 40, y); y += 13; }
  doc.text(`Dicetak ${tanggalCetak()}  |  ${baris.length} baris`, 40, y);

  const opsi = {
    startY: y + 12,
    head: [kolom.map((k) => k.header)],
    body: baris.map((b, i) => kolom.map((k) => String(k.value(b, i) ?? ""))),
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [31, 58, 95] },
    margin: { left: 40, right: 40, bottom: 36 },
  };
  if (typeof autoTable === "function") autoTable(doc, opsi);
  else doc.autoTable(opsi);

  const n = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(120);
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.text("Dokumen ini berisi data pribadi penduduk. Simpan dan gunakan dengan hati-hati.", 40, h - 18);
    doc.text(`Halaman ${i} dari ${n}`, w - 40, h - 18, { align: "right" });
  }
  doc.save(`${namaFile}.pdf`);
}