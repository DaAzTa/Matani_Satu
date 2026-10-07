/* js/supabase-config.js
   OPTIONAL. Not loaded by index.html until you add the two <script> tags
   described in admin-panel/SUPABASE.md (section "Option A").
   Only the PUBLIC anon key goes here. NEVER put the service_role key in this file. */

const SUPABASE_URL = "";       // e.g. "https://abcdxyz.supabase.co"
const SUPABASE_ANON_KEY = "";  // anon / publishable key

// null when not configured, so the website keeps working without Supabase.
const supabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
