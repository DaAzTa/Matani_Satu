// src/services/pengumumanService.js
// Announcements / village news (table pengumuman + storage bucket "pengumuman").
import { supabase } from "../supabase";
import { kompresGambar } from "../utils/gambar";

const KOLOM = "id,judul,isi,foto_url,tanggal,terbit,dibuat_oleh,created_at";
const BUCKET = "pengumuman";

function galat(error) {
  if (error.code === "42501" || error.code === "PGRST116")
    return new Error("Tidak punya izin untuk tindakan ini, atau data tidak ditemukan.");
  return new Error("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
}

/** Public: published announcements only, newest first. */
export async function getPengumumanPublik(batas = 6) {
  const { data, error } = await supabase
    .from("pengumuman").select(KOLOM).eq("terbit", true)
    .order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(batas);
  if (error) throw error;
  return data;
}

/** Staff: everything, including drafts. */
export async function getSemuaPengumuman() {
  const { data, error } = await supabase
    .from("pengumuman").select(KOLOM)
    .order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  if (error) throw galat(error);
  return data;
}

/** Uploads a photo (shrunk first) and returns its public address. */
export async function unggahFoto(file) {
  const blob = await kompresGambar(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg", cacheControl: "31536000",
  });
  if (error) throw new Error("Gagal mengunggah foto. Pastikan ukuran foto wajar dan koneksi stabil.");
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function hapusBerkas(url) {
  if (!url) return;
  const path = url.split(`/${BUCKET}/`).pop();
  if (path) supabase.storage.from(BUCKET).remove([path]).then(() => {}, () => {});
}

export async function simpanPengumuman({ id, judul, isi, tanggal, terbit, foto_url }) {
  const nilai = { judul: judul.trim(), isi: isi.trim(), tanggal, terbit, foto_url: foto_url || null };
  const q = id
    ? supabase.from("pengumuman").update(nilai).eq("id", id)
    : supabase.from("pengumuman").insert(nilai);
  const { data, error } = await q.select(KOLOM).single();
  if (error) throw galat(error);
  return data;
}

export async function hapusPengumuman(item) {
  const { data, error } = await supabase.from("pengumuman").delete().eq("id", item.id).select("id");
  if (error) throw galat(error);
  if (!data.length) throw new Error("Tidak punya izin untuk menghapus, atau data tidak ditemukan.");
  hapusBerkas(item.foto_url);
}

export { hapusBerkas as hapusFotoLama };