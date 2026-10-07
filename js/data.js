/* js/data.js
   SEMUA KONTEN WEBSITE ADA DI SINI. Ubah file ini saja untuk mengganti
   teks, foto, video, struktur kelurahan, dan peta — komponen tampilan
   tidak perlu disentuh.

   Cara menambah media:
   • Foto  → simpan di  assets/galeri/   lalu tulis nama filenya di GALERI.
   • Video → simpan .mp4 di assets/video/ (isi "src"), ATAU pakai video
             YouTube (isi "youtube" dengan ID video, mis. "dQw4w9WgXcQ").
   • Foto perangkat kelurahan → simpan di assets/struktur/ lalu isi "foto".
   Jika file belum ada, website otomatis menampilkan kotak placeholder. */

const NAV_LINKS = [
  { id: "beranda",  label: "Beranda" },
  { id: "profil",   label: "Profil" },
  { id: "data",     label: "Data" },
  { id: "galeri",   label: "Galeri" },
  { id: "video",    label: "Video" },
  { id: "struktur", label: "Struktur" },
  { id: "peta",     label: "Peta" },
];

const PROFIL = {
  nama: "Kelurahan Matani Satu",
  kecamatan: "Tomohon Tengah",
  kota: "Kota Tomohon",
  provinsi: "Sulawesi Utara",
  kodePos: "95445",
  deskripsi:
    "Matani Satu adalah salah satu kelurahan di Kecamatan Tomohon Tengah, Kota Tomohon, " +
    "Sulawesi Utara. Website ini memperkenalkan wajah kelurahan lewat foto, video, " +
    "struktur perangkat kelurahan, dan peta wilayah.",
  // Hapus/ubah baris yang belum pasti. value "" akan tampil sebagai "Segera diisi".
  fakta: [
    { icon: "MapArea", label: "Luas Wilayah",     value: "513,13 ha", note: "Profil Kelurahan Des 2024" },
    { icon: "Users",   label: "Jumlah Penduduk",  value: "2.075",    note: "Jiwa (1.056 laki-laki, 1.019 perempuan)" },
    { icon: "Home",    label: "Kepala Keluarga",  value: "729",      note: "KK" },
    { icon: "Layers",  label: "Lingkungan",       value: "5",        note: "Wilayah lingkungan" },
  ],
  batas: [
    { arah: "Utara",   wilayah: "Kelurahan Paslaten Dua" },
    { arah: "Timur",   wilayah: "Kabupaten Minahasa" },
    { arah: "Selatan", wilayah: "Kelurahan Matani Dua" },
    { arah: "Barat",   wilayah: "Kelurahan Matani Dua" },
  ],
};

/* Video di hero (latar belakang, tanpa suara). Kosongkan jika tidak ada. */
const HERO_VIDEO = "assets/video/hero.mp4";

const GALERI = [
  { src: "assets/galeri/foto-1.jpg", judul: "Kantor Kelurahan Matani Satu" },
  { src: "assets/galeri/foto-2.jpg", judul: "Suasana lingkungan" },
  { src: "assets/galeri/foto-3.jpg", judul: "Kegiatan warga" },
  { src: "assets/galeri/foto-4.jpg", judul: "Kerja bakti bersama" },
  { src: "assets/galeri/foto-5.jpg", judul: "Ibadah & kegiatan gereja" },
  { src: "assets/galeri/foto-6.jpg", judul: "Pemandangan kelurahan" },
  { src: "assets/galeri/foto-7.jpg", judul: "Posko KKT 149" },
  { src: "assets/galeri/foto-8.jpg", judul: "Kegiatan pemuda" },
  { src: "assets/galeri/foto-9.jpg", judul: "Sudut kelurahan" },
];

const VIDEOS = [
  { judul: "Profil Kelurahan Matani Satu", src: "assets/video/profil.mp4", youtube: "", poster: "" },
  { judul: "Dokumentasi Kegiatan",         src: "assets/video/kegiatan.mp4", youtube: "", poster: "" },
];

/* Struktur organisasi kelurahan. "foto" boleh dikosongkan. */
const STRUKTUR = {
  lurah:      { jabatan: "Lurah", nama: "Erick Y. Kalengkongan, S.Sos., M.A.P.", foto: "assets/struktur/lurah.jpg" },
  sekretaris: { jabatan: "Sekretaris Kelurahan", nama: "Bobby R.A. Suak, S.H.", foto: "assets/struktur/sekretaris.jpg" },
  seksi: [
    { jabatan: "Kasi Pemerintahan",            nama: "", foto: "" },
    { jabatan: "Kasi Ketentraman & Ketertiban", nama: "", foto: "" },
    { jabatan: "Kasi Pemberdayaan Masyarakat", nama: "", foto: "" },
  ],
  staf: [
    { jabatan: "Staf Kelurahan", nama: "Frianty Angelia Sengkey", foto: "" },
  ],
  // Tambah/kurangi sesuai jumlah lingkungan sebenarnya.
  lingkungan: [
    { jabatan: "Kepala Lingkungan I",   nama: "" },
    { jabatan: "Kepala Lingkungan II",  nama: "" },
    { jabatan: "Kepala Lingkungan III", nama: "" },
    { jabatan: "Kepala Lingkungan IV",  nama: "" },
    { jabatan: "Kepala Lingkungan V",   nama: "" },
  ],
};

/* Peta: pakai nama tempat (query) atau isi lat & lng agar titiknya tepat.
   Cara dapat koordinat: buka Google Maps → klik kanan lokasi kantor → salin angka. */
const PETA = {
  query: "Kelurahan Matani Satu, Tomohon Tengah, Kota Tomohon, Sulawesi Utara",
  lat: null,
  lng: null,
  zoom: 16,
};

const KONTAK = {
  alamat: "Jl. Kumeter 97 Kaaten, Kelurahan Matani Satu, Kec. Tomohon Tengah, Kota Tomohon, Sulawesi Utara 95445",
  telepon: "",
  email: "",
};
