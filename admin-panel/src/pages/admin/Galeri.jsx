// src/pages/admin/Galeri.jsx
// Photo gallery (/admin/galeri): upload several photos at once, edit captions,
// hide or delete. Shown on the public pages.
import { useEffect, useState } from "react";
import { Eye, EyeOff, ImagePlus, Trash2, Upload } from "lucide-react";
import { getSemuaGaleri, hapusGaleri, tambahGaleri, ubahGaleri } from "../../services/komunitasService";

const p2 = (n) => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const MAKS_FILE = 12;

export default function Galeri() {
  const [daftar, setDaftar] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [antre, setAntre] = useState([]); // [{ file, preview, judul }]
  const [proses, setProses] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };
  const muat = () => getSemuaGaleri().then((d) => { setDaftar(d); setGagal(false); }).catch(() => { setGagal(true); setDaftar([]); });
  useEffect(() => { muat(); }, []);
  useEffect(() => () => antre.forEach((a) => URL.revokeObjectURL(a.preview)), []); // eslint-disable-line

  const pilihFile = (e) => {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith("image/")).slice(0, MAKS_FILE);
    e.target.value = "";
    setAntre((a) => [...a, ...files.map((file) => ({ file, preview: URL.createObjectURL(file), judul: "" }))].slice(0, MAKS_FILE));
  };
  const buangAntre = (i) => setAntre((a) => { URL.revokeObjectURL(a[i].preview); return a.filter((_, n) => n !== i); });

  const unggah = async () => {
    let berhasil = 0;
    for (let i = 0; i < antre.length; i++) {
      setProses(`Mengunggah ${i + 1} dari ${antre.length}…`);
      try { await tambahGaleri({ file: antre[i].file, judul: antre[i].judul, tanggal: hariIni() }); berhasil++; }
      catch (e) { showToast(`Foto ${i + 1}: ${e.message}`, "error"); break; }
    }
    antre.forEach((a) => URL.revokeObjectURL(a.preview));
    setAntre([]); setProses("");
    if (berhasil) showToast(`${berhasil} foto ditambahkan ke galeri.`);
    await muat();
  };

  const simpanJudul = async (f, judul) => {
    if (judul.trim() === (f.judul || "")) return;
    try { await ubahGaleri(f.id, { judul: judul.trim() }); showToast("Keterangan disimpan."); await muat(); }
    catch (e) { showToast(e.message, "error"); }
  };
  const ubahTampil = async (f) => {
    try { await ubahGaleri(f.id, { terbit: !f.terbit }); await muat(); }
    catch (e) { showToast(e.message, "error"); }
  };
  const hapus = async (f) => {
    if (!window.confirm("Hapus foto ini dari galeri?")) return;
    try { await hapusGaleri(f); showToast("Foto dihapus."); await muat(); }
    catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Galeri Foto</h2>
        <p className="text-sm text-[var(--text-muted)]">Foto yang diunggah di sini tampil di halaman publik. Foto diperkecil otomatis agar halaman tetap ringan.</p>
      </div>

      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn-ghost cursor-pointer">
            <ImagePlus className="h-4 w-4" /> Pilih foto (maks. {MAKS_FILE})
            <input type="file" accept="image/*" multiple className="sr-only" onChange={pilihFile} />
          </label>
          {antre.length > 0 && (
            <button type="button" className="btn-primary" disabled={!!proses} onClick={unggah}>
              <Upload className="h-4 w-4" /> {proses || `Unggah ${antre.length} foto`}
            </button>
          )}
        </div>
        {antre.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {antre.map((a, i) => (
              <li key={a.preview} className="rounded-xl border border-[var(--border)] p-2">
                <img src={a.preview} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <input className="input mt-2" placeholder="Keterangan (opsional)" value={a.judul}
                  onChange={(e) => setAntre((x) => x.map((y, n) => (n === i ? { ...y, judul: e.target.value } : y)))} />
                <button type="button" className="mt-1 text-xs text-[var(--danger)]" disabled={!!proses} onClick={() => buangAntre(i)}>Batalkan</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Foto di galeri</h3>
        {daftar === null ? <div className="mt-4 skeleton h-40" />
          : gagal ? <p className="mt-4 text-sm text-[var(--danger)]">Gagal memuat galeri. Pastikan Anda sudah masuk dan SQL fitur lanjutan sudah dijalankan.</p>
          : daftar.length === 0 ? <p className="mt-4 text-sm text-[var(--text-muted)]">Belum ada foto.</p>
          : (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {daftar.map((f) => (
              <li key={f.id} className="rounded-xl border border-[var(--border)] p-2">
                <div className="relative">
                  <img src={f.foto_url} alt={f.judul} loading="lazy" className={`aspect-square w-full rounded-lg object-cover ${f.terbit ? "" : "opacity-40"}`} />
                  {!f.terbit && <span className="badge absolute left-2 top-2 bg-amber-500 text-white">Disembunyikan</span>}
                </div>
                <input className="input mt-2" defaultValue={f.judul} placeholder="Keterangan" aria-label="Keterangan foto"
                  onBlur={(e) => simpanJudul(f, e.target.value)} />
                <div className="mt-1 flex justify-between">
                  <button type="button" className="icon-btn" onClick={() => ubahTampil(f)} aria-label={f.terbit ? "Sembunyikan foto" : "Tampilkan foto"}>
                    {f.terbit ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button type="button" className="icon-btn" onClick={() => hapus(f)} aria-label="Hapus foto"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && (
        <div role="status" className={`fixed bottom-6 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"}`}>{toast.message}</div>
      )}
    </div>
  );
}