// src/pages/admin/LogAktivitas.jsx
// Activity log (/admin/log): who changed what data, and when.
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getLog } from "../../services/logService";

const PER_HALAMAN = 50;
const AKSI = {
  TAMBAH: ["Tambah", "bg-emerald-500/15 text-emerald-700"],
  UBAH: ["Ubah", "bg-sky-500/15 text-sky-700"],
  HAPUS: ["Hapus", "bg-red-500/15 text-red-700"],
  KELAHIRAN: ["Kelahiran", "bg-teal-500/15 text-teal-700"],
  KEMATIAN: ["Kematian", "bg-amber-500/15 text-amber-700"],
  BATAL_KEMATIAN: ["Batal kematian", "bg-orange-500/15 text-orange-700"],
  UNDUH: ["Unduh", "bg-violet-500/15 text-violet-700"],
  PERIKSA: ["Pemeriksaan data", "bg-indigo-500/15 text-indigo-700"],
};
const FIELD = {
  nik: "NIK", no_kk: "No. KK", nama: "Nama", tempat_lahir: "Tempat lahir", tanggal_lahir: "Tanggal lahir",
  jenis_kelamin: "Jenis kelamin", alamat: "Alamat", lingkungan: "Lingkungan", hubungan: "Hubungan",
  agama: "Agama", pekerjaan: "Pekerjaan", status_kawin: "Status kawin", pendidikan: "Pendidikan",
  status_hidup: "Status", tanggal_meninggal: "Tanggal meninggal", tempat_meninggal: "Tempat meninggal",
  sebab_meninggal: "Sebab meninggal", perlu_verifikasi: "Perlu verifikasi", alasan_verifikasi: "Alasan verifikasi",
  judul: "Judul", isi: "Isi", terbit: "Terbit", tanggal: "Tanggal", foto_url: "Foto", singkat: "Label",
  nama_ayah: "Nama ayah", nama_ibu: "Nama ibu",
};
const nilai = (x) => (x === null || x === undefined || x === "" ? "(kosong)" : String(x));
const waktu = (iso) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Rincian({ r }) {
  if (!r) return null;
  return (
    <dl className="mt-2 rounded-lg bg-[var(--bg-alt)] p-3 text-xs space-y-1">
      {Object.entries(r).map(([k, v]) => (
        <div key={k} className="flex flex-wrap gap-x-2">
          <dt className="font-semibold">{FIELD[k] || k}:</dt>
          <dd className="text-[var(--text-muted)]">
            {Array.isArray(v) ? `${nilai(v[0])}  →  ${nilai(v[1])}` : String(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function LogAktivitas() {
  const [data, setData] = useState(null); // null = loading
  const [total, setTotal] = useState(0);
  const [gagal, setGagal] = useState(false);
  const [halaman, setHalaman] = useState(0);
  const [aksi, setAksi] = useState("");
  const [input, setInput] = useState("");
  const [cari, setCari] = useState("");
  const [buka, setBuka] = useState(null);

  // wait 350 ms after the last key before searching
  useEffect(() => {
    const t = setTimeout(() => { setCari(input); setHalaman(0); }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    let batal = false;
    setData(null);
    getLog({ dari: halaman * PER_HALAMAN, jumlah: PER_HALAMAN, aksi, cari })
      .then((r) => { if (!batal) { setData(r.baris); setTotal(r.total); setGagal(false); } })
      .catch(() => { if (!batal) { setGagal(true); setData([]); } });
    return () => { batal = true; };
  }, [halaman, aksi, cari]);

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Log Aktivitas</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Catatan otomatis: siapa mengubah data apa, dan kapan. Log tidak bisa diubah atau dihapus dari panel.
        </p>
      </div>

      <div className="card p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input className="input pl-9" placeholder="Cari nama atau email pengguna…" value={input}
            onChange={(e) => setInput(e.target.value)} />
        </div>
        <select className="input md:w-48" value={aksi} aria-label="Filter jenis aksi"
          onChange={(e) => { setAksi(e.target.value); setHalaman(0); }}>
          <option value="">Semua aksi</option>
          {Object.entries(AKSI).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      <section className="card p-5">
        {data === null ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : gagal ? (
          <p className="text-sm text-[var(--danger)]">Gagal memuat log. Pastikan Anda sudah masuk dan SQL fitur tambahan sudah dijalankan.</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Belum ada aktivitas yang cocok.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {data.map((l) => {
              const [label, warna] = AKSI[l.aksi] || [l.aksi, "bg-[var(--bg-alt)]"];
              return (
                <li key={l.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`badge ${warna}`}>{label}</span>
                    <span className="text-sm font-medium">{l.ringkasan}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {waktu(l.waktu)} · {l.email}
                    {l.rincian && (
                      <button type="button" className="ml-3 font-semibold text-[var(--primary)]"
                        onClick={() => setBuka(buka === l.id ? null : l.id)}>
                        {buka === l.id ? "Sembunyikan rincian" : "Lihat rincian"}
                      </button>
                    )}
                  </p>
                  {buka === l.id && <Rincian r={l.rincian} />}
                </li>
              );
            })}
          </ul>
        )}

        {data && data.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">{total} aktivitas</span>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost h-9" disabled={halaman === 0} onClick={() => setHalaman((h) => h - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Halaman <span translate="no">{halaman + 1}</span> dari <span translate="no">{totalHalaman}</span></span>
              <button type="button" className="btn-ghost h-9" disabled={halaman + 1 >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}