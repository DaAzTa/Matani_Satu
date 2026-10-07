# Admin Panel Kependudukan — Kelurahan Matani Satu

React 19 + Vite + Tailwind CSS v4 + Firebase (Auth & Firestore).

| Rute | Akses | Isi |
|---|---|---|
| `/` | **Publik** (halaman pertama) | Profil kelurahan + statistik agregat (tanpa NIK/nama) |
| `/login` | Publik | Login admin (Email & Password) |
| `/admin` | **Admin** | Dashboard ringkasan kependudukan |
| `/admin/penduduk` | **Admin** | Tabel penduduk + CRUD |

## Struktur folder

```
admin-panel/
├── .env.example              # template konfigurasi Firebase → salin ke .env.local
├── firebase.json             # Hosting (SPA rewrite) + Firestore rules
├── firestore.rules           # aturan keamanan (penduduk hanya untuk admin)
├── index.html
├── vite.config.js
├── scripts/
│   ├── import-excel.mjs      # impor sheet "UMUM" dari Excel → koleksi penduduk
│   └── set-admin.mjs         # daftarkan email sebagai admin (admins/{uid})
└── src/
    ├── main.jsx              # BrowserRouter + AuthProvider
    ├── App.jsx               # definisi rute
    ├── firebase.js           # inisialisasi Auth & Firestore
    ├── index.css             # token warna + utilitas (btn, input, card…)
    ├── context/AuthContext.jsx       # status login global (onAuthStateChanged)
    ├── components/
    │   ├── ProtectedRoute.jsx        # penjaga rute /admin
    │   ├── Modal.jsx, StatCard.jsx, BarList.jsx, FullPageLoader.jsx
    ├── layouts/AdminLayout.jsx       # sidebar + topbar
    ├── pages/
    │   ├── ProfilKelurahan.jsx       # halaman publik
    │   ├── Login.jsx
    │   └── admin/Dashboard.jsx, admin/DataKependudukan.jsx
    ├── services/
    │   ├── pendudukService.js        # addDoc / getDocs / updateDoc / deleteDoc
    │   └── statistikService.js       # count() agregat + statistik publik
    ├── data/profil.js                # teks profil statis
    └── utils/penduduk.js             # konstanta, validasi, format
```

## Menjalankan

1. **Buat project Firebase** → aktifkan *Authentication › Email/Password* dan *Firestore Database*.
2. Tambahkan *Web app*, salin konfigurasinya ke `.env.local` (lihat `.env.example`).
3. `npm install` lalu `npm run dev` → http://localhost:5173
4. **Pasang aturan keamanan**: salin isi `firestore.rules` ke *Firestore › Rules* (atau `firebase deploy --only firestore:rules`).
5. **Buat akun admin**: *Authentication › Users › Add user*. Matikan pendaftaran publik bila tidak dipakai.
6. **Daftarkan sebagai admin**: unduh *Service account key* (Project settings › Service accounts) sebagai `serviceAccountKey.json` di folder ini, lalu
   ```bash
   npm run set:admin -- admin@contoh.id
   ```
   (Atau buat manual dokumen `admins/<UID>` di Firestore Console.)
7. **Impor data Excel** (file Excel *jangan* ditaruh di repo):
   ```bash
   npm run import:excel -- "D:/data/MATANI SATU data kK REV.xls" --dry-run   # cek dulu
   npm run import:excel -- "D:/data/MATANI SATU data kK REV.xls"
   ```
   Baris yang tidak lengkap tetap diimpor dengan tanda **Cek** (`perluVerifikasi: true`) dan muncul sebagai peringatan di Dashboard.
8. Deploy: `npm run build` lalu `firebase deploy`.

> `xlsx` dari npm (0.18.5) hanya dipakai skrip impor lokal. Versi terbaru SheetJS tersedia via
> `npm i -D https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.

## Alur autentikasi & sesi setelah refresh

1. `firebase.js` memakai `browserLocalPersistence` → setelah login, Firebase menyimpan sesi (refresh token) di IndexedDB browser.
2. Saat halaman di-refresh, React mulai dari nol, tapi `AuthProvider` langsung memasang `onAuthStateChanged`. Firebase membaca sesi tersimpan, memperbarui ID token bila kedaluwarsa, lalu memanggil callback dengan `user` (atau `null`).
3. Selama proses itu `loading = true`. `ProtectedRoute` menampilkan loader dan **tidak** me-redirect — inilah yang mencegah admin "terlempar" ke /login setiap refresh.
4. Setelah `user` ada, `AuthContext` mengecek dokumen `admins/{uid}`. Hanya bila ada, `isAdmin = true` dan halaman /admin dirender.
5. Logout memanggil `signOut()` → sesi di IndexedDB dihapus, listener memberi `user = null`, rute admin kembali terkunci.
6. Keamanan sebenarnya ada di `firestore.rules`: walau seseorang memodifikasi kode front-end, Firestore menolak baca/tulis `penduduk` dari akun yang tidak ada di `admins`.
