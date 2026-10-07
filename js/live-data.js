/* js/live-data.js
   Mengambil angka TERBARU dari database Supabase (hasil impor Excel) dan
   memasukkannya ke halaman depan SEBELUM halaman ditampilkan.
   Jika Supabase belum diisi / gagal / database kosong, website tetap memakai
   data bawaan dari data.js dan data-profil.js (tidak ada yang rusak).

   Isi dua baris di bawah dari Supabase: Project Settings -> API.
   Hanya kunci "anon / publishable" yang boleh di sini. JANGAN kunci service_role. */

const SUPABASE_URL = "https://gczmnglxdpqqefhlcpdq.supabase.co";       // contoh: "https://gczmnglxdpqqefhlcpdq.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_SGOmzDbt-pYrDnMfkf6ckg_80fHMZoA";  // anon / publishable key

const CATATAN_LIVE = "Data langsung dari database kelurahan";
const angka = (n) => Number(n || 0).toLocaleString("id-ID");
const urutBesar = (obj) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);
const judulKata = (s) =>
  String(s || "").toLowerCase().replace(/(^|[\s/(.-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());

// Urutan & nama tampilan tingkat pendidikan (nilai lain yang tidak dikenal diabaikan)
const PENDIDIKAN_LABEL = [
  ["TIDAK/BELUM SEKOLAH", "Tidak/belum sekolah"],
  ["TIDAK TAMAT SD/SEDERAJAT", "Tidak tamat SD"],
  ["TAMAT SD/SEDERAJAT", "Tamat SD"],
  ["SLTP/SEDERAJAT", "SMP / sederajat"],
  ["SLTA/SEDERAJAT", "SMA / sederajat"],
  ["DIPLOMA I/II", "Diploma I/II"],
  ["AKADEMI/DIPLOMA III/S. MUDA", "Diploma III / Akademi"],
  ["DIPLOMA IV/STRATA I", "Diploma IV / S1"],
  ["STRATA II", "S2"],
  ["STRATA III", "S3"],
];

function terapkanDataLive(d) {
  // 1) Kartu angka di bagian Profil
  const fakta = (label) => PROFIL.fakta.find((f) => f.label === label);
  const penduduk = fakta("Jumlah Penduduk");
  if (penduduk) {
    penduduk.value = angka(d.total);
    penduduk.note = `Jiwa (${angka(d.lakiLaki)} laki-laki, ${angka(d.perempuan)} perempuan)`;
  }
  const kk = fakta("Kepala Keluarga");
  if (kk) kk.value = angka(d.kepalaKeluarga);

  // 2) Bagian 3 "Kondisi Kependudukan" di Data Profil
  const bagian = DATA_PROFIL.find((s) => s.no === 3);
  if (!bagian) return;
  const items = bagian.groups[0].items;
  const ganti = (label, rows) => {
    const x = items.find((i) => i.l === label);
    if (x && rows.length) { x.rows = rows; x.n = CATATAN_LIVE; }
  };

  ganti("Penduduk menurut jenis kelamin", [
    ["Laki-laki", `${angka(d.lakiLaki)} jiwa`],
    ["Perempuan", `${angka(d.perempuan)} jiwa`],
    ["Total", `${angka(d.total)} jiwa`],
  ]);
  ganti("Kepala keluarga (KK)", [
    ["Total", `${angka(d.kepalaKeluarga)} KK`],
    ["KK laki-laki", angka(d.kkLaki)],
    ["KK perempuan", angka(d.kkPerempuan)],
  ]);
  const u = d.umur || {};
  ganti("Kelompok umur", [
    ["0–14 tahun", angka(u["0-14"])], ["15–24 tahun", angka(u["15-24"])],
    ["25–44 tahun", angka(u["25-44"])], ["45–64 tahun", angka(u["45-64"])],
    ["65 tahun ke atas", angka(u["65+"])],
  ]);
  ganti("Tingkat pendidikan (tamatan)",
    PENDIDIKAN_LABEL.filter(([k]) => d.pendidikan && d.pendidikan[k] > 0)
      .map(([k, label]) => [label, angka(d.pendidikan[k])]));
  ganti("Mata pencaharian", urutBesar(d.pekerjaan).map(([k, n]) => [judulKata(k), angka(n)]));
  ganti("Agama", urutBesar(d.agama).map(([k, n]) => [k.toUpperCase() === "KATHOLIK" ? "Katolik" : judulKata(k), angka(n)]));

  // Butir baru (hanya muncul jika data live ada)
  const lingk = Object.entries(d.perLingkungan || {}).sort();
  if (lingk.length && !items.some((i) => i.l === "Penduduk per lingkungan")) {
    items.splice(2, 0, tb("Penduduk per lingkungan",
      lingk.map(([k, n]) => [judulKata(k).replace(/\b(I{1,3}|IV|V)\b/i, (m) => m.toUpperCase()), `${angka(n)} jiwa`]),
      CATATAN_LIVE));
  }
}

/* Dipanggil dari app.js sebelum React menampilkan halaman. Tidak pernah error,
   dan menunggu paling lama 4 detik. */
async function muatDataLive() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase) return false;
  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const batas = new Promise((_, tolak) => setTimeout(() => tolak(new Error("waktu habis")), 4000));
    const { data, error } = await Promise.race([client.rpc("statistik_beranda"), batas]);
    if (error || !data || !data.total) return false; // database kosong -> pakai data bawaan
    terapkanDataLive(data);
    return true;
  } catch (e) {
    console.warn("[live-data] memakai data bawaan:", e.message);
    return false;
  }
}