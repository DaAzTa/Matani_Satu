// src/pages/admin/KualitasData.jsx
// Data quality checker (/admin/kualitas-data). Finds likely duplicates, odd ages
// and NIK problems, then writes them into the existing "Cek" flag.
import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Search } from "lucide-react";
import { KATEGORI, periksaKualitas, siapkanTanda } from "../../utils/kualitasData";
import { getAllPenduduk } from "../../services/pendudukService";
import { terapkanPemeriksaan } from "../../services/kualitasService";

export default function KualitasData() {
  const [hasil, setHasil] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [simpan, setSimpan] = useState(false);
  const [pilihan, setPilihan] = useState(Object.keys(KATEGORI).filter((k) => KATEGORI[k].bawaan));
  const [buka, setBuka] = useState(null);
  const [pesan, setPesan] = useState(null);

  const periksa = async () => {
    setSibuk(true); setPesan(null);
    try {
      setHasil(periksaKualitas(await getAllPenduduk()));
    } catch {
      setPesan({ tipe: "error", teks: "Gagal memuat data penduduk. Periksa koneksi lalu coba lagi." });
    } finally {
      setSibuk(false);
    }
  };

  const tandai = async () => {
    const items = siapkanTanda(hasil.isu, pilihan);
    if (!window.confirm(`Tandai ${items.length} data dengan "Cek"?\nTanda "Cek" lama dari pemeriksa dibersihkan lebih dulu. Tanda dari impor Excel tidak diubah.`)) return;
    setSimpan(true); setPesan(null);
    try {
      const r = await terapkanPemeriksaan(items);
      setPesan({ tipe: "ok", teks: `Selesai: ${r.ditandai} data ditandai "Cek", ${r.dibersihkan} tanda lama dibersihkan.` });
    } catch (e) {
      setPesan({ tipe: "error", teks: e.message });
    } finally {
      setSimpan(false);
    }
  };

  const jumlahTanda = hasil ? siapkanTanda(hasil.isu, pilihan).length : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Pemeriksa Kualitas Data</h2>
        <p className="text-sm text-[var(--text-muted)]">Mencari data yang mencurigakan: kemungkinan data ganda, umur tidak masuk akal, dan NIK yang tidak cocok. Hasilnya bisa ditandai dengan "Cek" di Data Penduduk.</p>
      </div>

      <div className="card p-5">
        <button type="button" className="btn-primary" disabled={sibuk} onClick={periksa}>
          <Search className="h-4 w-4" /> {sibuk ? "Memeriksa…" : hasil ? "Periksa ulang" : "Periksa sekarang"}
        </button>
        {hasil && <p className="mt-3 text-sm text-[var(--text-muted)]">{hasil.jumlahDiperiksa} penduduk aktif diperiksa. Kode wilayah NIK terbanyak: <b>{hasil.wilayahUtama || "-"}</b>.</p>}
      </div>

      {pesan && (
        <p role="status" className={`rounded-lg px-4 py-3 text-sm ${pesan.tipe === "ok" ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}>
          {pesan.tipe === "ok" && <CheckCircle2 className="mr-1.5 inline h-4 w-4" />}{pesan.teks}
        </p>
      )}

      {hasil && (
        <>
          <section className="card divide-y divide-[var(--border)]">
            {Object.entries(KATEGORI).map(([k, v]) => {
              const daftar = hasil.isu.filter((i) => i.kategori === k);
              return (
                <div key={k} className="p-4">
                  <div className="flex items-start gap-3">
                    <input id={`kat-${k}`} type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={pilihan.includes(k)} disabled={daftar.length === 0}
                      onChange={(e) => setPilihan((p) => (e.target.checked ? [...p, k] : p.filter((x) => x !== k)))} />
                    <label htmlFor={`kat-${k}`} className="min-w-0 flex-1">
                      <span className="block font-medium">{v.label} <span className={`badge ${daftar.length ? "bg-amber-500/15 text-amber-700" : "bg-emerald-500/15 text-emerald-700"}`}>{daftar.length}</span></span>
                      <span className="block text-xs text-[var(--text-muted)]">{v.info}</span>
                    </label>
                    {daftar.length > 0 && (
                      <button type="button" className="shrink-0 text-xs font-semibold text-[var(--primary)]" onClick={() => setBuka(buka === k ? null : k)}>
                        {buka === k ? "Tutup" : "Lihat"}
                      </button>
                    )}
                  </div>
                  {buka === k && (
                    <ul className="mt-3 max-h-80 divide-y divide-[var(--border)] overflow-auto rounded-lg border border-[var(--border)]">
                      {daftar.slice(0, 100).map((i, n) => (
                        <li key={`${i.id}-${n}`} className="px-3 py-2 text-sm">
                          <Link to={`/admin/penduduk?q=${i.nik}`} className="font-medium text-[var(--primary)]">{i.nama}</Link>
                          <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">{i.nik}</span>
                          <span className="block text-xs text-[var(--text-muted)]">{i.pesan}</span>
                        </li>
                      ))}
                      {daftar.length > 100 && <li className="px-3 py-2 text-xs text-[var(--text-muted)]">… dan {daftar.length - 100} lainnya</li>}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>

          <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm">Kategori terpilih: <b>{jumlahTanda}</b> data akan ditandai "Cek".</p>
            <button type="button" className="btn-primary" disabled={simpan || jumlahTanda === 0} onClick={tandai}>{simpan ? "Menyimpan…" : 'Tandai sebagai "Cek"'}</button>
          </div>
        </>
      )}
    </div>
  );
}