// src/pages/admin/Kelahiran.jsx
// Birth records (/admin/kelahiran): one form + one table, like Data Kematian.
// Saving adds the baby to the residents (living) and keeps the parents' names.
import { useEffect, useMemo, useState } from "react";
import { Baby, RotateCcw, Search } from "lucide-react";
import StatCard from "../../components/StatCard";
import ExportButtons from "../../components/ExportButtons";
import { HUBUNGAN, LINGKUNGAN } from "../../utils/penduduk";
import { unduhKelahiran } from "../../utils/exportData";
import { batalkanKelahiran, cariKeluarga, catatKelahiran, getKelahiran } from "../../services/kelahiranService";

const p2 = (n) => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const tgl = (iso) =>
  iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
const KOSONG = {
  nik: "", nama: "", jk: "", tanggalLahir: "", tempatLahir: "", noKk: "", lingkungan: "",
  alamat: "", namaAyah: "", namaIbu: "", hubungan: "ANAK",
};

function cek(f) {
  if (!/^\d{16}$/.test(f.nik)) return "NIK harus 16 angka.";
  if (!f.nama.trim()) return "Nama bayi wajib diisi.";
  if (!f.jk) return "Jenis kelamin wajib dipilih.";
  if (!f.tanggalLahir) return "Tanggal lahir wajib diisi.";
  if (!f.lingkungan) return "Lingkungan wajib dipilih.";
  return "";
}

export default function Kelahiran() {
  const [daftar, setDaftar] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [tahun, setTahun] = useState("semua");
  const [filter, setFilter] = useState("");
  const [f, setF] = useState({ ...KOSONG, tanggalLahir: hariIni() });
  const [cari, setCari] = useState("");
  const [hasil, setHasil] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const ubah = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const muat = () =>
    getKelahiran().then((d) => { setDaftar(d); setGagal(false); }).catch(() => { setGagal(true); setDaftar([]); });
  useEffect(() => { muat(); }, []);

  // search a family while typing (350 ms after the last key)
  useEffect(() => {
    if (cari.trim().length < 3) { setHasil([]); return; }
    let batal = false;
    const t = setTimeout(() => {
      cariKeluarga(cari).then((r) => !batal && setHasil(r)).catch(() => !batal && setHasil([]));
    }, 350);
    return () => { batal = true; clearTimeout(t); };
  }, [cari]);

  const pilihKeluarga = (w) => {
    setF((x) => ({ ...x, noKk: w.no_kk || "", lingkungan: w.lingkungan || x.lingkungan, alamat: w.alamat || "" }));
    setCari(""); setHasil([]);
    showToast(`Data keluarga ${w.nama} disalin (No. KK, lingkungan, alamat).`);
  };

  const tahunTersedia = useMemo(
    () => [...new Set((daftar || []).map((x) => x.tanggalLahir?.slice(0, 4)).filter(Boolean))].sort().reverse(), [daftar]);
  const tampil = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (daftar || []).filter((x) =>
      (tahun === "semua" || x.tanggalLahir?.startsWith(tahun)) &&
      (!q || (x.nama || "").toLowerCase().includes(q) || (x.nik || "").includes(q)));
  }, [daftar, tahun, filter]);
  const tahunIni = String(new Date().getFullYear());
  const jumlahTahunIni = (daftar || []).filter((x) => x.tanggalLahir?.startsWith(tahunIni)).length;

  const simpan = async () => {
    const salah = cek(f);
    if (salah) { showToast(salah, "error"); return; }
    setSaving(true);
    try {
      await catatKelahiran(f);
      showToast(`Kelahiran ${f.nama.toUpperCase()} dicatat dan ditambahkan ke data penduduk.`);
      setF({ ...KOSONG, tanggalLahir: hariIni() });
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const batalkan = async (b) => {
    if (!window.confirm(`Batalkan catatan kelahiran ${b.nama}?\nBayi ini juga akan DIHAPUS dari data penduduk. Gunakan hanya jika data salah input.`)) return;
    try {
      await batalkanKelahiran(b.pendudukId);
      showToast(`Catatan kelahiran ${b.nama} dibatalkan.`);
      await muat();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Data Kelahiran</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Bayi yang dicatat di sini otomatis ditambahkan ke data penduduk (aktif) dan dihitung dalam statistik.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Baby} label="Total Tercatat" value={daftar ? daftar.length : undefined} note="bayi" tone="green" />
        <StatCard icon={Baby} label={`Lahir Tahun ${tahunIni}`} value={daftar ? jumlahTahunIni : undefined} note="bayi" tone="primary" />
      </div>

      <section className="card p-5">
        <h3 className="font-semibold">Catat kelahiran baru</h3>

        <div className="mt-3 max-w-xl">
          <label className="label" htmlFor="b-cari">Cari keluarga untuk mengisi otomatis (opsional)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input id="b-cari" className="input pl-9" placeholder="Nama orang tua, NIK, atau No. KK…"
              value={cari} onChange={(e) => setCari(e.target.value)} />
          </div>
          {hasil.length > 0 && (
            <ul className="mt-2 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {hasil.map((w) => (
                <li key={w.id}>
                  <button type="button" onClick={() => pilihKeluarga(w)} className="w-full text-left px-3 py-2.5 hover:bg-[var(--bg-alt)]">
                    <span className="font-medium">{w.nama}</span>
                    <span className="block text-xs text-[var(--text-muted)]">
                      {w.hubungan || "-"} · KK {w.no_kk || "-"} · {(w.lingkungan || "").replace("LINGKUNGAN", "Lingkungan")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="label" htmlFor="b-nik">NIK bayi (16 angka)</label>
            <input id="b-nik" className="input" inputMode="numeric" maxLength={16} value={f.nik}
              onChange={(e) => setF((x) => ({ ...x, nik: e.target.value.replace(/\D/g, "") }))} /></div>
          <div><label className="label" htmlFor="b-nama">Nama bayi</label>
            <input id="b-nama" className="input" value={f.nama} onChange={ubah("nama")} /></div>
          <div><label className="label" htmlFor="b-jk">Jenis kelamin</label>
            <select id="b-jk" className="input" value={f.jk} onChange={ubah("jk")}>
              <option value="">Pilih…</option><option value="L">Laki-laki</option><option value="P">Perempuan</option>
            </select></div>
          <div><label className="label" htmlFor="b-tgl">Tanggal lahir</label>
            <input id="b-tgl" type="date" className="input" max={hariIni()} value={f.tanggalLahir} onChange={ubah("tanggalLahir")} /></div>
          <div><label className="label" htmlFor="b-tempat">Tempat lahir</label>
            <input id="b-tempat" className="input" value={f.tempatLahir} onChange={ubah("tempatLahir")} /></div>
          <div><label className="label" htmlFor="b-kk">No. KK</label>
            <input id="b-kk" className="input" inputMode="numeric" value={f.noKk} onChange={ubah("noKk")} /></div>
          <div><label className="label" htmlFor="b-lingk">Lingkungan</label>
            <select id="b-lingk" className="input" value={f.lingkungan} onChange={ubah("lingkungan")}>
              <option value="">Pilih…</option>
              {LINGKUNGAN.map((l) => <option key={l} value={l}>{l.replace("LINGKUNGAN", "Lingkungan")}</option>)}
            </select></div>
          <div><label className="label" htmlFor="b-hub">Hubungan dalam keluarga</label>
            <select id="b-hub" className="input" value={f.hubungan} onChange={ubah("hubungan")}>
              {HUBUNGAN.filter((h) => ["ANAK", "CUCU", "FAMILI LAIN", "LAINNYA"].includes(h)).map((h) => <option key={h} value={h}>{h}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="label" htmlFor="b-alamat">Alamat</label>
            <input id="b-alamat" className="input" value={f.alamat} onChange={ubah("alamat")} /></div>
          <div><label className="label" htmlFor="b-ayah">Nama ayah</label>
            <input id="b-ayah" className="input" value={f.namaAyah} onChange={ubah("namaAyah")} /></div>
          <div><label className="label" htmlFor="b-ibu">Nama ibu</label>
            <input id="b-ibu" className="input" value={f.namaIbu} onChange={ubah("namaIbu")} /></div>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          NIK wajib diisi. Jika bayi belum memiliki NIK, catat setelah NIK terbit.
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-ghost" disabled={saving} onClick={() => setF({ ...KOSONG, tanggalLahir: hariIni() })}>Kosongkan</button>
          <button type="button" className="btn-primary" disabled={saving} onClick={simpan}>
            {saving ? "Menyimpan…" : "Simpan catatan kelahiran"}
          </button>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <h3 className="font-semibold">Daftar kelahiran tercatat</h3>
          <div className="flex flex-wrap gap-2">
            <select className="input sm:w-36" value={tahun} onChange={(e) => setTahun(e.target.value)} aria-label="Filter tahun">
              <option value="semua">Semua tahun</option>
              {tahunTersedia.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input sm:w-56" placeholder="Cari nama / NIK…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <ExportButtons disabled={!tampil.length}
              onDownload={(fmt) => unduhKelahiran(fmt, tampil, { tahun, cari: filter })} />
          </div>
        </div>

        {daftar === null ? <div className="mt-4 skeleton h-32" />
          : gagal ? <p className="mt-4 text-sm text-[var(--danger)]">Gagal memuat data. Pastikan Anda sudah masuk dan SQL fitur tambahan sudah dijalankan.</p>
          : tampil.length === 0 ? <p className="mt-4 text-sm text-[var(--text-muted)]">Belum ada catatan kelahiran.</p>
          : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-2 pr-3 font-semibold">Nama</th>
                  <th className="py-2 pr-3 font-semibold">JK</th>
                  <th className="py-2 pr-3 font-semibold">Tgl. lahir</th>
                  <th className="py-2 pr-3 font-semibold">Orang tua</th>
                  <th className="py-2 pr-3 font-semibold">Lingkungan</th>
                  <th className="py-2 pr-3 font-semibold">Dicatat</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tampil.map((b) => (
                  <tr key={b.id} className="align-top">
                    <td className="py-2.5 pr-3"><p className="font-medium">{b.nama}</p><p className="text-xs text-[var(--text-muted)] font-mono">{b.nik}</p></td>
                    <td className="py-2.5 pr-3">{b.jk}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{tgl(b.tanggalLahir)}</td>
                    <td className="py-2.5 pr-3 text-xs">{b.namaAyah || "-"}<span className="block text-[var(--text-muted)]">{b.namaIbu || "-"}</span></td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{(b.lingkungan || "-").replace("LINGKUNGAN", "Lingkungan")}</td>
                    <td className="py-2.5 pr-3 text-xs text-[var(--text-muted)]">{b.dicatatOleh || "-"}{b.dicatatPada && <span className="block">{tgl(b.dicatatPada)}</span>}</td>
                    <td className="py-2.5 text-right">
                      <button type="button" className="icon-btn" title="Batalkan catatan" aria-label={`Batalkan catatan kelahiran ${b.nama}`} onClick={() => batalkan(b)}>
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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