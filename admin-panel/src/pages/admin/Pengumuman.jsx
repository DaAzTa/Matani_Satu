// src/pages/admin/Pengumuman.jsx
// Announcements / village news (/admin/pengumuman): write, edit, publish, delete.
import { useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import {
  getSemuaPengumuman, hapusFotoLama, hapusPengumuman, simpanPengumuman, unggahFoto,
} from "../../services/pengumumanService";

const p2 = (n) => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const tgl = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const BARU = () => ({ id: null, judul: "", isi: "", tanggal: hariIni(), terbit: true, fotoUrl: "", fotoFile: null, hapusFoto: false });

export default function Pengumuman() {
  const [daftar, setDaftar] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [form, setForm] = useState(null); // null = form closed
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const muat = () =>
    getSemuaPengumuman().then((d) => { setDaftar(d); setGagal(false); }).catch(() => { setGagal(true); setDaftar([]); });
  useEffect(() => { muat(); }, []);

  // preview of a newly chosen photo
  useEffect(() => {
    if (!form?.fotoFile) { setPreview(""); return; }
    const url = URL.createObjectURL(form.fotoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form?.fotoFile]);

  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const edit = (p) => setForm({ id: p.id, judul: p.judul, isi: p.isi, tanggal: p.tanggal, terbit: p.terbit, fotoUrl: p.foto_url || "", fotoFile: null, hapusFoto: false });

  const simpan = async () => {
    if (!form.judul.trim()) { showToast("Judul wajib diisi.", "error"); return; }
    if (!form.isi.trim()) { showToast("Isi pengumuman wajib diisi.", "error"); return; }
    setSaving(true);
    try {
      let fotoUrl = form.hapusFoto ? "" : form.fotoUrl;
      if (form.fotoFile) fotoUrl = await unggahFoto(form.fotoFile);
      await simpanPengumuman({ id: form.id, judul: form.judul, isi: form.isi, tanggal: form.tanggal, terbit: form.terbit, foto_url: fotoUrl });
      if ((form.fotoFile || form.hapusFoto) && form.fotoUrl) hapusFotoLama(form.fotoUrl);
      showToast(form.terbit ? "Pengumuman disimpan dan tampil di halaman publik." : "Pengumuman disimpan sebagai draf.");
      setForm(null);
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const hapus = async (p) => {
    if (!window.confirm(`Hapus pengumuman "${p.judul}"?`)) return;
    try {
      await hapusPengumuman(p);
      showToast("Pengumuman dihapus.");
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const gambar = preview || (form && !form.hapusFoto ? form.fotoUrl : "");

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Pengumuman dan Berita</h2>
          <p className="text-sm text-[var(--text-muted)]">Pengumuman berstatus "Terbit" tampil di halaman depan untuk warga.</p>
        </div>
        {!form && <button type="button" className="btn-primary" onClick={() => setForm(BARU())}><Plus className="h-4 w-4" /> Tulis pengumuman</button>}
      </div>

      {form && (
        <section className="card p-5 space-y-3">
          <h3 className="font-semibold">{form.id ? "Ubah pengumuman" : "Pengumuman baru"}</h3>
          <div><label className="label" htmlFor="p-judul">Judul</label>
            <input id="p-judul" className="input" maxLength={150} value={form.judul} onChange={ubah("judul")} /></div>
          <div><label className="label" htmlFor="p-isi">Isi</label>
            <textarea id="p-isi" rows={6} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              value={form.isi} onChange={ubah("isi")} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label" htmlFor="p-tgl">Tanggal</label>
              <input id="p-tgl" type="date" className="input" value={form.tanggal} onChange={ubah("tanggal")} /></div>
            <div><label className="label" htmlFor="p-status">Status</label>
              <select id="p-status" className="input" value={form.terbit ? "1" : "0"}
                onChange={(e) => setForm((f) => ({ ...f, terbit: e.target.value === "1" }))}>
                <option value="1">Terbit (tampil untuk warga)</option>
                <option value="0">Draf (belum tampil)</option>
              </select></div>
          </div>
          <div>
            <p className="label">Foto (opsional)</p>
            {gambar && <img src={gambar} alt="" className="mb-2 max-h-48 rounded-lg border border-[var(--border)]" />}
            <div className="flex flex-wrap items-center gap-2">
              <label className="btn-ghost cursor-pointer">
                <ImagePlus className="h-4 w-4" /> {gambar ? "Ganti foto" : "Pilih foto"}
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm((f) => ({ ...f, fotoFile: file, hapusFoto: false })); e.target.value = ""; }} />
              </label>
              {gambar && (
                <button type="button" className="btn-ghost" onClick={() => setForm((f) => ({ ...f, fotoFile: null, hapusFoto: true }))}>
                  <Trash2 className="h-4 w-4" /> Hapus foto
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Foto diperkecil otomatis agar halaman tetap ringan.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-ghost" disabled={saving} onClick={() => setForm(null)}>Batal</button>
            <button type="button" className="btn-primary" disabled={saving} onClick={simpan}>{saving ? "Menyimpan…" : "Simpan"}</button>
          </div>
        </section>
      )}

      <section className="card p-5">
        <h3 className="font-semibold">Daftar pengumuman</h3>
        {daftar === null ? <div className="mt-4 skeleton h-32" />
          : gagal ? <p className="mt-4 text-sm text-[var(--danger)]">Gagal memuat data. Pastikan Anda sudah masuk dan SQL fitur tambahan sudah dijalankan.</p>
          : daftar.length === 0 ? <p className="mt-4 text-sm text-[var(--text-muted)]">Belum ada pengumuman.</p>
          : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {daftar.map((p) => (
              <li key={p.id} className="py-3 flex gap-3">
                {p.foto_url
                  ? <img src={p.foto_url} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                  : <div className="h-16 w-24 shrink-0 rounded-lg bg-[var(--bg-alt)]" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.judul}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {tgl(p.tanggal)} · <span className={p.terbit ? "text-emerald-700" : "text-amber-700"}>{p.terbit ? "Terbit" : "Draf"}</span>
                    {p.dibuat_oleh && ` · ${p.dibuat_oleh}`}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">{p.isi}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" className="icon-btn" aria-label={`Ubah ${p.judul}`} onClick={() => edit(p)}><Pencil className="h-4 w-4" /></button>
                  <button type="button" className="icon-btn" aria-label={`Hapus ${p.judul}`} onClick={() => hapus(p)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && (
        <div role="status" className={`fixed bottom-6 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}