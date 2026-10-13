// src/pages/ProfilKelurahan.jsx
// HALAMAN PERTAMA (publik, tanpa login): profil kelurahan + statistik agregat.
// Data pribadi (NIK, nama) TIDAK pernah dibaca di sini — hanya dokumen
// statistik/ringkasan yang berisi angka hasil hitungan admin.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Home, LayoutDashboard, LogIn, MapPin, Ruler, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRingkasanPublik } from "../services/statistikService";
import BarList from "../components/BarList";
import StatCard from "../components/StatCard";
import ProfilLengkap from "../components/ProfilLengkap";
import Logo from "../components/Logo";
import PengumumanPublik from "../components/PengumumanPublik";
import { PROFIL } from "../data/profil";
import { LINGKUNGAN, formatAngka } from "../utils/penduduk";
import PetaWilayah from "../components/PetaWilayah";

export default function ProfilKelurahan() {
  const { user, isAdmin } = useAuth();
  const [stat, setStat] = useState(undefined); // undefined = memuat, null = belum ada

  useEffect(() => {
    getRingkasanPublik()
      .then(setStat)
      .catch(() => setStat(null));
  }, []);

  const s = stat ?? (stat === null ? PROFIL.fallbackStat : undefined);
  const diperbarui = stat?.diperbarui ? new Date(stat.diperbarui).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : undefined;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--primary-deep)] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div className="leading-tight">
                <p className="text-[10px] tracking-widest text-white/60">KELURAHAN</p>
                <p className="font-display font-semibold text-lg">Matani Satu</p>
              </div>
            </div>
          {user && isAdmin ? (
            <Link to="/admin" className="btn h-9 bg-white text-[var(--primary-deep)] hover:bg-white/90">
              <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
            </Link>
          ) : (
            <Link to="/login" className="btn h-9 border border-white/30 text-white hover:bg-white/10">
              <LogIn className="h-4 w-4" /> Masuk Admin
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--primary-deep)] to-[var(--primary-dark)] text-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-24">
            <Logo size={128} className="hidden lg:grid absolute right-6 top-12 shadow-lg" />
            <p className="text-xs tracking-[0.2em] uppercase text-white/70">Profil Wilayah</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold mt-3">{PROFIL.nama}</h1>
          <p className="mt-3 flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="h-4 w-4" /> Kec. {PROFIL.kecamatan}, {PROFIL.kota}, {PROFIL.provinsi} {PROFIL.kodePos}
          </p>
          <p className="mt-5 max-w-2xl text-white/75 leading-relaxed">{PROFIL.deskripsi}</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 -mt-14 pb-16 space-y-6">
        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Jumlah Penduduk" value={s?.total} note="jiwa" />
          <StatCard icon={Home} label="Kepala Keluarga" value={s?.kepalaKeluarga} note="KK" tone="green" />
          <StatCard icon={Ruler} label="Luas Wilayah" value={undefined === s ? undefined : 513.13} note="hektare" tone="amber" />
          <StatCard icon={Compass} label="Lingkungan" value={undefined === s ? undefined : LINGKUNGAN.length} note="wilayah lingkungan" tone="rose" />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {stat ? `Statistik kependudukan diperbarui ${diperbarui ?? "—"} oleh perangkat kelurahan.`
            : stat === null ? `Sumber: ${PROFIL.fallbackStat.sumber}.` : "Memuat statistik…"}
        </p>

              {stat?.meninggalTahunIni !== undefined && (
                <p className="text-xs text-[var(--text-muted)] -mt-3">
                  Tahun {stat.tahun}: <b>{formatAngka(stat.kelahiranTahunIni ?? 0)}</b> kelahiran dan <b>{formatAngka(stat.meninggalTahunIni)}</b> kematian tercatat.
                </p>
              )}

              {/* Pengumuman dan berita (published items only) */}
              <PengumumanPublik />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="card p-6 lg:col-span-2">
            <h2 className="font-semibold">Komposisi Penduduk</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-3">Menurut jenis kelamin</p>
                <GenderBar l={s?.lakiLaki} p={s?.perempuan} />
                {stat?.usia && (
                  <>
                    <p className="text-sm text-[var(--text-muted)] mt-6 mb-3">Menurut kelompok usia</p>
                    <BarList items={[
                      { label: "0–14 tahun", value: stat.usia.anak },
                      { label: "15–64 tahun", value: stat.usia.produktif },
                      { label: "65+ tahun", value: stat.usia.lansia },
                    ]} />
                  </>
                )}
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-3">Menurut lingkungan</p>
                {stat?.perLingkungan ? (
                  <BarList items={LINGKUNGAN.map((l) => ({ label: l.replace("LINGKUNGAN", "Lingkungan"), value: stat.perLingkungan[l] }))} />
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Rincian per lingkungan akan tampil setelah admin mempublikasikan statistik.</p>
                )}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">Batas Wilayah</h2>
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {PROFIL.batas.map((b) => (
                <li key={b.arah} className="py-3 flex justify-between gap-4 text-sm">
                  <span className="text-[var(--text-muted)]">{b.arah}</span>
                  <span className="font-medium text-right">{b.wilayah}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
          {/* Profil kelurahan (from the Supabase table profil_kelurahan) */}
          <ProfilLengkap />
          <PetaWilayah />
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} {PROFIL.nama} · Kec. {PROFIL.kecamatan}, {PROFIL.kota}
      </footer>
    </div>
  );
}

function GenderBar({ l, p }) {
  if (l === undefined) return <div className="skeleton h-14" />;
  const total = l + p || 1;
  const pl = Math.round((l / total) * 100);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-[var(--primary)]" style={{ width: `${pl}%` }} />
        <div className="bg-rose-400" style={{ width: `${100 - pl}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--primary)] mr-1.5" />Laki-laki <b className="tabular-nums">{formatAngka(l)}</b></span>
        <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400 mr-1.5" />Perempuan <b className="tabular-nums">{formatAngka(p)}</b></span>
      </div>
    </div>
  );
}
