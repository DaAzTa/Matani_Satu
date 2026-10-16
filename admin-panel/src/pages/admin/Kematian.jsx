// src/pages/admin/Kematian.jsx
// Death records (/admin/kematian). Choose a living resident, enter the date of
// death, save: the resident is marked MENINGGAL (the row is kept) and is no
// longer counted in the active population. Names are visible here only
// (login required); the public page shows counts only.
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, RotateCcw, Search } from "lucide-react";
import StatCard from "../../components/StatCard";

import ExportButtons from "../../components/ExportButtons";
import { unduhKematian } from "../../utils/exportData";

import {
  batalkanKematian, cariWargaHidup, catatKematian, getKematian, usiaSaatMeninggal,
} from "../../services/kematianService";

const hariIni = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const tgl = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

export default function Kematian() {
  const [daftar, setDaftar] = useState(null); // null = loading
  const [gagal, setGagal] = useState(false);
  const [tahun, setTahun] = useState("semua");
  const [filter, setFilter] = useState("");

  const [cari, setCari] = useState("");
  const [hasil, setHasil] = useState([]);
  const [pilih, setPilih] = useState(null);
  const [form, setForm] = useState({ tanggal: "", tempat: "", sebab: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const muat = () =>
    getKematian().then((d) => { setDaftar(d); setGagal(false); }).catch(() => { setGagal(true); setDaftar([]); });
  useEffect(() => { muat(); }, []);

  // search living residents while typing (waits 350 ms after the last key)
  useEffect(() => {
    if (pilih || cari.trim().length < 3) { setHasil([]); return; }
    let batal = false;
    const t = setTimeout(() => {
      cariWargaHidup(cari).then((r) => !batal && setHasil(r)).catch(() => !batal && setHasil([]));
    }, 350);
    return () => { batal = true; clearTimeout(t); };
  }, [cari, pilih]);

  const tahunTersedia = useMemo(
    () => [...new Set((daftar || []).map((x) => x.tanggal_meninggal?.slice(0, 4)).filter(Boolean))].sort().reverse(),
    [daftar]);
  const tampil = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (daftar || []).filter((x) =>
      (tahun === "semua" || x.tanggal_meninggal?.startsWith(tahun)) &&
      (!q || x.nama.toLowerCase().includes(q) || x.nik.includes(q)));
  }, [daftar, tahun, filter]);

  const tahunIni = String(new Date().getFullYear());
  const jumlahTahunIni = (daftar || []).filter((x) => x.tanggal_meninggal?.startsWith(tahunIni)).length;

  const pilihWarga = (w) => {
    setPilih(w);
    setForm({ tanggal: hariIni(), tempat: "", sebab: "" });
    setHasil([]);
  };
  const batalPilih = () => { setPilih(null); setCari(""); };

  const simpan = async () => {
    if (!form.tanggal) { showToast("Tanggal meninggal wajib diisi.", "error"); return; }
    if (!window.confirm(`Catat ${pilih.nama} sebagai meninggal pada ${tgl(form.tanggal)}?\nWarga ini tidak akan dihitung lagi sebagai penduduk aktif.`)) return;
    setSaving(true);
    try {
      await catatKematian(pilih.id, form);
      showToast(`${pilih.nama} dicatat meninggal.`);
      batalPilih();
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const batalkan = async (w) => {
    if (!window.confirm(`Batalkan catatan kematian ${w.nama}?\nWarga akan kembali dihitung sebagai penduduk aktif.`)) return;
    try {
      await batalkanKematian(w.id);
      showToast(`Catatan kematian ${w.nama} dibatalkan.`);
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Data Kematian</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Warga yang meninggal tidak dihapus: datanya tetap tersimpan sebagai catatan, tetapi tidak lagi dihitung
          sebagai penduduk aktif. Nama hanya terlihat di panel ini; halaman publik hanya menampilkan jumlahnya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={ClipboardList} label="Total Tercatat" value={daftar ? daftar.length : undefined} note="jiwa" tone="amber" />
        <StatCard icon={ClipboardList} label={`Tahun ${tahunIni}`} value={daftar ? jumlahTahunIni : undefined} note="jiwa" tone="rose" />
      </div>

      {/* Record a new death */}
      <section className="card p-5">
        <h3 className="font-semibold">Catat kematian baru</h3>
        {!pilih ? (
          <>
            <div className="relative mt-3 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input className="input pl-9" placeholder="Cari nama, NIK, atau No. KK (minimal 3 huruf)…"
                value={cari} onChange={(e) => setCari(e.target.value)} />
            </div>
            {hasil.length > 0 && (
              <ul className="mt-2 max-w-xl divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                {hasil.map((w) => (
                  <li key={w.id}>
                    <button type="button" onClick={() => pilihWarga(w)}
                      className="w-full text-left px-3 py-2.5 hover:bg-[var(--bg-alt)]">
                      <span className="font-medium">{w.nama}</span>
                      <span className="block text-xs text-[var(--text-muted)]">
                        NIK {w.nik} · lahir {tgl(w.tanggal_lahir)} · {(w.lingkungan || "").replace("LINGKUNGAN", "Lingkungan")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {cari.trim().length >= 3 && hasil.length === 0 && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Tidak ada warga aktif yang cocok.</p>
            )}
          </>
        ) : (
          <div className="mt-3 max-w-xl space-y-3">
            <div className="rounded-lg bg-[var(--bg-alt)] px-3 py-2.5">
              <p className="font-medium">{pilih.nama}</p>
              <p className="text-xs text-[var(--text-muted)]">NIK {pilih.nik} · lahir {tgl(pilih.tanggal_lahir)}</p>
            </div>
            <div>
              <label className="label" htmlFor="k-tgl">Tanggal meninggal</label>
              <input id="k-tgl" type="date" className="input" value={form.tanggal}
                min={pilih.tanggal_lahir || undefined} max={hariIni()}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} />
            </div>
            <div>
              <label className="label" htmlFor="k-tempat">Tempat meninggal (opsional)</label>
              <input id="k-tempat" className="input" value={form.tempat}
                onChange={(e) => setForm((f) => ({ ...f, tempat: e.target.value }))} />
            </div>
            <div>
              <label className="label" htmlFor="k-sebab">Sebab / keterangan (opsional)</label>
              <input id="k-sebab" className="input" value={form.sebab}
                onChange={(e) => setForm((f) => ({ ...f, sebab: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={batalPilih} disabled={saving}>Batal</button>
              <button type="button" className="btn-primary" onClick={simpan} disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan catatan kematian"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* List */}
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-semibold">Daftar warga yang meninggal</h3>
          <div className="flex flex-wrap gap-2">
            <select className="input sm:w-36" value={tahun} onChange={(e) => setTahun(e.target.value)} aria-label="Filter tahun">
              <option value="semua">Semua tahun</option>
              {tahunTersedia.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input sm:w-56" placeholder="Cari nama / NIK…" value={filter}
              onChange={(e) => setFilter(e.target.value)} />
              <ExportButtons disabled={!tampil.length}
                onDownload={(format) => unduhKematian(format, tampil, { tahun, cari: filter })} />
          </div>
        </div>

        {daftar === null ? (
          <div className="mt-4 skeleton h-32" />
        ) : gagal ? (
          <p className="mt-4 text-sm text-[var(--danger)]">Gagal memuat data. Pastikan Anda sudah masuk dan SQL kematian sudah dijalankan.</p>
        ) : tampil.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">Belum ada catatan kematian.</p>
        ) : (
            <>
  <ul className="mt-4 divide-y divide-[var(--border)] md:hidden">
    {tampil.map((w) => (
      <li key={w.id} className="flex items-start gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{w.nama}</p>
          <p className="font-mono text-xs text-[var(--text-muted)]">{w.nik}</p>
          <p className="mt-1 text-sm">Meninggal {tgl(w.tanggal_meninggal)} · {usiaSaatMeninggal(w.tanggal_lahir, w.tanggal_meninggal) || "-"}</p>
          <p className="text-xs text-[var(--text-muted)]">{[w.tempat_meninggal, w.sebab_meninggal].filter(Boolean).join(" · ") || "-"}</p>
        </div>
        <button type="button" className="icon-btn" aria-label={`Batalkan catatan kematian ${w.nama}`} onClick={() => batalkan(w)}><RotateCcw className="h-4 w-4" /></button>
      </li>
    ))}
  </ul>
  <div className="mt-4 hidden overflow-x-auto md:block">




            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-2 pr-3 font-semibold">Nama</th>
                  <th className="py-2 pr-3 font-semibold">Tgl. meninggal</th>
                  <th className="py-2 pr-3 font-semibold">Usia</th>
                  <th className="py-2 pr-3 font-semibold">Tempat</th>
                  <th className="py-2 pr-3 font-semibold">Sebab</th>
                  <th className="py-2 pr-3 font-semibold">Dicatat</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tampil.map((w) => (
                  <tr key={w.id} className="align-top">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium">{w.nama}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{w.nik}</p>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{tgl(w.tanggal_meninggal)}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{usiaSaatMeninggal(w.tanggal_lahir, w.tanggal_meninggal) || "-"}</td>
                    <td className="py-2.5 pr-3">{w.tempat_meninggal || "-"}</td>
                    <td className="py-2.5 pr-3">{w.sebab_meninggal || "-"}</td>
                    <td className="py-2.5 pr-3 text-xs text-[var(--text-muted)]">
                      {w.dicatat_oleh || "-"}
                      {w.dicatat_pada && <span className="block">{tgl(w.dicatat_pada.slice(0, 10))}</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      <button type="button" className="icon-btn" title="Batalkan catatan" aria-label={`Batalkan catatan kematian ${w.nama}`}
                        onClick={() => batalkan(w)}>
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            </>
          )}
        </section>

      {toast && (
        <div role="status"
          className={`fixed bottom-6 right-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}