// src/services/pendudukService.js
// CRUD for the table public.penduduk (Supabase).
// The pages keep using camelCase fields (tempatLahir, noKk, ...); this file
// converts to/from the snake_case columns of the database.
import { supabase } from "../supabase";

const TABEL = "penduduk";
const KOLOM =
  "id,nik,no_kk,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,alamat,lingkungan,hubungan,agama,pekerjaan,status_kawin,pendidikan,perlu_verifikasi";

const dariDb = (r) => ({
  id: r.id,
  nik: r.nik,
  noKk: r.no_kk ?? "",
  nama: r.nama,
  tempatLahir: r.tempat_lahir ?? "",
  tanggalLahir: r.tanggal_lahir ?? "",
  jenisKelamin: r.jenis_kelamin ?? "",
  alamat: r.alamat ?? "",
  lingkungan: r.lingkungan ?? "",
  hubungan: r.hubungan ?? "",
  agama: r.agama ?? "",
  pekerjaan: r.pekerjaan ?? "",
  statusKawin: r.status_kawin ?? "",
  pendidikan: r.pendidikan ?? "",
  perluVerifikasi: !!r.perlu_verifikasi,
});

const keDb = (d) => ({
  nik: d.nik,
  no_kk: d.noKk || null,
  nama: d.nama,
  tempat_lahir: d.tempatLahir || null,
  tanggal_lahir: d.tanggalLahir || null,
  jenis_kelamin: d.jenisKelamin || null,
  alamat: d.alamat || null,
  lingkungan: d.lingkungan || null,
  hubungan: d.hubungan || null,
  agama: d.agama || null,
  pekerjaan: d.pekerjaan || null,
});

function pesan(error, nik) {
  if (error.code === "23505") return new Error(`NIK ${nik} sudah terdaftar.`);
  if (error.code === "42501" || error.code === "PGRST116")
    return new Error("Tidak punya izin untuk tindakan ini, atau data tidak ditemukan.");
  return new Error(error.message);
}

/* READ — Supabase returns max 1000 rows per request, so we load in pages. */
export async function getAllPenduduk() {
  const UKURAN = 1000;
  const semua = [];
  for (let dari = 0; ; dari += UKURAN) {
    const { data, error } = await supabase
      .from(TABEL).select(KOLOM).eq("status_hidup", "HIDUP").order("nama").order("nik").range(dari, dari + UKURAN - 1);
    if (error) throw pesan(error);
    semua.push(...data);
    if (data.length < UKURAN) break;
  }
  return semua.map(dariDb);
}

export async function isNikTaken(nik, excludeId = null) {
  const { data, error } = await supabase.from(TABEL).select("id").eq("nik", nik).limit(2);
  if (error) throw pesan(error);
  return data.some((r) => r.id !== excludeId);
}

/* CREATE */
export async function addPenduduk(data) {
  if (await isNikTaken(data.nik)) throw new Error(`NIK ${data.nik} sudah terdaftar.`);
  const { data: row, error } = await supabase
    .from(TABEL).insert(keDb(data)).select(KOLOM).single();
  if (error) throw pesan(error, data.nik);
  return dariDb(row);
}

/* UPDATE */
export async function updatePenduduk(id, data) {
  if (await isNikTaken(data.nik, id)) throw new Error(`NIK ${data.nik} sudah dipakai warga lain.`);
  const { data: row, error } = await supabase
    .from(TABEL)
    .update({ ...keDb(data), perlu_verifikasi: false, alasan_verifikasi: null })
    .eq("id", id).select(KOLOM).single();
  if (error) throw pesan(error, data.nik);
  return dariDb(row);
}

/* DELETE */
export async function deletePenduduk(id) {
  const { data, error } = await supabase.from(TABEL).delete().eq("id", id).select("id");
  if (error) throw pesan(error);
  if (!data.length) throw new Error("Tidak punya izin untuk menghapus, atau data tidak ditemukan.");
}