// src/services/profilService.js
// Reads and saves the profile sections in the Supabase table profil_kelurahan.
import { supabase, isSupabaseConfigured } from "../supabase";

const KOLOM = "kunci,urutan,judul,singkat,isi,updated_at,updated_by";

/** All sections, in tab order. Public (no login needed). */
export async function getProfilSections() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("profil_kelurahan").select(KOLOM).order("urutan");
  if (error) throw error;
  return data;
}

/** Save one section (staff only). Returns the saved row. */
export async function saveProfilSection(kunci, isi) {
  const { data, error } = await supabase
    .from("profil_kelurahan").update({ isi }).eq("kunci", kunci).select(KOLOM).single();
  if (error) throw error;
  return data;
}