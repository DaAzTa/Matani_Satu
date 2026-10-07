// src/firebase.js
// Inisialisasi Firebase App, Authentication, dan Firestore.
// Konfigurasi dibaca dari .env.local (lihat .env.example) agar kunci
// tidak tertanam langsung di kode sumber / repo Git.
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Bila .env.local belum diisi, Firebase TIDAK diinisialisasi (agar aplikasi tidak
// crash / layar putih). Halaman profil tetap tampil; login menampilkan peringatan.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isFirebaseConfigured) {
  console.warn(
    "[firebase] Konfigurasi kosong. Salin .env.example menjadi .env.local, isi nilainya, lalu jalankan ulang `npm run dev`."
  );
}

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
// Sesi disimpan di IndexedDB browser → admin tetap login setelah refresh / tab ditutup.
// (browserLocalPersistence adalah default di web, ditulis eksplisit agar jelas.)
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) =>
    console.error("[firebase] Gagal mengatur persistence:", err)
  );
}

export const db = app ? getFirestore(app) : null;

// Nama koleksi dipusatkan di sini supaya tidak salah ketik di banyak file.
export const COLLECTIONS = {
  PENDUDUK: "penduduk",
  STATISTIK: "statistik",
  ADMINS: "admins",
};
