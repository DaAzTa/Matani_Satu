// src/components/PetaWilayah.jsx
// Area map for the public page. Shows a light preview image; clicking it opens
// a full-screen viewer (zoom + scroll) that loads the large image only then.
// Files go in admin-panel/public/ :
//   peta-wilayah-kecil.webp  (preview, about 1600 px wide)
//   peta-wilayah.webp        (full size, about 4000 px wide)
import { useEffect, useState } from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";

const PREVIEW = "/peta-wilayah-kecil.webp";
const FULL = "/peta-wilayah.webp";

export default function PetaWilayah() {
  const [buka, setBuka] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [gagal, setGagal] = useState(false);

  // close with Esc and stop the page behind from scrolling while the viewer is open
  useEffect(() => {
    if (!buka) return;
    const onKey = (e) => e.key === "Escape" && setBuka(false);
    document.addEventListener("keydown", onKey);
    const awal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = awal;
    };
  }, [buka]);

  const bukaPeta = () => { setZoom(100); setBuka(true); };

  return (
    <section id="peta-wilayah" className="card p-6">
      <h2 className="font-semibold">Peta Wilayah</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">
        Peta wilayah Kelurahan Matani Satu. Klik peta untuk memperbesar.
      </p>

      {gagal ? (
        <p className="text-sm text-[var(--text-muted)]">Peta belum tersedia.</p>
      ) : (
        <button type="button" onClick={bukaPeta}
          className="group relative block w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]"
          aria-label="Perbesar peta wilayah">
          <img src={PREVIEW} alt="Peta wilayah Kelurahan Matani Satu" loading="lazy" decoding="async"
            onError={() => setGagal(true)} className="w-full h-auto max-h-[70vh] object-contain" />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white group-hover:bg-black/80">
            <Maximize2 className="h-3.5 w-3.5" /> Perbesar
          </span>
        </button>
      )}

      {buka && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85" role="dialog" aria-modal="true" aria-label="Peta wilayah">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-sm font-medium truncate">Peta Wilayah Kelurahan Matani Satu</p>
            <div className="flex items-center gap-1.5">
              <button type="button" className="rounded-lg bg-white/15 p-2 hover:bg-white/25 disabled:opacity-40"
                onClick={() => setZoom((z) => Math.max(100, z - 50))} disabled={zoom <= 100} aria-label="Perkecil">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm tabular-nums">{zoom}%</span>
              <button type="button" className="rounded-lg bg-white/15 p-2 hover:bg-white/25 disabled:opacity-40"
                onClick={() => setZoom((z) => Math.min(400, z + 50))} disabled={zoom >= 400} aria-label="Perbesar">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" className="ml-2 rounded-lg bg-white/15 p-2 hover:bg-white/25"
                onClick={() => setBuka(false)} aria-label="Tutup">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-4">
            <img src={FULL} alt="Peta wilayah Kelurahan Matani Satu (ukuran penuh)" decoding="async"
              style={{ width: `${zoom}%`, maxWidth: "none" }} className="mx-auto h-auto rounded-lg bg-white" />
          </div>
        </div>
      )}
    </section>
  );
}