#!/usr/bin/env node
// scripts/import-excel.mjs
// Impor data penduduk dari file Excel (sheet "UMUM") ke koleksi Firestore "penduduk".
//
// Pemakaian:
//   1. Firebase Console → Project settings → Service accounts → Generate new private key
//      simpan sebagai  admin-panel/serviceAccountKey.json  (SUDAH di-.gitignore, JANGAN di-commit)
//   2. npm run import:excel -- "D:/data/MATANI SATU data kK REV.xls" --dry-run   (cek dulu)
//   3. npm run import:excel -- "D:/data/MATANI SATU data kK REV.xls"             (tulis ke Firestore)
//
// • ID dokumen = NIK → aman dijalankan ulang (data diperbarui, tidak dobel).
// • Baris yang tidak lengkap/aneh tetap diimpor dengan flag perluVerifikasi: true
//   supaya admin bisa memperbaikinya dari halaman Data Kependudukan.
// • Setelah impor, dokumen publik statistik/ringkasan ikut diperbarui.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const DRY_RUN = args.includes("--dry-run");
const SHEET = (args.find((a) => a.startsWith("--sheet=")) || "--sheet=UMUM").split("=")[1];

if (!file || !existsSync(file)) {
  console.error('Pemakaian: npm run import:excel -- "<path-file.xls>" [--dry-run] [--sheet=UMUM]');
  process.exit(1);
}

/* ---------- 1. Baca Excel ---------- */
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const ws = wb.Sheets[SHEET];
if (!ws) {
  console.error(`Sheet "${SHEET}" tidak ditemukan. Sheet tersedia: ${wb.SheetNames.join(", ")}`);
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

/* ---------- 2. Normalisasi ---------- */
const ROMAWI = { SATU: "I", DUA: "II", TIGA: "III", EMPAT: "IV", LIMA: "V", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
const digits = (v) => String(v ?? "").replace(/\D/g, "");
const teks = (v) => String(v ?? "").trim();

function normLingkungan(v) {
  const m = teks(v).toUpperCase().match(/LINGKUNGAN\s+(\S+)/);
  if (!m) return "";
  return `LINGKUNGAN ${ROMAWI[m[1]] ?? m[1]}`;
}

function toISODate(v) {
  if (typeof v === "number" && v > 0) {
    // Nomor seri tanggal Excel → tanggal UTC (hindari geser hari akibat zona waktu)
    return new Date(Date.UTC(1899, 11, 30) + Math.round(v * 86400000)).toISOString().slice(0, 10);
  }
  const s = teks(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/); // dd-mm-yyyy
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

const judul = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const penduduk = [];
const masalah = [];

rows.forEach((r, i) => {
  const nik = digits(r.NIK);
  if (!nik) return; // baris kosong
  const lingkungan = normLingkungan(r.DUSUN);
  const p = {
    nik,
    nama: teks(r.NAMA).toUpperCase(),
    tempatLahir: teks(r.TMPT_LHR).toUpperCase(),
    tanggalLahir: toISODate(r.TGL_LHR),
    jenisKelamin: teks(r.JK).toUpperCase(),
    alamat: [lingkungan && judul(lingkungan), "Kel. Matani Satu", "Kec. Tomohon Tengah"].filter(Boolean).join(", "),
    lingkungan,
    noKk: digits(r.NO_KK),
    hubungan: teks(r.SHDK).toUpperCase(),
    agama: teks(r.AGAMA),
    pekerjaan: teks(r.PEKERJAAN).toUpperCase(),
    statusKawin: teks(r.STATUS).toUpperCase(),
    pendidikan: teks(r.PDDK_AKHIR).toUpperCase(),
  };

  const alasan = [];
  if (!/^\d{16}$/.test(p.nik)) alasan.push("NIK bukan 16 digit");
  if (p.noKk && !/^\d{16}$/.test(p.noKk)) alasan.push("No. KK bukan 16 digit");
  if (!p.nama) alasan.push("nama kosong");
  if (!["L", "P"].includes(p.jenisKelamin)) alasan.push(`JK tidak valid ("${p.jenisKelamin}")`);
  if (!p.tanggalLahir) alasan.push("tanggal lahir kosong/tidak valid");
  if (p.nama && p.nama === p.tempatLahir) alasan.push("kolom tergeser (nama = tempat lahir)");
  if (!LINGK_VALID(p.lingkungan)) alasan.push(`lingkungan tidak dikenal ("${teks(r.DUSUN)}")`);

  p.perluVerifikasi = alasan.length > 0;
  if (alasan.length) masalah.push({ baris: i + 2, nik: p.nik, nama: p.nama, alasan: alasan.join("; ") });
  penduduk.push(p);
});

function LINGK_VALID(l) {
  return ["LINGKUNGAN I", "LINGKUNGAN II", "LINGKUNGAN III", "LINGKUNGAN IV", "LINGKUNGAN V"].includes(l);
}

// NIK ganda → hanya yang terakhir dipakai (ID dokumen = NIK)
const unik = new Map(penduduk.map((p) => [p.nik, p]));
const duplikat = penduduk.length - unik.size;

/* ---------- 3. Ringkasan statistik ---------- */
function yearsAgoISO(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}
const list = [...unik.values()];
const b15 = yearsAgoISO(15);
const b65 = yearsAgoISO(65);
const anak = list.filter((p) => p.tanggalLahir && p.tanggalLahir > b15).length;
const lansia = list.filter((p) => p.tanggalLahir && p.tanggalLahir <= b65).length;
const ringkasan = {
  total: list.length,
  lakiLaki: list.filter((p) => p.jenisKelamin === "L").length,
  perempuan: list.filter((p) => p.jenisKelamin === "P").length,
  kepalaKeluarga: list.filter((p) => p.hubungan === "KEPALA KELUARGA").length,
  usia: { anak, produktif: list.length - anak - lansia, lansia },
  perLingkungan: Object.fromEntries(
    ["LINGKUNGAN I", "LINGKUNGAN II", "LINGKUNGAN III", "LINGKUNGAN IV", "LINGKUNGAN V"].map((l) => [
      l,
      list.filter((p) => p.lingkungan === l).length,
    ])
  ),
};

console.log(`\nFile      : ${resolve(file)}  (sheet ${SHEET})`);
console.log(`Baris     : ${penduduk.length}  | unik (NIK): ${unik.size}  | NIK ganda: ${duplikat}`);
console.log("Ringkasan :", JSON.stringify(ringkasan));
if (masalah.length) {
  console.log(`\n⚠  ${masalah.length} baris perlu verifikasi (tetap diimpor, ditandai "Cek"):`);
  console.table(masalah);
}

if (DRY_RUN) {
  console.log("\n--dry-run: tidak ada yang ditulis ke Firestore.");
  process.exit(0);
}

/* ---------- 4. Tulis ke Firestore (batch 400) ---------- */
const keyPath = resolve("serviceAccountKey.json");
initializeApp({
  credential: existsSync(keyPath) ? cert(JSON.parse(readFileSync(keyPath, "utf8"))) : applicationDefault(),
});
const db = getFirestore();

let ditulis = 0;
for (let i = 0; i < list.length; i += 400) {
  const batch = db.batch();
  for (const p of list.slice(i, i + 400)) {
    batch.set(
      db.collection("penduduk").doc(p.nik),
      { ...p, sumber: "import-excel", updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }
  await batch.commit();
  ditulis += Math.min(400, list.length - i);
  console.log(`  ✓ ${ditulis}/${list.length} dokumen`);
}

await db.doc("statistik/ringkasan").set({ ...ringkasan, diperbarui: FieldValue.serverTimestamp() });
console.log("\nSelesai. statistik/ringkasan juga sudah diperbarui.");
