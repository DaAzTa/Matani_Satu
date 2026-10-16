// src/services/kualitasService.js
import { supabase } from "../supabase";

/** Writes the checker's findings into the "Cek" flag. items = [{ id, alasan }] */
export async function terapkanPemeriksaan(items) {
  const { data, error } = await supabase.rpc("terapkan_pemeriksaan", { p_items: items });
  if (error) {
    if (error.code === "42501" || /izinkan/i.test(error.message)) throw new Error("Tidak punya izin untuk tindakan ini.");
    throw new Error("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
  }
  return data; // { ditandai, dibersihkan }
}