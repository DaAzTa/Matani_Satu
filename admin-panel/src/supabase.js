// src/supabase.js
// Supabase connection for the admin panel. Uses only the PUBLIC anon key.
// NEVER put the service_role key here.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// false when .env.local is empty or still has the example values
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("xxxxxxxx"));

if (!isSupabaseConfigured) {
  console.warn("[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set in .env.local");
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;