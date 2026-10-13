// src/services/statistikService.js
// Statistics are calculated live in the database.
import { supabase, isSupabaseConfigured } from "../supabase";

/** Public statistics (no login needed): counts only, no names or NIK. */
export async function getRingkasanPublik() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("statistik_publik");
  if (error) throw error;
  return data;
}

/** Dashboard statistics (staff only), for all neighborhoods or just one. */
export async function hitungRingkasan(lingkungan = "") {
  const { data, error } = await supabase.rpc("statistik_admin", { p_lingkungan: lingkungan || null });
  if (error) throw error;
  return data;
}

/** Kept so existing pages still work. Data is always live, so just refresh. */
export async function publikasikanRingkasan() {
  return getRingkasanPublik();
}