// src/utils/exportData.js
// What goes into the Excel / PDF files of each page. The rows passed in are
// the rows the page is showing, so the file follows the active filters.
import { eksporExcel, eksporPdf } from "./export";
import { logUnduhan } from "../services/logService";
import { usiaSaatMeninggal } from "../services/kematianService";

const p2 = (n) => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const tgl = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
};
const umur = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  const n = new Date();
  let u = n.getFullYear() - y;
  if (n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d)) u--;
  return u;
};
const lingk = (l) => (l || "").replace("LINGKUNGAN", "Lingkungan");

async function jalankan({ format, halaman, judul, subjudul, namaFile, kolomExcel, kolomPdf, baris }) {
  if (format === "excel") await eksporExcel({ namaFile, namaSheet: halaman, kolom: kolomExcel, baris });
  else await eksporPdf({ namaFile, judul, subjudul, kolom: kolomPdf ?? kolomExcel, baris });
  logUnduhan(halaman, format, baris.length); // recorded in the activity log
}

/* ---------------- Population ---------------- */
const PENDUDUK_EXCEL = [
  { header: "No", value: (_, i) => i + 1, width: 6 },
  { header: "NIK", value: (b) => b.nik, width: 20 },
  { header: "No. KK", value: (b) => b.noKk, width: 20 },
  { header: "Nama", value: (b) => b.nama, width: 30 },
  { header: "Tempat Lahir", value: (b) => b.tempatLahir, width: 18 },
  { header: "Tanggal Lahir", value: (b) => tgl(b.tanggalLahir), width: 14 },
  { header: "Umur", value: (b) => umur(b.tanggalLahir), width: 7 },
  { header: "JK", value: (b) => b.jenisKelamin, width: 5 },
  { header: "Alamat", value: (b) => b.alamat, width: 40 },
  { header: "Lingkungan", value: (b) => lingk(b.lingkungan), width: 14 },
  { header: "Hubungan", value: (b) => b.hubungan, width: 18 },
  { header: "Agama", value: (b) => b.agama, width: 12 },
  { header: "Pekerjaan", value: (b) => b.pekerjaan, width: 24 },
  { header: "Status Kawin", value: (b) => b.statusKawin, width: 16 },
  { header: "Pendidikan", value: (b) => b.pendidikan, width: 24 },
];
const PENDUDUK_PDF = [
  { header: "No", value: (_, i) => i + 1 },
  { header: "NIK", value: (b) => b.nik },
  { header: "Nama", value: (b) => b.nama },
  { header: "Tempat, Tgl Lahir", value: (b) => `${b.tempatLahir || "-"}, ${tgl(b.tanggalLahir)}` },
  { header: "JK", value: (b) => b.jenisKelamin },
  { header: "Lingkungan", value: (b) => lingk(b.lingkungan) },
  { header: "Alamat", value: (b) => b.alamat },
  { header: "Hubungan", value: (b) => b.hubungan },
];

/** f = { cari, lingkungan, jk, verifikasi } : the filters active on the page */
export function unduhPenduduk(format, baris, f = {}) {
  const info = [
    f.lingkungan && lingk(f.lingkungan),
    f.jk && (f.jk === "L" ? "Laki-laki" : "Perempuan"),
    f.verifikasi && "Perlu diverifikasi",
    f.cari && `Pencarian: "${f.cari}"`,
  ].filter(Boolean);
  return jalankan({
    format, baris, halaman: "Data Penduduk",
    judul: "Data Penduduk - Kelurahan Matani Satu",
    subjudul: info.length ? `Filter: ${info.join("  |  ")}` : "Semua penduduk aktif",
    namaFile: `data-penduduk-${hariIni()}`,
    kolomExcel: PENDUDUK_EXCEL, kolomPdf: PENDUDUK_PDF,
  });
}

/* ---------------- Deaths ---------------- */
const KEMATIAN = [
  { header: "No", value: (_, i) => i + 1, width: 6 },
  { header: "NIK", value: (b) => b.nik, width: 20 },
  { header: "Nama", value: (b) => b.nama, width: 30 },
  { header: "JK", value: (b) => b.jenis_kelamin, width: 5 },
  { header: "Tanggal Lahir", value: (b) => tgl(b.tanggal_lahir), width: 14 },
  { header: "Tanggal Meninggal", value: (b) => tgl(b.tanggal_meninggal), width: 18 },
  { header: "Usia", value: (b) => usiaSaatMeninggal(b.tanggal_lahir, b.tanggal_meninggal), width: 8 },
  { header: "Tempat", value: (b) => b.tempat_meninggal, width: 22 },
  { header: "Sebab / Keterangan", value: (b) => b.sebab_meninggal, width: 28 },
  { header: "Lingkungan", value: (b) => lingk(b.lingkungan), width: 14 },
  { header: "Dicatat oleh", value: (b) => b.dicatat_oleh, width: 26 },
];
export function unduhKematian(format, baris, f = {}) {
  const info = [f.tahun && f.tahun !== "semua" && `Tahun ${f.tahun}`, f.cari && `Pencarian: "${f.cari}"`].filter(Boolean);
  return jalankan({
    format, baris, halaman: "Data Kematian",
    judul: "Data Kematian - Kelurahan Matani Satu",
    subjudul: info.length ? `Filter: ${info.join("  |  ")}` : "Semua catatan kematian",
    namaFile: `data-kematian-${hariIni()}`,
    kolomExcel: KEMATIAN,
  });
}

/* ---------------- Births ---------------- */
const KELAHIRAN = [
  { header: "No", value: (_, i) => i + 1, width: 6 },
  { header: "NIK", value: (b) => b.nik, width: 20 },
  { header: "Nama", value: (b) => b.nama, width: 30 },
  { header: "JK", value: (b) => b.jk, width: 5 },
  { header: "Tanggal Lahir", value: (b) => tgl(b.tanggalLahir), width: 14 },
  { header: "Tempat Lahir", value: (b) => b.tempatLahir, width: 18 },
  { header: "Nama Ayah", value: (b) => b.namaAyah, width: 26 },
  { header: "Nama Ibu", value: (b) => b.namaIbu, width: 26 },
  { header: "No. KK", value: (b) => b.noKk, width: 20 },
  { header: "Lingkungan", value: (b) => lingk(b.lingkungan), width: 14 },
  { header: "Dicatat oleh", value: (b) => b.dicatatOleh, width: 26 },
];
export function unduhKelahiran(format, baris, f = {}) {
  const info = [f.tahun && f.tahun !== "semua" && `Tahun ${f.tahun}`, f.cari && `Pencarian: "${f.cari}"`].filter(Boolean);
  return jalankan({
    format, baris, halaman: "Data Kelahiran",
    judul: "Data Kelahiran - Kelurahan Matani Satu",
    subjudul: info.length ? `Filter: ${info.join("  |  ")}` : "Semua catatan kelahiran",
    namaFile: `data-kelahiran-${hariIni()}`,
    kolomExcel: KELAHIRAN,
  });
}




/* ---------------- Households ---------------- */
const MASALAH_TEKS = {
  tanpa_kepala: "Tanpa kepala keluarga", kepala_ganda: "Kepala keluarga ganda",
  tanpa_kk: "Tanpa nomor KK", lingkungan_campur: "Lingkungan campur",
};
const KELUARGA = [
  { header: "No", value: (_, i) => i + 1, width: 6 },
  { header: "No. KK", value: (k) => (k.noKk === "(TANPA KK)" ? "" : k.noKk), width: 20 },
  { header: "Kepala Keluarga", value: (k) => k.kepala.map((x) => x.nama).join(" / "), width: 30 },
  { header: "Jumlah Anggota", value: (k) => k.jumlah, width: 14 },
  { header: "Lingkungan", value: (k) => lingk(k.lingkungan), width: 14 },
  { header: "Alamat", value: (k) => k.alamat, width: 40 },
  { header: "Catatan", value: (k) => k.masalah.map((m) => MASALAH_TEKS[m]).join("; "), width: 36 },
];
/** baris = households (from kelompokkanKeluarga) */
export function unduhKeluarga(format, baris, f = {}) {
  const info = [f.lingkungan && lingk(f.lingkungan), f.masalah && (f.masalah === "semua" ? "Hanya bermasalah" : MASALAH_TEKS[f.masalah]), f.cari && `Pencarian: "${f.cari}"`].filter(Boolean);
  return jalankan({
    format, baris, halaman: "Data Keluarga",
    judul: "Data Keluarga - Kelurahan Matani Satu",
    subjudul: info.length ? `Filter: ${info.join("  |  ")}` : "Semua keluarga",
    namaFile: `data-keluarga-${hariIni()}`,
    kolomExcel: KELUARGA,
  });
}