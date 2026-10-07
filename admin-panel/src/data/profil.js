// src/data/profil.js — konten statis profil kelurahan (selaras dengan js/data.js situs profil).
export const PROFIL = {
  nama: "Kelurahan Matani Satu",
  kecamatan: "Tomohon Tengah",
  kota: "Kota Tomohon",
  provinsi: "Sulawesi Utara",
  kodePos: "95445",
  luas: "513,13 ha",
  deskripsi:
    "Matani Satu adalah salah satu kelurahan di Kecamatan Tomohon Tengah, Kota Tomohon, Sulawesi Utara, " +
    "yang terbagi atas lima lingkungan. Halaman ini menyajikan gambaran umum wilayah dan statistik " +
    "kependudukan yang diperbarui langsung oleh perangkat kelurahan.",
  batas: [
    { arah: "Utara", wilayah: "Kelurahan Paslaten Dua" },
    { arah: "Timur", wilayah: "Kabupaten Minahasa" },
    { arah: "Selatan", wilayah: "Kelurahan Matani Dua" },
    { arah: "Barat", wilayah: "Kelurahan Matani Dua" },
  ],
  // Dipakai bila statistik publik di Firestore belum tersedia.
  fallbackStat: { total: 2075, lakiLaki: 1056, perempuan: 1019, kepalaKeluarga: 729, sumber: "Profil Kelurahan Des 2024" },
};
