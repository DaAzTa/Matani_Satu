// src/utils/keluarga.js
// Groups residents by family card number (No. KK) and finds household problems.
// Input: residents in the camelCase form returned by getAllPenduduk().

const URUTAN = ["KEPALA KELUARGA", "SUAMI", "ISTRI", "ANAK", "MENANTU", "CUCU",
  "ORANG TUA", "MERTUA", "FAMILI LAIN", "PEMBANTU", "LAINNYA"];
const peringkat = (h) => { const i = URUTAN.indexOf(h); return i === -1 ? 99 : i; };
export const TANPA_KK = "(TANPA KK)";

export const MASALAH = {
  tanpa_kepala: "Tidak ada kepala keluarga",
  kepala_ganda: "Lebih dari satu kepala keluarga",
  tanpa_kk: "Tidak punya nomor KK",
  lingkungan_campur: "Anggota di lebih dari satu lingkungan",
};

export function kelompokkanKeluarga(penduduk) {
  const peta = new Map();
  for (const p of penduduk) {
    const kk = (p.noKk || "").trim() || TANPA_KK;
    if (!peta.has(kk)) peta.set(kk, []);
    peta.get(kk).push(p);
  }
  const hasil = [];
  for (const [noKk, daftar] of peta) {
    const anggota = [...daftar].sort((a, b) =>
      peringkat(a.hubungan) - peringkat(b.hubungan) ||
      String(a.tanggalLahir || "").localeCompare(String(b.tanggalLahir || "")));
    const kepala = anggota.filter((a) => a.hubungan === "KEPALA KELUARGA");
    const lingk = [...new Set(anggota.map((a) => a.lingkungan).filter(Boolean))];
    const masalah = [];
    if (noKk === TANPA_KK) masalah.push("tanpa_kk");
    else if (kepala.length === 0) masalah.push("tanpa_kepala");
    else if (kepala.length > 1) masalah.push("kepala_ganda");
    if (lingk.length > 1) masalah.push("lingkungan_campur");
    hasil.push({
      noKk, anggota, kepala, masalah, jumlah: anggota.length,
      lingkungan: (kepala[0] || anggota[0])?.lingkungan || "",
      alamat: (kepala[0] || anggota.find((a) => a.alamat) || {}).alamat || "",
    });
  }
  return hasil.sort((a, b) => a.noKk.localeCompare(b.noKk));
}

export function ringkasKeluarga(keluarga) {
  const hitung = (m) => keluarga.filter((k) => k.masalah.includes(m)).length;
  return {
    keluarga: keluarga.length,
    anggota: keluarga.reduce((n, k) => n + k.jumlah, 0),
    tanpaKepala: hitung("tanpa_kepala"),
    kepalaGanda: hitung("kepala_ganda"),
    bermasalah: keluarga.filter((k) => k.masalah.length > 0).length,
  };
}