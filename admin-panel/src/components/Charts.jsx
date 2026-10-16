// src/components/Charts.jsx
// Simple charts without extra libraries (plain HTML/CSS, they shrink to phone width).
import { useEffect, useState } from "react";
import { getTren } from "../services/trenService";

const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const angka = (n) => Number(n || 0).toLocaleString("id-ID");

function Legenda({ item }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
      {item.map(([warna, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${warna}`} /> {label}
        </span>
      ))}
    </div>
  );
}

/** data = [{ bulan: "2026-03", lahir: 2, meninggal: 1 }, ...] */
export function GrafikBulanan({ data }) {
  const maks = Math.max(1, ...data.flatMap((d) => [d.lahir, d.meninggal]));
  const Batang = ({ n, warna, nama }) => (
    <div className={`relative w-full max-w-[14px] rounded-t ${warna}`} title={`${nama}: ${n}`}
      style={{ height: `${(n / maks) * 100}%`, minHeight: n > 0 ? 3 : 0 }}>
      {n > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] leading-none tabular-nums">{n}</span>}
    </div>
  );
  return (
    <div>
      <div className="flex items-end gap-1 sm:gap-2 h-44 pt-5" role="img" aria-label="Grafik kelahiran dan kematian per bulan">
        {data.map((d) => (
          <div key={d.bulan} className="flex-1 min-w-0 h-full flex items-end justify-center gap-0.5">
            <Batang n={d.lahir} warna="bg-emerald-500" nama="Lahir" />
            <Batang n={d.meninggal} warna="bg-amber-500" nama="Meninggal" />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 sm:gap-2 border-t border-[var(--border)] pt-1">
        {data.map((d) => {
          const [y, m] = d.bulan.split("-").map(Number);
          return (
            <div key={d.bulan} className="flex-1 min-w-0 text-center text-[10px] sm:text-xs text-[var(--text-muted)] leading-tight">
              {NAMA_BULAN[m - 1]}
              {m === 1 || d === data[0] ? <span className="block opacity-70">{y}</span> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-3"><Legenda item={[["bg-emerald-500", "Kelahiran"], ["bg-amber-500", "Kematian"]]} /></div>
    </div>
  );
}

/** data = [{ kelompok: "0-4", laki: 10, perempuan: 12 }, ...] (youngest first) */
export function Piramida({ data }) {
  const maks = Math.max(1, ...data.flatMap((d) => [d.laki, d.perempuan]));
  const Sisi = ({ n, kiri }) => (
    <div className={`flex items-center gap-1.5 ${kiri ? "" : "flex-row-reverse"}`}>
      <div className={`flex-1 flex ${kiri ? "justify-end" : "justify-start"}`}>
        <div className={`h-4 ${kiri ? "rounded-l bg-sky-500" : "rounded-r bg-rose-500"}`}
          style={{ width: `${(n / maks) * 100}%`, minWidth: n > 0 ? 2 : 0 }} />
      </div>
      <span className={`w-8 shrink-0 text-[11px] tabular-nums ${kiri ? "text-right" : "text-left"}`}>{n > 0 ? angka(n) : ""}</span>
    </div>
  );
  return (
    <div role="img" aria-label="Piramida penduduk menurut umur dan jenis kelamin">
      <div className="space-y-1">
        {[...data].reverse().map((r) => (
          <div key={r.kelompok} className="grid grid-cols-[1fr_46px_1fr] sm:grid-cols-[1fr_56px_1fr] items-center gap-1.5">
            <Sisi n={r.laki} kiri />
            <span className="text-center text-[11px] text-[var(--text-muted)]">{r.kelompok}</span>
            <Sisi n={r.perempuan} />
          </div>
        ))}
      </div>
      <div className="mt-3"><Legenda item={[["bg-sky-500", "Laki-laki (kiri)"], ["bg-rose-500", "Perempuan (kanan)"]]} /></div>
    </div>
  );
}

/** Dashboard block: loads the data itself and follows the neighborhood filter. */
export default function TrenPanel({ lingkungan = "" }) {
  const [tren, setTren] = useState(undefined); // undefined = loading, null = failed

  useEffect(() => {
    let batal = false;
    setTren(undefined);
    getTren(lingkungan).then((d) => !batal && setTren(d)).catch(() => !batal && setTren(null));
    return () => { batal = true; };
  }, [lingkungan]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section className="card p-5 sm:p-6">
        <h3 className="font-semibold">Kelahiran dan Kematian per Bulan</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">12 bulan terakhir, dari data yang dicatat di panel ini.</p>
        {tren === undefined ? <div className="skeleton h-52" />
          : tren === null ? <p className="text-sm text-[var(--danger)]">Gagal memuat grafik. Pastikan SQL fitur lanjutan sudah dijalankan.</p>
          : <GrafikBulanan data={tren.bulanan} />}
      </section>
      <section className="card p-5 sm:p-6">
        <h3 className="font-semibold">Piramida Penduduk</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Penduduk aktif menurut kelompok umur dan jenis kelamin.</p>
        {tren === undefined ? <div className="skeleton h-52" />
          : tren === null ? <p className="text-sm text-[var(--danger)]">Gagal memuat grafik.</p>
          : <Piramida data={tren.piramida} />}
      </section>
    </div>
  );
}