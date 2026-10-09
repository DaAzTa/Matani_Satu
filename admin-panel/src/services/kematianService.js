// src/services/kematianService.js
// Death records. A resident who dies is marked MENINGGAL (the row is kept).
import { supabase } from "../supabase";

const KOLOM =
  "id,nik,no_kk,nama,jenis_kelamin,tanggal_lahir,lingkungan,status_hidup," +
  "tanggal_meninggal,tempat_meninggal,sebab_meninggal,dicatat_oleh,dicatat_pada";

function galat(error) {
  // P0001 = a message written in the database trigger (e.g. date in the future)
  if (error.code === "P0001") return new Error(error.message);
  if (error.code === "42501" || error.code === "PGRST116")
    return new Error("Tidak punya izin untuk tindakan ini, atau data tidak ditemukan.");
  return new Error("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
}

/** Search LIVING residents by name, NIK or No. KK (for choosing who died). */
export async function cariWargaHidup(teks) {
  const q = teks.replace(/[,()%*]/g, " ").trim();
  if (q.length < 3) return [];
  const { data, error } = await supabase
    .from("penduduk").select(KOLOM).eq("status_hidup", "HIDUP")
    .or(`nama.ilike.%${q}%,nik.ilike.%${q}%,no_kk.ilike.%${q}%`)
    .order("nama").limit(8);
  if (error) throw galat(error);
  return data;
}

/** Everyone recorded as deceased, newest first. */
export async function getKematian() {
  const { data, error } = await supabase
    .from("penduduk").select(KOLOM).eq("status_hidup", "MENINGGAL")
    .order("tanggal_meninggal", { ascending: false }).limit(1000);
  if (error) throw galat(error);
  return data;
}

/** Record a death: marks the resident as MENINGGAL. */
export async function catatKematian(id, { tanggal, tempat, sebab }) {
  const { data, error } = await supabase
    .from("penduduk")
    .update({
      status_hidup: "MENINGGAL",
      tanggal_meninggal: tanggal,
      tempat_meninggal: tempat?.trim() || null,
      sebab_meninggal: sebab?.trim() || null,
    })
    .eq("id", id).select(KOLOM).single();
  if (error) throw galat(error);
  return data;
}

/** Undo a death record (entered by mistake): resident counts as living again. */
export async function batalkanKematian(id) {
  const { data, error } = await supabase
    .from("penduduk").update({ status_hidup: "HIDUP" }).eq("id", id).select(KOLOM).single();
  if (error) throw galat(error);
  return data;
}

/** Age at death, from two "YYYY-MM-DD" strings. */
export function usiaSaatMeninggal(lahir, wafat) {
  if (!lahir || !wafat) return "";
  const [ly, lm, ld] = lahir.split("-").map(Number);
  const [wy, wm, wd] = wafat.split("-").map(Number);
  let u = wy - ly;
  if (wm < lm || (wm === lm && wd < ld)) u--;
  return u >= 0 ? `${u} th` : "";
}