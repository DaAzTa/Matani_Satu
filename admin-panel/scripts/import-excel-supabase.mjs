#!/usr/bin/env node
// scripts/import-excel-supabase.mjs
// Impor sheet "UMUM" dari Excel ke tabel Supabase "penduduk".
//
// Pemakaian (dari folder admin-panel):
//   node --env-file=.env.local scripts/import-excel-supabase.mjs "D:/data/MATANI SATU data kK REV.xls" --dry-run
//   node --env-file=.env.local scripts/import-excel-supabase.mjs "D:/data/MATANI SATU data kK REV.xls"
//
// Perlu di .env.local:  SUPABASE_URL  dan  SUPABASE_SERVICE_ROLE_KEY  (rahasia, jangan di-commit)
// • Aman dijalankan ulang: NIK dipakai sebagai kunci (data diperbarui, tidak dobel).
// • Baris janggal tetap diimpor dan ditandai perlu_verifikasi = true.
import { readFileSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const DRY_RUN = args.includes("--dry-run");
const SHEET = (args.find((a) => a.startsWith("--sheet=")) || "--sheet=UMUM").split("=")[1];

if (!file || !existsSync(file)) {
  console.error('Pemakaian: node --env-file=.env.local scripts/import-excel-supabase.mjs "<file.xls>" [--dry-run]');
  process.exit(1);
}

const wb = XLSX.read(readFileSync(file), { type: "buffer", cellDates: false });
const ws = wb.Sheets[SHEET];
if (!ws) {
  console.error(`Sheet "${SHEET}" tidak ditemukan. Sheet tersedia: ${wb.SheetNames.join(", ")}`);
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

const ROMAWI = { SATU: "I", DUA: "II", TIGA: "III", EMPAT: "IV", LIMA: "V", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
const LINGKUNGAN = ["LINGKUNGAN I", "LINGKUNGAN II", "LINGKUNGAN III", "LINGKUNGAN IV", "LINGKUNGAN V"];
const digits = (v) => String(v ?? "").replace(/\D/g, "");
const teks = (v) => String(v ?? "").trim();

function normLingkungan(v) {
  const m = teks(v).toUpperCase().match(/LINGKUNGAN\s+(\S+)/);
  return m ? `LINGKUNGAN ${ROMAWI[m[1]] ?? m[1]}` : "";
}
function toISODate(v) {
  if (typeof v === "number" && v > 0) return new Date(Date.UTC(1899, 11, 30) + Math.round(v * 86400000)).toISOString().slice(0, 10);
  const s = teks(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}

const peta = new Map();
const masalah = [];
rows.forEach((r, i) => {
  const nik = digits(r.NIK);
  if (!nik) return;
  const jk = teks(r.JK).toUpperCase();
  const lingk = normLingkungan(r.DUSUN);
  const tgl = toISODate(r.TGL_LHR);
  const nama = teks(r.NAMA).toUpperCase();
  const alasan = [];
  if (!/^\d{16}$/.test(nik)) alasan.push("NIK bukan 16 digit");
  if (!nama) alasan.push("nama kosong");
  if (!["L", "P"].includes(jk)) alasan.push(`JK tidak valid ("${jk}")`);
  if (!tgl) alasan.push("tanggal lahir kosong/tidak valid");
  if (!LINGKUNGAN.includes(lingk)) alasan.push(`lingkungan tidak dikenal ("${teks(r.DUSUN)}")`);
  if (nama && nama === teks(r.TMPT_LHR).toUpperCase()) alasan.push("kolom tergeser (nama = tempat lahir)");

  if (alasan.length) masalah.push({ baris: i + 2, nik, nama, alasan: alasan.join("; ") });
  if (!/^\d{16}$/.test(nik)) return; // tabel hanya menerima NIK 16 digit → dilaporkan di atas

  peta.set(nik, {
    nik,
    alamat: [lingk && lingk.replace("LINGKUNGAN", "Lingkungan"), "Kel. Matani Satu", "Kec. Tomohon Tengah"].filter(Boolean).join(", "),
    no_kk: digits(r.NO_KK) || null,
    nama: nama || "(TANPA NAMA)",
    tempat_lahir: teks(r.TMPT_LHR).toUpperCase() || null,
    tanggal_lahir: tgl,
    jenis_kelamin: ["L", "P"].includes(jk) ? jk : null,
    lingkungan: LINGKUNGAN.includes(lingk) ? lingk : null,
    hubungan: teks(r.SHDK).toUpperCase() || null,
    agama: teks(r.AGAMA) || null,
    pekerjaan: teks(r.PEKERJAAN).toUpperCase() || null,
    status_kawin: teks(r.STATUS).toUpperCase() || null,
    pendidikan: teks(r.PDDK_AKHIR).toUpperCase() || null,
    perlu_verifikasi: alasan.length > 0,
    alasan_verifikasi: alasan.join("; ") || null,
  });
});

const list = [...peta.values()];
console.log(`Baris Excel: ${rows.length} | siap diimpor (NIK unik): ${list.length}`);
if (masalah.length) {
  console.log(`\n⚠  ${masalah.length} baris perlu dicek (tetap diimpor, ditandai perlu_verifikasi):`);
  console.table(masalah);
}
if (DRY_RUN) { console.log("\n--dry-run: tidak ada yang ditulis ke Supabase."); process.exit(0); }

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local, lalu jalankan dengan --env-file=.env.local");
  process.exit(1);
}
const { createClient } = await import("@supabase/supabase-js"); // dimuat hanya saat benar-benar menulis
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let ditulis = 0;
for (let i = 0; i < list.length; i += 500) {
  const { error } = await supabase.from("penduduk").upsert(list.slice(i, i + 500), { onConflict: "nik" });
  if (error) { console.error("Gagal menulis:", error.message); process.exit(1); }
  ditulis += Math.min(500, list.length - i);
  console.log(`  ✓ ${ditulis}/${list.length}`);
}
console.log("\nSelesai.");
