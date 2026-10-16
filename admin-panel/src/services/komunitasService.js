// src/services/komunitasService.js
// Gallery (table galeri) and events calendar (table kegiatan).
// Gallery photos reuse the storage bucket of the announcements.
import { supabase } from "../supabase";
import { hapusFotoLama, unggahFoto } from "./pengumumanService";

const G = "id,judul,foto_url,tanggal,terbit,dibuat_oleh,created_at";
const K = "id,judul,deskripsi,tanggal,tanggal_selesai,waktu,lokasi,terbit,dibuat_oleh";

function galat(error) {
  if (error.code === "42501" || error.code === "PGRST116")
    return new Error("Tidak punya izin untuk tindakan ini, atau data tidak ditemukan.");
  if (error.code === "23514") return new Error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
  return new Error("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
}

/* ---------------- Gallery ---------------- */
export async function getGaleriPublik(batas = 60) {
  const { data, error } = await supabase.from("galeri").select(G).eq("terbit", true)
    .order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(batas);
  if (error) throw error;
  return data;
}
export async function getSemuaGaleri() {
  const { data, error } = await supabase.from("galeri").select(G)
    .order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(500);
  if (error) throw galat(error);
  return data;
}
/** Uploads one photo (shrunk first) and adds it to the gallery. */
export async function tambahGaleri({ file, judul, tanggal }) {
  const url = await unggahFoto(file);
  const { data, error } = await supabase.from("galeri")
    .insert({ judul: (judul || "").trim(), foto_url: url, tanggal }).select(G).single();
  if (error) { hapusFotoLama(url); throw galat(error); }
  return data;
}
export async function ubahGaleri(id, patch) {
  const { data, error } = await supabase.from("galeri").update(patch).eq("id", id).select(G).single();
  if (error) throw galat(error);
  return data;
}
export async function hapusGaleri(item) {
  const { data, error } = await supabase.from("galeri").delete().eq("id", item.id).select("id");
  if (error) throw galat(error);
  if (!data.length) throw new Error("Tidak punya izin untuk menghapus, atau data tidak ditemukan.");
  hapusFotoLama(item.foto_url);
}

/* ---------------- Events ---------------- */
const p2 = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

/** Published events from 60 days ago onward (enough for the calendar). */
export async function getKegiatanPublik() {
  const dari = new Date(); dari.setDate(dari.getDate() - 60);
  const d = iso(dari);
  const { data, error } = await supabase.from("kegiatan").select(K).eq("terbit", true)
    .or(`tanggal.gte.${d},tanggal_selesai.gte.${d}`).order("tanggal").limit(300);
  if (error) throw error;
  return data;
}
export async function getSemuaKegiatan() {
  const { data, error } = await supabase.from("kegiatan").select(K).order("tanggal", { ascending: false }).limit(500);
  if (error) throw galat(error);
  return data;
}
export async function simpanKegiatan({ id, judul, deskripsi, tanggal, tanggal_selesai, waktu, lokasi, terbit }) {
  const nilai = {
    judul: judul.trim(), deskripsi: deskripsi?.trim() || null, tanggal,
    tanggal_selesai: tanggal_selesai || null, waktu: waktu?.trim() || null, lokasi: lokasi?.trim() || null, terbit,
  };
  const q = id ? supabase.from("kegiatan").update(nilai).eq("id", id) : supabase.from("kegiatan").insert(nilai);
  const { data, error } = await q.select(K).single();
  if (error) throw galat(error);
  return data;
}
export async function hapusKegiatan(id) {
  const { data, error } = await supabase.from("kegiatan").delete().eq("id", id).select("id");
  if (error) throw galat(error);
  if (!data.length) throw new Error("Tidak punya izin untuk menghapus, atau data tidak ditemukan.");
}