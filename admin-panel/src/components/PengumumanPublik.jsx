// src/components/PengumumanPublik.jsx
// "Pengumuman dan Berita" block for the public page (published items only).
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getPengumumanPublik } from "../services/pengumumanService";

const tgl = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export function KartuPengumuman({ item, onBuka }) {
  return (
    <button type="button" onClick={() => onBuka(item)}
      className="group text-left overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-colors">
      {item.foto_url && (
        <img src={item.foto_url} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
      )}
      <div className="p-4">
        <p className="text-xs text-[var(--text-muted)]">{tgl(item.tanggal)}</p>
        <h3 className="mt-1 font-semibold leading-snug group-hover:text-[var(--primary)]">{item.judul}</h3>
        <p className="mt-1.5 text-sm text-[var(--text-muted)] line-clamp-3 whitespace-pre-line">{item.isi}</p>
      </div>
    </button>
  );
}

export default function PengumumanPublik() {
  const [daftar, setDaftar] = useState(undefined); // undefined = loading
  const [dibuka, setDibuka] = useState(null);

  useEffect(() => {
    let batal = false;
    getPengumumanPublik().then((d) => !batal && setDaftar(d)).catch(() => !batal && setDaftar([]));
    return () => { batal = true; };
  }, []);

  useEffect(() => {
    if (!dibuka) return;
    const onKey = (e) => e.key === "Escape" && setDibuka(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dibuka]);

  if (daftar !== undefined && daftar.length === 0) return null; // nothing to show: no empty box

  return (
    <section id="pengumuman" className="card p-6">
      <h2 className="font-semibold">Pengumuman dan Berita</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-5">Informasi terbaru dari Kelurahan Matani Satu.</p>
      {daftar === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-48" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((p) => <KartuPengumuman key={p.id} item={p} onBuka={setDibuka} />)}
        </div>
      )}

      {dibuka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true"
          aria-label={dibuka.judul} onClick={() => setDibuka(null)}>
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-[var(--card)] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-3 top-3 z-10 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
              onClick={() => setDibuka(null)} aria-label="Tutup"><X className="h-4 w-4" /></button>
            {dibuka.foto_url && <img src={dibuka.foto_url} alt="" className="w-full max-h-[50vh] object-cover" />}
            <div className="p-6">
              <p className="text-xs text-[var(--text-muted)]">{tgl(dibuka.tanggal)}</p>
              <h3 className="mt-1 text-lg font-semibold">{dibuka.judul}</h3>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{dibuka.isi}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}