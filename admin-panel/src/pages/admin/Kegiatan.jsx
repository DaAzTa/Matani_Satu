// src/pages/admin/Kegiatan.jsx
// Events calendar (/admin/kegiatan): add, edit, publish and delete events.
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getSemuaKegiatan, hapusKegiatan, simpanKegiatan } from "../../services/komunitasService";

const p2 = (n) => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const tgl = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const BARU = () => ({ id: null, judul: "", deskripsi: "", tanggal: hariIni(), tanggal_selesai: "", waktu: "", lokasi: "", terbit: true });

export default function Kegiatan() {
  const [daftar, setDaftar] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };
  const muat = () => getSemuaKegiatan().then((d) => { setDaftar(d); setGagal(false); }).catch(() => { setGagal(true); setDaftar([]); });
  useEffect(() => { muat(); }, []);
  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const simpan = async () => {
    if (!form.judul.trim()) { showToast("Nama kegiatan wajib diisi.", "error"); return; }
    if (!form.tanggal) { showToast("Tanggal mulai wajib diisi.", "error"); return; }
    if (form.tanggal_selesai && form.tanggal_selesai < form.tanggal) { showToast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error"); return; }
    setSaving(true);
    try {
      await simpanKegiatan(form);
      showToast(form.terbit ? "Kegiatan disimpan dan tampil di kalender publik." : "Kegiatan disimpan sebagai draf.");
      setForm(null); await muat();
    } catch (e) { showToast(e.message, "error"); } finally { setSaving(false); }
  };
  const hapus = async (k) => {
    if (!window.confirm(`Hapus kegiatan "${k.judul}"?`)) return;
    try { await hapusKegiatan(k.id); showToast("Kegiatan dihapus."); await muat(); }
    catch (e) { showToast(e.message, "error"); }
  };

  const nanti = hariIni();
  const akanDatang = (daftar || []).filter((k) => (k.tanggal_selesai || k.tanggal) >= nanti).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const lewat = (daftar || []).filter((k) => (k.tanggal_selesai || k.tanggal) < nanti);

  const Baris = ({ k }) => (
    <li className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{k.judul}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {k.tanggal_selesai && k.tanggal_selesai !== k.tanggal ? `${tgl(k.tanggal)} - ${tgl(k.tanggal_selesai)}` : tgl(k.tanggal)}
          {k.waktu && ` · ${k.waktu}`}{k.lokasi && ` · ${k.lokasi}`} · <span className={k.terbit ? "text-emerald-700" : "text-amber-700"}>{k.terbit ? "Terbit" : "Draf"}</span>
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" className="icon-btn" aria-label={`Ubah ${k.judul}`} onClick={() => setForm({ ...BARU(), ...k, deskripsi: k.deskripsi || "", tanggal_selesai: k.tanggal_selesai || "", waktu: k.waktu || "", lokasi: k.lokasi || "" })}><Pencil className="h-4 w-4" /></button>
        <button type="button" className="icon-btn" aria-label={`Hapus ${k.judul}`} onClick={() => hapus(k)}><Trash2 className="h-4 w-4" /></button>
      </div>
    </li>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Kalender Kegiatan</h2>
          <p className="text-sm text-[var(--text-muted)]">Kegiatan berstatus "Terbit" tampil di kalender halaman publik.</p>
        </div>
        {!form && <button type="button" className="btn-primary" onClick={() => setForm(BARU())}><Plus className="h-4 w-4" /> Tambah kegiatan</button>}
      </div>

      {form && (
        <section className="card p-5 space-y-3">
          <h3 className="font-semibold">{form.id ? "Ubah kegiatan" : "Kegiatan baru"}</h3>
          <div><label className="label" htmlFor="k-judul">Nama kegiatan</label><input id="k-judul" className="input" maxLength={150} value={form.judul} onChange={ubah("judul")} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label" htmlFor="k-mulai">Tanggal mulai</label><input id="k-mulai" type="date" className="input" value={form.tanggal} onChange={ubah("tanggal")} /></div>
            <div><label className="label" htmlFor="k-selesai">Tanggal selesai (jika lebih dari sehari)</label><input id="k-selesai" type="date" className="input" min={form.tanggal} value={form.tanggal_selesai} onChange={ubah("tanggal_selesai")} /></div>
            <div><label className="label" htmlFor="k-waktu">Jam (opsional)</label><input id="k-waktu" className="input" placeholder="mis. 09.00 WITA" value={form.waktu} onChange={ubah("waktu")} /></div>
            <div><label className="label" htmlFor="k-lokasi">Lokasi (opsional)</label><input id="k-lokasi" className="input" value={form.lokasi} onChange={ubah("lokasi")} /></div>
          </div>
          <div><label className="label" htmlFor="k-desk">Keterangan (opsional)</label>
            <textarea id="k-desk" rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" value={form.deskripsi} onChange={ubah("deskripsi")} /></div>
          <div><label className="label" htmlFor="k-status">Status</label>
            <select id="k-status" className="input" value={form.terbit ? "1" : "0"} onChange={(e) => setForm((f) => ({ ...f, terbit: e.target.value === "1" }))}>
              <option value="1">Terbit (tampil untuk warga)</option><option value="0">Draf (belum tampil)</option></select></div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-ghost" disabled={saving} onClick={() => setForm(null)}>Batal</button>
            <button type="button" className="btn-primary" disabled={saving} onClick={simpan}>{saving ? "Menyimpan…" : "Simpan"}</button>
          </div>
        </section>
      )}

      <section className="card p-5">
        <h3 className="font-semibold">Akan datang</h3>
        {daftar === null ? <div className="mt-3 skeleton h-24" />
          : gagal ? <p className="mt-3 text-sm text-[var(--danger)]">Gagal memuat data. Pastikan Anda sudah masuk dan SQL fitur lanjutan sudah dijalankan.</p>
          : akanDatang.length === 0 ? <p className="mt-3 text-sm text-[var(--text-muted)]">Belum ada kegiatan mendatang.</p>
          : <ul className="mt-2 divide-y divide-[var(--border)]">{akanDatang.map((k) => <Baris key={k.id} k={k} />)}</ul>}
      </section>

      {lewat.length > 0 && (
        <section className="card p-5">
          <h3 className="font-semibold">Sudah lewat</h3>
          <ul className="mt-2 divide-y divide-[var(--border)]">{lewat.map((k) => <Baris key={k.id} k={k} />)}</ul>
        </section>
      )}

      {toast && (
        <div role="status" className={`fixed bottom-6 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"}`}>{toast.message}</div>
      )}
    </div>
  );
}