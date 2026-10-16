// src/components/GaleriPublik.jsx
// Public photo gallery with a full-screen viewer (arrows, swipe on phones, Esc).
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getGaleriPublik } from "../services/komunitasService";

export default function GaleriPublik() {
  const [foto, setFoto] = useState(undefined);
  const [buka, setBuka] = useState(null); // index of the open photo
  const [semua, setSemua] = useState(false);
  const sentuh = useRef(0);

  useEffect(() => {
    let batal = false;
    getGaleriPublik().then((d) => !batal && setFoto(d)).catch(() => !batal && setFoto([]));
    return () => { batal = true; };
  }, []);

  const n = foto?.length || 0;
  const pindah = (d) => setBuka((i) => (i + d + n) % n);

  useEffect(() => {
    if (buka === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setBuka(null);
      if (e.key === "ArrowRight") pindah(1);
      if (e.key === "ArrowLeft") pindah(-1);
    };
    document.addEventListener("keydown", onKey);
    const awal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = awal; };
  }, [buka, n]);

  if (foto !== undefined && n === 0) return null; // no photos: no empty box
  const tampil = semua ? foto : foto?.slice(0, 8);

  return (
    <section id="galeri" className="card p-5 sm:p-6">
      <h2 className="font-semibold">Galeri Foto</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">Dokumentasi kegiatan dan suasana kelurahan. Ketuk foto untuk memperbesar.</p>
      {foto === undefined ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton aspect-square" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {tampil.map((f, i) => (
              <button key={f.id} type="button" onClick={() => setBuka(i)} className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--bg-alt)]">
                <img src={f.foto_url} alt={f.judul || "Foto kelurahan"} loading="lazy" decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {f.judul && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs text-white line-clamp-2">{f.judul}</span>}
              </button>
            ))}
          </div>
          {n > 8 && (
            <button type="button" className="btn-ghost mt-4" onClick={() => setSemua((s) => !s)}>
              {semua ? "Tampilkan lebih sedikit" : `Lihat semua (${n} foto)`}
            </button>
          )}
        </>
      )}

      {buka !== null && foto[buka] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3" role="dialog" aria-modal="true"
          onClick={() => setBuka(null)}
          onTouchStart={(e) => { sentuh.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sentuh.current; if (Math.abs(dx) > 50) pindah(dx < 0 ? 1 : -1); }}>
          <button type="button" aria-label="Tutup" onClick={() => setBuka(null)}
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><X className="h-5 w-5" /></button>
          {n > 1 && <>
            <button type="button" aria-label="Sebelumnya" onClick={(e) => { e.stopPropagation(); pindah(-1); }}
              className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Berikutnya" onClick={(e) => { e.stopPropagation(); pindah(1); }}
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><ChevronRight className="h-5 w-5" /></button>
          </>}
          <figure className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={foto[buka].foto_url} alt={foto[buka].judul || "Foto kelurahan"} className="mx-auto max-h-[78vh] w-auto max-w-full rounded-lg object-contain" />
            <figcaption className="mt-3 flex justify-between gap-4 text-sm text-white/85">
              <span>{foto[buka].judul}</span><span className="text-white/50">{buka + 1} / {n}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}