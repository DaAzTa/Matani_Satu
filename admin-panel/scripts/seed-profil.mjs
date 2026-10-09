#!/usr/bin/env node
// scripts/seed-profil.mjs
// Loads the profile data (taken from the Word document "Profil Kelurahan 2024")
// into the Supabase table profil_kelurahan. The data is read from the front
// page file  ../js/data-profil.js  (project root).
//
//   npm run seed:profil             -> adds only sections that are not in the database yet
//   npm run seed:profil -- --force  -> OVERWRITES all sections (loses edits made in the panel)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const FORCE = process.argv.includes("--force");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const file = new URL("../../js/data-profil.js", import.meta.url);
let DATA;
try {
  DATA = new Function(readFileSync(file, "utf8") + "\nreturn DATA_PROFIL;")();
} catch (e) {
  console.error("Cannot read ../js/data-profil.js :", e.message);
  process.exit(1);
}

const KUNCI = ["identitas", "fisik", "penduduk", "sosial-budaya", "ekonomi",
  "sarana-prasarana", "kelembagaan", "potensi", "tata-ruang", "program"];

const rows = DATA.map((s, i) => ({
  kunci: KUNCI[i] ?? `bagian-${s.no}`,
  urutan: s.no,
  judul: s.judul,
  singkat: s.singkat,
  isi: {
    ...(s.intro ? { intro: s.intro } : {}),
    groups: s.groups.map((g) => ({
      ...(g.title ? { title: g.title } : {}),
      items: g.items.map((x) => (x.rows
        ? { l: x.l, rows: x.rows, n: x.n || "" }
        : { l: x.l, v: x.v ?? null, n: x.n || "" })),
    })),
  },
}));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await supabase
  .from("profil_kelurahan")
  .upsert(rows, { onConflict: "kunci", ignoreDuplicates: !FORCE });
if (error) { console.error("Failed:", error.message); process.exit(1); }
console.log(`Done: ${rows.length} sections ${FORCE ? "written (overwritten)" : "checked (existing ones kept)"}.`);