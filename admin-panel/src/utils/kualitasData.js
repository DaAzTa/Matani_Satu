// src/utils/kualitasData.js
// Data quality checker. Pure functions: give it the residents (camelCase, as
// returned by getAllPenduduk) and it returns the problems it finds.

export const KATEGORI = {
  DUPLIKAT: { label: "Kemungkinan data ganda", info: "Nama dan tanggal lahir sama, tetapi NIK berbeda.", bawaan: true },
  USIA: { label: "Umur tidak masuk akal", info: "Tanggal lahir kosong, di masa depan, lebih dari 110 tahun, atau kepala keluarga di bawah 17 tahun.", bawaan: true },
  NIK_TANGGAL: { label: "NIK tidak cocok dengan tanggal lahir", info: "Tanggal lahir di dalam NIK berbeda dengan data.", bawaan: true },
  NIK_GENDER: { label: "NIK tidak cocok dengan jenis kelamin", info: "Kode jenis kelamin di dalam NIK berbeda dengan data.", bawaan: true },
  NIK_WILAYAH: { label: "NIK dari wilayah lain", info: "Kode kota/kabupaten NIK berbeda dengan mayoritas warga. Sering terjadi pada warga pendatang, jadi tidak dicentang otomatis.", bawaan: false },
};

const tglTeks = (iso) => (iso ? String(iso).slice(0, 10).split("-").reverse().join("-") : "");
const normNama = (s) => String(s || "").trim().toUpperCase().replace(/\s+/g, " ");

export function umurTahun(iso, hariIni = new Date()) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  let u = hariIni.getFullYear() - y;
  if (hariIni.getMonth() + 1 < m || (hariIni.getMonth() + 1 === m && hariIni.getDate() < d)) u--;
  return u;
}

export function periksaKualitas(penduduk, { hariIni = new Date() } = {}) {
  const isu = [];
  const tambah = (p, kategori, pesan) => isu.push({ id: p.id, nik: p.nik, nama: p.nama, kategori, pesan });

  // 1. duplicates: same name + birth date, different NIK
  const grup = new Map();
  for (const p of penduduk) {
    if (!p.tanggalLahir || !normNama(p.nama)) continue;
    const k = `${normNama(p.nama)}|${String(p.tanggalLahir).slice(0, 10)}`;
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k).push(p);
  }
  for (const daftar of grup.values()) {
    if (new Set(daftar.map((p) => p.nik)).size < 2) continue;
    for (const p of daftar) {
      const lain = daftar.filter((x) => x.id !== p.id).map((x) => x.nik).join(", ");
      tambah(p, "DUPLIKAT", `Nama dan tanggal lahir sama dengan NIK ${lain}`);
    }
  }

  // 2. ages that do not make sense
  for (const p of penduduk) {
    if (!p.tanggalLahir) { tambah(p, "USIA", "Tanggal lahir kosong"); continue; }
    const u = umurTahun(p.tanggalLahir, hariIni);
    if (u < 0) tambah(p, "USIA", `Tanggal lahir di masa depan (${tglTeks(p.tanggalLahir)})`);
    else if (u > 110) tambah(p, "USIA", `Umur ${u} tahun, lebih dari 110`);
    else if (p.hubungan === "KEPALA KELUARGA" && u < 17) tambah(p, "USIA", `Kepala keluarga berumur ${u} tahun`);
  }

  // 3. NIK structure: digits 1-4 city, 7-8 day (+40 for women), 9-10 month, 11-12 year
  const hitungWilayah = new Map();
  for (const p of penduduk) {
    if (/^\d{16}$/.test(p.nik || "")) {
      const w = p.nik.slice(0, 4);
      hitungWilayah.set(w, (hitungWilayah.get(w) || 0) + 1);
    }
  }
  const wilayahUtama = [...hitungWilayah.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  for (const p of penduduk) {
    if (!/^\d{16}$/.test(p.nik || "")) continue;
    const dd = Number(p.nik.slice(6, 8));
    const perempuanDiNik = dd > 40;
    const hari = perempuanDiNik ? dd - 40 : dd;
    const bln = Number(p.nik.slice(8, 10));
    const thn = Number(p.nik.slice(10, 12));
    if (p.jenisKelamin === "L" || p.jenisKelamin === "P") {
      if ((p.jenisKelamin === "P") !== perempuanDiNik)
        tambah(p, "NIK_GENDER", `NIK menunjukkan ${perempuanDiNik ? "perempuan" : "laki-laki"}, data tertulis ${p.jenisKelamin === "P" ? "perempuan" : "laki-laki"}`);
    }
    if (p.tanggalLahir) {
      const [y, m, d] = String(p.tanggalLahir).slice(0, 10).split("-").map(Number);
      if (d !== hari || m !== bln || y % 100 !== thn)
        tambah(p, "NIK_TANGGAL", `Tanggal lahir di NIK ${String(hari).padStart(2, "0")}-${String(bln).padStart(2, "0")}-${String(thn).padStart(2, "0")}, data ${tglTeks(p.tanggalLahir)}`);
    }
    if (wilayahUtama && p.nik.slice(0, 4) !== wilayahUtama)
      tambah(p, "NIK_WILAYAH", `NIK berasal dari wilayah ${p.nik.slice(0, 4)} (mayoritas warga: ${wilayahUtama})`);
  }

  const ringkasan = Object.fromEntries(Object.keys(KATEGORI).map((k) => [k, 0]));
  for (const i of isu) ringkasan[i.kategori]++;
  return { isu, ringkasan, wilayahUtama, jumlahDiperiksa: penduduk.length };
}

/** Turns the chosen categories into [{ id, alasan }] for the "Cek" flag. */
export function siapkanTanda(isu, kategoriDipilih) {
  const peta = new Map();
  for (const i of isu) {
    if (!kategoriDipilih.includes(i.kategori)) continue;
    if (!peta.has(i.id)) peta.set(i.id, []);
    const daftar = peta.get(i.id);
    if (!daftar.includes(i.pesan)) daftar.push(i.pesan);
  }
  return [...peta.entries()].map(([id, pesan]) => ({ id, alasan: pesan.join("; ") }));
}