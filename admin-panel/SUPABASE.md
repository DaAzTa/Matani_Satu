# Supabase setup — Kelurahan Matani Satu

The website text stays in Indonesian. This guide is in English for you.

## What is in this project

| Part | Folder | Technology | Needs a build? |
|---|---|---|---|
| Front page (public website) | project root (`index.html`, `js/`, `css/`) | React + Tailwind from CDN | No |
| Admin panel (login + population table) | `admin-panel/` | React + Vite + **Firebase** | Yes (`npm run build`) |

Files added for Supabase (nothing existing was removed):
- `admin-panel/supabase/schema.sql` — creates tables, security rules, public statistics function
- `admin-panel/src/supabase.js` — Supabase connection for the admin panel (Vite)
- `admin-panel/scripts/import-excel-supabase.mjs` — imports the Excel sheet "UMUM"
- `admin-panel/.env.example` — new Supabase variables appended at the bottom
- `js/supabase-config.js` — optional connection for the front page (not loaded by default)

## Step 1 — Create the Supabase project
1. Go to https://supabase.com, sign in, click **New project**.
2. Choose a region near Indonesia (Singapore). Save the database password.
3. Wait until the project is ready.

## Step 2 — Create the tables
1. Open **SQL Editor → New query**.
2. Paste the whole content of `admin-panel/supabase/schema.sql`, click **Run**.
3. You get: table `penduduk` (residents), table `admins`, Row Level Security, and function `statistik_publik()`.

Security model: only logged-in admins can read or change `penduduk` (it contains NIK and names). The public can only call `statistik_publik()`, which returns counts only.

## Step 3 — Get your keys
**Project Settings → API**:
- **Project URL**
- **anon / publishable key** — safe to use in the browser
- **service_role key** — SECRET. Only for the import script on your own computer. Never in front-end code, never on GitHub.

## Step 4 — Create an admin account
1. **Authentication → Users → Add user** (email + password).
2. In the SQL Editor run (change the email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict do nothing;
   ```

## Step 5 — Import the Excel data
```bash
cd admin-panel
npm install
cp .env.example .env.local      # then fill the 4 Supabase values
npm run import:supabase -- "C:/path/MATANI SATU data kK REV.xls" --dry-run   # check only
npm run import:supabase -- "C:/path/MATANI SATU data kK REV.xls"             # real import
```
Safe to re-run: NIK is the key, so no duplicates. The dry run on your file found 2,041 people and 4 odd rows (Excel rows 283, 993, 996, 1633). They are imported and flagged `perlu_verifikasi = true`.

## Step 6 — Connect to the website

### Option A — Front page (static, no build)
Use this to show Supabase data (for example population statistics) on the public front page.
1. Fill `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/supabase-config.js`.
2. In `index.html`, add these two lines **before** the `js/icons.js` script tag:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="js/supabase-config.js"></script>
   ```
3. In any component you can now call:
   ```js
   const { data } = await supabaseClient.rpc("statistik_publik");
   // data = { total, laki_laki, perempuan, kepala_keluarga, per_lingkungan: {...} }
   ```
   Always check `if (!supabaseClient) return;` so the page still works without Supabase.

### Option B — Admin panel (Vite)
`src/supabase.js` is ready. Import it where you need it:
```js
import { supabase } from "./supabase";
await supabase.auth.signInWithPassword({ email, password });        // login
const { data } = await supabase.from("penduduk").select("*").range(0, 49); // admin only
const { data: stats } = await supabase.rpc("statistik_publik");     // public
```
**Important:** the admin panel code today still uses Firebase (`src/firebase.js`, `AuthContext.jsx`, `pendudukService.js`, `statistikService.js`). Supabase is prepared (database, security, import, connection), but those files have not been switched yet. Until they are, the admin panel still needs the Firebase project. Switching is a separate step (replace those 4 files with Supabase calls).

## Run locally on port 8080 (no GitHub needed)
Front page:
```bash
node server.js 8080          # or: npm run start:8080
# open http://localhost:8080
```
Alternative: `python -m http.server 8080`. Internet is needed because React, Tailwind and fonts load from a CDN. Opening `index.html` by double-click does not work; use the server.

Admin panel (it uses its own port, so it does not clash with 8080):
```bash
cd admin-panel && npm install && npm run dev      # http://localhost:5173
```
To use 8080 for the admin panel instead, change `port: 5173` to `port: 8080` in `admin-panel/vite.config.js` and do not run the front page server at the same time.

## Deployment (for your client)
- **Front page:** plain static files. It can go on GitHub Pages, Netlify, Cloudflare Pages, or any web hosting. **Firebase is not required.** Upload the project root (without `admin-panel/`, `.git/`, `node_modules/`).
- **Admin panel:** `npm run build` creates `admin-panel/dist/`, also static, so it can go on the same kinds of hosts. It uses `BrowserRouter`, so the host must send all paths to `index.html` (Netlify/Cloudflare/Firebase can do this; GitHub Pages needs a `404.html` copy of `index.html` or `HashRouter`).
- Firebase Hosting is only one option. The current admin panel still needs Firebase Auth/Firestore until it is moved to Supabase.
- In Supabase **Authentication → URL Configuration**, add the final website address.
- Never commit `.env.local` (already in `.gitignore`).
