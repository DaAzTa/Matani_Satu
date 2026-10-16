// src/pages/admin/Dashboard.jsx — ringkasan data kependudukan (khusus admin).
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Baby, Globe, Home, RefreshCw, UserRound, Users, ClipboardList } from "lucide-react";
import StatCard from "../../components/StatCard";
import BarList from "../../components/BarList";
import { hitungRingkasan, publikasikanRingkasan } from "../../services/statistikService";
import { LINGKUNGAN, formatAngka } from "../../utils/penduduk";
import TrenPanel from "../../components/Charts";

export default function Dashboard() {
  const [stat, setStat] = useState(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [info, setInfo] = useState("");

  const [lingkungan, setLingkungan] = useState("");

  const muat = useCallback(async () => {
    setError("");
    try {
      setStat(await hitungRingkasan(lingkungan));
    } catch (e) {
      console.error(e);
      setError("Gagal memuat statistik. Periksa koneksi dan pengaturan Supabase.");
    }
  }, [lingkungan]);

  useEffect(() => {
    muat();
  }, [muat]);

  const publikasikan = async () => {
    setPublishing(true);
    setInfo("");
    try {
      await publikasikanRingkasan();
      setInfo("Statistik di halaman profil publik sudah diperbarui.");
    } catch (e) {
      setError("Gagal memperbarui statistik publik.");
    } finally {
      setPublishing(false);
    }
  };

  const pctL = stat?.total ? Math.round((stat.lakiLaki / stat.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Ringkasan Kependudukan</h2>
          <p className="text-sm text-[var(--text-muted)]">Dihitung langsung dari tabel <code>penduduk</code> di Supabase.</p>
        </div>


        <div className="flex flex-wrap gap-2">
          <select className="input w-auto" value={lingkungan} aria-label="Filter lingkungan"
            onChange={(e) => { setStat(null); setLingkungan(e.target.value); }}>
            <option value="">Semua lingkungan</option>
            {LINGKUNGAN.map((l) => <option key={l} value={l}>{l.replace("LINGKUNGAN", "Lingkungan")}</option>)}
          </select>
          <button className="btn-ghost" onClick={() => { setStat(null); muat(); }}>


            <RefreshCw className="h-4 w-4" /> Muat ulang
          </button>
          <button className="btn-primary" onClick={publikasikan} disabled={publishing || !stat}>
            <Globe className="h-4 w-4" /> {publishing ? "Memperbarui…" : "Perbarui statistik publik"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 text-[var(--danger)] text-sm px-4 py-3">{error}</div>}
      {info && <div className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3">{info}</div>}

      {stat?.perluVerifikasi > 0 && (
        <Link to="/admin/penduduk?filter=verifikasi"
          className="flex items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm hover:bg-amber-500/15">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <b>{stat.perluVerifikasi} data</b> hasil impor Excel tidak lengkap/tidak konsisten dan perlu diperiksa. Klik untuk melihat.
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Penduduk" value={stat?.total} note="jiwa" />
        <StatCard icon={Home} label="Kepala Keluarga" value={stat?.kepalaKeluarga} note="KK" tone="green" />
        <StatCard icon={UserRound} label="Laki-laki" value={stat?.lakiLaki} note={stat ? `${pctL}% dari total` : ""} tone="primary" />
        <StatCard icon={UserRound} label="Perempuan" value={stat?.perempuan} note={stat ? `${100 - pctL}% dari total` : ""} tone="rose" />
        <StatCard icon={Baby} label="Kelahiran Tahun Ini" value={stat?.kelahiranTahunIni} note={stat ? `tahun ${stat.tahun}` : ""} tone="green" />
        <StatCard icon={ClipboardList} label="Meninggal Tahun Ini" value={stat?.meninggalTahunIni} note={stat ? `tahun ${stat.tahun}` : ""} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <section className="card p-6 lg:col-span-3">
          <h3 className="font-semibold">Penduduk per Lingkungan</h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">Berdasarkan field “lingkungan”.</p>
          {stat ? (
            <BarList items={LINGKUNGAN.map((l) => ({ label: l.replace("LINGKUNGAN", "Lingkungan"), value: stat.perLingkungan[l] }))} />
          ) : (
            <div className="space-y-4">{LINGKUNGAN.map((l) => <div key={l} className="skeleton h-7" />)}</div>
          )}
        </section>

        <section className="card p-6 lg:col-span-2">
          <h3 className="font-semibold">Kelompok Usia</h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">Dihitung dari tanggal lahir per hari ini.</p>
          {stat ? (
            <div className="space-y-4">
              {[
                { label: "Anak (0–14 th)", value: stat.usia.anak, icon: Baby },
                { label: "Usia produktif (15–64 th)", value: stat.usia.produktif, icon: Users },
                { label: "Lansia (65+ th)", value: stat.usia.lansia, icon: UserRound },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-lg grid place-items-center bg-[var(--bg-alt)] text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm text-[var(--text-muted)]">{label}</span>
                  <span className="font-bold tabular-nums">{formatAngka(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-10" />)}</div>
          )}
          <Link to="/admin/penduduk" className="btn-ghost w-full mt-6">Kelola data penduduk</Link>
        </section>
      </div>

      {/* Trend charts and population pyramid (follow the neighborhood filter) */}
      <TrenPanel lingkungan={lingkungan} />
    </div>
  );
}
