// src/utils/penduduk.js
// Konstanta, nilai awal form, validasi, dan helper format.

export const LINGKUNGAN = [
  "LINGKUNGAN I",
  "LINGKUNGAN II",
  "LINGKUNGAN III",
  "LINGKUNGAN IV",
  "LINGKUNGAN V",
];

export const AGAMA = ["Islam", "Kristen", "Katholik", "Hindu", "Budha", "Khonghucu", "Kepercayaan"];

export const HUBUNGAN = [
  "KEPALA KELUARGA",
  "ISTRI",
  "SUAMI",
  "ANAK",
  "MENANTU",
  "CUCU",
  "ORANG TUA",
  "MERTUA",
  "FAMILI LAIN",
  "LAINNYA",
];

// Nilai awal form tambah/edit. Enam field pertama adalah field wajib.
export const EMPTY_FORM = {
  nik: "",
  nama: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  alamat: "",
  lingkungan: "",
  noKk: "",
  hubungan: "",
  agama: "",
  pekerjaan: "",
};

/** Validasi sisi klien. Mengembalikan objek { namaField: pesanError }. */
export function validatePenduduk(f) {
  const e = {};
  if (!/^\d{16}$/.test(f.nik)) e.nik = "NIK harus 16 digit angka.";
  if (!f.nama.trim()) e.nama = "Nama lengkap wajib diisi.";
  if (!f.tempatLahir.trim()) e.tempatLahir = "Tempat lahir wajib diisi.";
  if (!f.tanggalLahir) e.tanggalLahir = "Tanggal lahir wajib diisi.";
  else if (f.tanggalLahir > todayISO()) e.tanggalLahir = "Tanggal lahir tidak boleh di masa depan.";
  if (!["L", "P"].includes(f.jenisKelamin)) e.jenisKelamin = "Pilih jenis kelamin.";
  if (!f.alamat.trim()) e.alamat = "Alamat wajib diisi.";
  if (f.noKk && !/^\d{16}$/.test(f.noKk)) e.noKk = "No. KK harus 16 digit angka.";
  return e;
}

/** Rapikan input sebelum dikirim ke Firestore. */
export function normalizePenduduk(f) {
  return {
    nik: f.nik.trim(),
    nama: f.nama.trim().toUpperCase(),
    tempatLahir: f.tempatLahir.trim().toUpperCase(),
    tanggalLahir: f.tanggalLahir, // format ISO "YYYY-MM-DD" → bisa di-query rentang
    jenisKelamin: f.jenisKelamin,
    alamat: f.alamat.trim(),
    lingkungan: f.lingkungan || "",
    noKk: f.noKk.trim(),
    hubungan: f.hubungan || "",
    agama: f.agama || "",
    pekerjaan: f.pekerjaan.trim().toUpperCase(),
  };
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Tanggal ISO n tahun yang lalu, mis. yearsAgoISO(15) → "2011-10-01". */
export function yearsAgoISO(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}

export function hitungUmur(iso) {
  if (!iso) return null;
  const lahir = new Date(iso);
  const now = new Date();
  let umur = now.getFullYear() - lahir.getFullYear();
  const m = now.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) umur--;
  return umur;
}

export function formatTanggal(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const formatAngka = (n) => (typeof n === "number" ? n.toLocaleString("id-ID") : "—");

/** Samarkan NIK untuk tampilan: 7173 •••• •••• 0001 */
export const maskNik = (nik = "") =>
  nik.length === 16 ? `${nik.slice(0, 4)} •••• •••• ${nik.slice(12)}` : nik;
