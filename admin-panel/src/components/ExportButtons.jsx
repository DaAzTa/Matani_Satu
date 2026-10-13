// src/components/ExportButtons.jsx
// "Unduh" button with a small menu: Excel or PDF.
// onDownload("excel" | "pdf") must return a promise.
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportButtons({ onDownload, disabled }) {
  const [buka, setBuka] = useState(false);
  const [sibuk, setSibuk] = useState("");
  const [galat, setGalat] = useState("");
  const ref = useRef(null);

  // close the menu when clicking elsewhere
  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => { if (ref.current && !ref.current.contains(e.target)) setBuka(false); };
    document.addEventListener("mousedown", tutup);
    return () => document.removeEventListener("mousedown", tutup);
  }, [buka]);

  const unduh = async (format) => {
    setSibuk(format);
    setGalat("");
    try {
      await onDownload(format);
      setBuka(false);
    } catch (e) {
      console.error(e);
      setGalat("Gagal membuat file. Coba lagi.");
    } finally {
      setSibuk("");
    }
  };

  const item = "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left hover:bg-[var(--bg-alt)] disabled:opacity-50";

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="btn-ghost" disabled={disabled} onClick={() => setBuka((b) => !b)}
        aria-haspopup="menu" aria-expanded={buka}>
        <Download className="h-4 w-4" /> Unduh <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {buka && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg">
          <button type="button" role="menuitem" className={item} disabled={!!sibuk} onClick={() => unduh("excel")}>
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            {sibuk === "excel" ? "Menyiapkan…" : "Excel (.xlsx)"}
          </button>
          <button type="button" role="menuitem" className={item} disabled={!!sibuk} onClick={() => unduh("pdf")}>
            <FileText className="h-4 w-4 text-rose-600" />
            {sibuk === "pdf" ? "Menyiapkan…" : "PDF"}
          </button>
          <p className="px-3 py-2 text-xs leading-relaxed text-[var(--text-muted)]">
            File mengikuti filter yang sedang aktif dan berisi data pribadi (NIK). Simpan dengan aman.
          </p>
          {galat && <p className="px-3 pb-2 text-xs text-[var(--danger)]">{galat}</p>}
        </div>
      )}
    </div>
  );
}