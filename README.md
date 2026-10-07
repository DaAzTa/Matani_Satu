<p align="center">
  <img src="assets/logo-kkt149.png" alt="Logo KKT 149 Posko Matani Satu" width="220" />
</p>

# 🌾 Profil Kelurahan Matani Satu

Website profil **Kelurahan Matani Satu**, Kecamatan Tomohon Tengah, Kota Tomohon, Sulawesi Utara — dibangun dengan React (via CDN, tanpa build tools) dan Tailwind CSS.

## ✨ Isi Website

- **Beranda** — hero dengan video latar (opsional) atau ilustrasi
- **Profil** — deskripsi singkat, angka utama, dan batas wilayah
- **Galeri** — foto dengan lightbox (klik untuk memperbesar, ← → untuk geser, Esc untuk tutup)
- **Video** — video lokal (.mp4) atau YouTube
- **Struktur Kelurahan** — bagan Lurah → Sekretaris → Kasi/Staf → Kepala Lingkungan
- **Peta** — peta Google Maps + tombol "Buka di Google Maps"

## ▶️ Menjalankan di Localhost

**Cara termudah (Windows):** klik dua kali `start-server.bat` → browser otomatis membuka `http://localhost:8000`.

Atau lewat terminal:

```bash
node server.js          # http://localhost:8000
npm start               # sama saja
node server.js 3000     # port lain
python -m http.server 8000   # alternatif jika tidak ada Node.js
```

Server juga menampilkan alamat jaringan (mis. `http://192.168.1.5:8000`) untuk dibuka dari HP di WiFi yang sama. Membuka `index.html` langsung (file://) tidak akan jalan karena Babel harus memuat file JS lewat server. Koneksi internet tetap dibutuhkan untuk CDN React/Tailwind dan peta.

## 🖼️ Mengganti Konten

Semua konten ada di **`js/data.js`**:

| Bagian | Yang diisi | Lokasi file media |
|---|---|---|
| `PROFIL` | deskripsi, angka, batas wilayah | – |
| `GALERI` | daftar foto + judul | `assets/galeri/` |
| `HERO_VIDEO`, `VIDEOS` | video lokal (`src`) atau ID YouTube (`youtube`) | `assets/video/` |
| `STRUKTUR` | nama, jabatan, foto perangkat | `assets/struktur/` |
| `PETA` | nama tempat atau `lat`/`lng` | – |
| `KONTAK` | alamat, telepon, email | – |

File yang belum ada otomatis tampil sebagai kotak placeholder.

## 📁 Struktur Folder

```
├── index.html            # Entry point
├── server.js             # Local server (Node.js, tanpa dependency, mendukung seek video)
├── start-server.bat      # Klik dua kali untuk menjalankan di Windows
├── package.json          # npm start
├── assets/ (galeri/, video/, struktur/, logo-kkt149.png)
├── css/styles.css
└── js/
    ├── icons.js, data.js, hero-artwork.js, app.js
    └── components/ Layout, Header, Hero, Profil, Galeri, Video, Struktur, Peta, Footer
```

> ⚠️ Semua file JS berbagi scope global, jadi urutan `<script>` di `index.html` **tidak boleh diubah**.

---

Dibuat oleh KKT 149 Posko Matani Satu.
