// src/components/KalenderKegiatan.jsx
// Public events calendar: a month grid (tap a day) and the list of events.
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getKegiatanPublik } from "../services/komunitasService";

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const p2 = (n) => String(n).padStart(2, "0");
const kunci = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const tgl = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** { "2026-10-12": [event, ...] } : multi-day events appear on every day */
export function petaPerHari(events) {
  const m = {};
  for (const e of events) {
    const a = new Date(`${e.tanggal}T00:00:00`);
    const b = new Date(`${e.tanggal_selesai || e.tanggal}T00:00:00`);
    let hitung = 0;
    for (const d = new Date(a); d <= b && hitung < 62; d.setDate(d.getDate() + 1), hitung++) {
      (m[kunci(d)] ||= []).push(e);
    }
  }
  return m;
}

export default function KalenderKegiatan() {
  const [events, setEvents] = useState(undefined);
  const [bulan, setBulan] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [pilih, setPilih] = useState(null);

  useEffect(() => {
    let batal = false;
    getKegiatanPublik().then((d) => !batal && setEvents(d)).catch(() => !batal && setEvents([]));
    return () => { batal = true; };
  }, []);

  const perHari = useMemo(() => petaPerHari(events || []), [events]);
  if (events !== undefined && events.length === 0) return null; // nothing planned: no empty box

  const awal = (bulan.getDay() + 6) % 7; // Monday first
  const jumlahHari = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate();
  const sel = [...Array(awal).fill(null), ...Array.from({ length: jumlahHari }, (_, i) => i + 1)];
  const hariIni = kunci(new Date());
  const namaBulan = bulan.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const awalBln = kunci(bulan);
  const akhirBln = kunci(new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0));
  const daftar = pilih
    ? perHari[pilih] || []
    : (events || []).filter((e) => e.tanggal <= akhirBln && (e.tanggal_selesai || e.tanggal) >= awalBln);

  return (
    <section id="kegiatan" className="card p-5 sm:p-6">
      <h2 className="font-semibold">Kalender Kegiatan</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">Jadwal kegiatan dan acara di Kelurahan Matani Satu.</p>
      {events === undefined ? <div className="skeleton h-72" /> : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <button type="button" className="icon-btn" aria-label="Bulan sebelumnya"
                onClick={() => { setPilih(null); setBulan(new Date(bulan.getFullYear(), bulan.getMonth() - 1, 1)); }}><ChevronLeft className="h-4 w-4" /></button>
              <p className="font-medium capitalize">{namaBulan}</p>
              <button type="button" className="icon-btn" aria-label="Bulan berikutnya"
                onClick={() => { setPilih(null); setBulan(new Date(bulan.getFullYear(), bulan.getMonth() + 1, 1)); }}><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-muted)]">
              {HARI.map((h) => <span key={h} className="py-1">{h}</span>)}
              {sel.map((d, i) => {
                if (!d) return <span key={`k${i}`} />;
                const k = `${bulan.getFullYear()}-${p2(bulan.getMonth() + 1)}-${p2(d)}`;
                const ada = (perHari[k] || []).length > 0;
                return (
                  <button key={k} type="button" disabled={!ada} onClick={() => setPilih(pilih === k ? null : k)}
                    className={`relative aspect-square rounded-lg text-sm ${pilih === k ? "bg-[var(--primary)] text-white" : ada ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary)]" : "text-[var(--text)]"} ${k === hariIni && pilih !== k ? "ring-1 ring-[var(--primary)]" : ""} disabled:cursor-default`}>
                    {d}
                    {ada && pilih !== k && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--primary)]" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">{pilih ? `Kegiatan ${tgl(pilih)}` : `Kegiatan bulan ${namaBulan}`}</p>
            {daftar.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Tidak ada kegiatan.</p> : (
              <ul className="space-y-3">
                {daftar.map((e) => (
                  <li key={e.id} className="flex gap-3 rounded-xl border border-[var(--border)] p-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-center leading-tight text-[var(--primary)]">
                      <span><b className="block text-lg">{Number(e.tanggal.slice(8, 10))}</b>
                        <span className="text-[10px] uppercase">{new Date(`${e.tanggal}T00:00:00`).toLocaleDateString("id-ID", { month: "short" })}</span></span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{e.judul}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {e.tanggal_selesai && e.tanggal_selesai !== e.tanggal ? `${tgl(e.tanggal)} - ${tgl(e.tanggal_selesai)}` : tgl(e.tanggal)}
                        {e.waktu && ` · ${e.waktu}`}{e.lokasi && ` · ${e.lokasi}`}
                      </p>
                      {e.deskripsi && <p className="mt-1 text-sm text-[var(--text-muted)] whitespace-pre-line">{e.deskripsi}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}