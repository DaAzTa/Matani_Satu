// src/services/statistikService.js
// Statistics are calculated live by the SQL function statistik_publik()
// (counts only, no NIK/names), so nothing needs to be "published" any more.
import { supabase, isSupabaseConfigured } from "../supabase";

/** Public statistics (no login needed). */
export async function getRingkasanPublik() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("statistik_publik");
  if (error) throw error;
  return data;
}

/** Dashboard statistics (staff only: adds the "needs checking" count). */
export async function hitungRingkasan() {
  const publik = await getRingkasanPublik();
  const { count, error } = await supabase
    .from("penduduk").select("id", { count: "exact", head: true }).eq("perlu_verifikasi", true).eq("status_hidup", "HIDUP");
  if (error) throw error;
  return { ...publik, perluVerifikasi: count ?? 0 };
}

/** Kept so existing pages still work. Data is always live, so just refresh. */
export async function publikasikanRingkasan() {
  return getRingkasanPublik();
}