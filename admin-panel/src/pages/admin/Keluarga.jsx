// src/pages/admin/Keluarga.jsx
// Per-household view (/admin/keluarga): residents grouped by No. KK, with
// warnings for households that have no head of household, or more than one.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, Home, Search, Users } from "lucide-react";
import StatCard from "../../components/StatCard";
import ExportButtons from "../../components/ExportButtons";
import { LINGKUNGAN } from "../../utils/penduduk";
import { MASALAH, TANPA_KK, kelompokkanKeluarga, ringkasKeluarga } from "../../utils/keluarga";
import { unduhKeluarga } from "../../utils/exportData";
import { getAllPenduduk } from "../../services/pendudukService";

const BATCH = 30;
const umur = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const n = new Date();
  let u = n.getFullYear() - y;
  if (n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d)) u--;
  return `${u} th`;
};
const lingk = (l) => (l || "-").replace("LINGKUNGAN", "Lingkungan");

function Kartu({ k }) {
  const [buka, setBuka] = useState(false);
  const kepala = k.kepala[0];
  return (
    <li className={`card overflow-hidden ${k.masalah.length ? "border-amber-400/60" : ""}`}>
      <button type="button" className="flex w-full items-start gap-3 p-4 text-left" onClick={() => setBuka((b) => !b)} aria-expanded={buka}>
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--bg-alt)] text-[var(--primary)]"><Home className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{kepala ? kepala.nama : "(tanpa kepala keluarga)"}</span>
          <span className="block text-xs text-[var(--text-muted)] font-mono break-all">{k.noKk === TANPA_KK ? "Tanpa nomor KK" : `KK ${k.noKk}`}</span>
          <span className="mt-1 flex flex-wrap gap-1.5">
            <span className="badge bg-[var(--bg-alt)]">{k.jumlah} anggota</span>
            <span className="badge bg-[var(--bg-alt)]">{lingk(k.lingkungan)}</span>
            {k.masalah.map((m) => (
              <span key={m} className="badge bg-amber-500/15 text-amber-700"><AlertTriangle className="mr-1 inline h-3 w-3" />{MASALAH[m]}</span>
            ))}
          </span>
        </span>
        <ChevronDown className={`mt-2 h-4 w-4 shrink-0 transition-transform ${buka ? "rotate-180" : ""}`} />
      </button>
      {buka && (
        <div className="border-t border-[var(--border)] px-4 py-3">
          {k.alamat && <p className="mb-2 text-xs text-[var(--text-muted)]">{k.alamat}</p>}
          <ul className="divide-y divide-[var(--border)]">
            {k.anggota.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.nama}</p>
                  <p className="text-xs text-[var(--text-muted)]">{a.hubungan || "-"} · {a.jenisKelamin === "L" ? "Laki-laki" : a.jenisKelamin === "P" ? "Perempuan" : "-"} · {umur(a.tanggalLahir)}</p>
                </div>
                <Link to={`/admin/penduduk?q=${a.nik}`} className="shrink-0 text-xs font-semibold text-[var(--primary)]">Buka</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function Keluarga() {
  const [keluarga, setKeluarga] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [cari, setCari] = useState("");
  const [fLingk, setFLingk] = useState("");
  const [fMasalah, setFMasalah] = useState("");
  const [banyak, setBanyak] = useState(BATCH);

  useEffect(() => {
    getAllPenduduk().then((d) => setKeluarga(kelompokkanKeluarga(d))).catch(() => { setGagal(true); setKeluarga([]); });
  }, []);

  const ringkas = useMemo(() => ringkasKeluarga(keluarga || []), [keluarga]);
  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return (keluarga || []).filter((k) =>
      (!fLingk || k.lingkungan === fLingk) &&
      (!fMasalah || (fMasalah === "semua" ? k.masalah.length > 0 : k.masalah.includes(fMasalah))) &&
      (!q || k.noKk.includes(q) || k.anggota.some((a) => (a.nama || "").toLowerCase().includes(q) || (a.nik || "").includes(q))));
  }, [keluarga, cari, fLingk, fMasalah]);
  useEffect(() => { setBanyak(BATCH); }, [cari, fLingk, fMasalah]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Data Keluarga</h2>
        <p className="text-sm text-[var(--text-muted)]">Penduduk aktif dikelompokkan menurut nomor Kartu Keluarga (KK). Keluarga tanpa atau dengan lebih dari satu kepala keluarga ditandai.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Home} label="Keluarga" value={keluarga ? ringkas.keluarga : undefined} note="nomor KK" tone="primary" />
        <StatCard icon={Users} label="Anggota" value={keluarga ? ringkas.anggota : undefined} note="jiwa" tone="green" />
        <StatCard icon={AlertTriangle} label="Tanpa Kepala" value={keluarga ? ringkas.tanpaKepala : undefined} note="keluarga" tone="amber" />
        <StatCard icon={AlertTriangle} label="Kepala Ganda" value={keluarga ? ringkas.kepalaGanda : undefined} note="keluarga" tone="rose" />
      </div>

      <div className="card p-3 flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input className="input pl-9" placeholder="Cari nomor KK, nama, atau NIK…" value={cari} onChange={(e) => setCari(e.target.value)} />
        </div>
        <select className="input lg:w-44" value={fLingk} onChange={(e) => setFLingk(e.target.value)} aria-label="Filter lingkungan">
          <option value="">Semua lingkungan</option>
          {LINGKUNGAN.map((l) => <option key={l} value={l}>{lingk(l)}</option>)}
        </select>
        <select className="input lg:w-56" value={fMasalah} onChange={(e) => setFMasalah(e.target.value)} aria-label="Filter masalah">
          <option value="">Semua keluarga</option>
          <option value="semua">Hanya yang bermasalah</option>
          <option value="tanpa_kepala">Tanpa kepala keluarga</option>
          <option value="kepala_ganda">Kepala keluarga ganda</option>
          <option value="lingkungan_campur">Lingkungan campur</option>
          <option value="tanpa_kk">Tanpa nomor KK</option>
        </select>
        <ExportButtons disabled={!tampil.length} onDownload={(f) => unduhKeluarga(f, tampil, { lingkungan: fLingk, masalah: fMasalah, cari })} />
      </div>

      {keluarga === null ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : gagal ? (
        <p className="text-sm text-[var(--danger)]">Gagal memuat data. Pastikan Anda sudah masuk dan koneksi stabil.</p>
      ) : tampil.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Tidak ada keluarga yang cocok.</p>
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)]">{tampil.length} keluarga</p>
          <ul className="space-y-3">{tampil.slice(0, banyak).map((k) => <Kartu key={k.noKk} k={k} />)}</ul>
          {tampil.length > banyak && (
            <button type="button" className="btn-ghost w-full" onClick={() => setBanyak((b) => b + BATCH)}>Tampilkan lebih banyak ({tampil.length - banyak} lagi)</button>
          )}
        </>
      )}
    </div>
  );
}