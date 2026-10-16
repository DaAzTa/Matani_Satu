// src/services/trenService.js
import { supabase } from "../supabase";

/** Births/deaths per month (last 12 months) and the age pyramid. Staff only. */
export async function getTren(lingkungan = "") {
  const { data, error } = await supabase.rpc("statistik_tren", { p_lingkungan: lingkungan || null });
  if (error) throw error;
  return data; // { bulanan: [...], piramida: [...] }
}