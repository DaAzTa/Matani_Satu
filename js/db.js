/* js/db.js
   Koneksi ke Supabase untuk galeri foto dan kalender kegiatan.
   Memakai alamat dan kunci dari js/live-data.js bila file itu dipakai.
   Jika TIDAK memakai live-data.js, isi dua baris di bawah (hanya kunci anon / publishable,
   JANGAN kunci service_role). Jika kosong, website memakai data bawaan di data.js. */

const DB_URL_MANUAL = "";   // contoh: "https://xxxx.supabase.co"
const DB_KEY_MANUAL = "";   // anon / publishable key

const dbClient = (() => {
  const url = DB_URL_MANUAL || (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");
  const key = DB_KEY_MANUAL || (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");
  return url && key && window.supabase ? window.supabase.createClient(url, key) : null;
})();