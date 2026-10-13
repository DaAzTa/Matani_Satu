// src/services/logService.js
// Activity log (table log_aktivitas). The database fills it automatically;
// the panel only reads it, and reports downloads.
import { supabase } from "../supabase";

export async function getLog({ dari = 0, jumlah = 50, aksi = "", cari = "" } = {}) {
  let q = supabase
    .from("log_aktivitas")
    .select("id,waktu,email,aksi,tabel,ringkasan,rincian", { count: "exact" })
    .order("waktu", { ascending: false })
    .range(dari, dari + jumlah - 1);
  if (aksi) q = q.eq("aksi", aksi);
  const s = cari.replace(/[,()%*]/g, " ").trim();
  if (s) q = q.or(`ringkasan.ilike.%${s}%,email.ilike.%${s}%`);
  const { data, error, count } = await q;
  if (error) throw error;
  return { baris: data, total: count ?? data.length };
}

/** Fire-and-forget: a failed log must never block a download. */
export function logUnduhan(halaman, format, jumlah) {
  try {
    supabase.rpc("catat_unduhan", { p_halaman: halaman, p_format: format, p_jumlah: jumlah })
      .then(() => {}, () => {});
  } catch {
    /* ignore */
  }
}