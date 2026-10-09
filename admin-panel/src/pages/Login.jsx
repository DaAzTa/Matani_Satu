// src/pages/Login.jsx
// Form login admin (Firebase Auth — Email & Password).
// Halaman ini TIDAK tampil di awal: pengunjung masuk ke profil kelurahan (/),
// dan baru diarahkan ke sini saat membuka area /admin tanpa sesi yang sah.
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "../components/FullPageLoader";
import { isSupabaseConfigured as isFirebaseConfigured } from "../supabase";
import Logo from "../components/Logo";

const PESAN_ERROR = {
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/user-disabled": "Akun ini telah dinonaktifkan.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  "auth/network-request-failed": "Tidak ada koneksi internet.",
  "app/not-admin": "Akun ini tidak terdaftar sebagai admin kelurahan.",
  "app/not-configured": "Firebase belum dikonfigurasi. Isi file .env.local terlebih dahulu.",
};

export default function Login() {
  const { user, isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tujuan = location.state?.from?.pathname || "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <FullPageLoader label="Memeriksa sesi…" />;
  // Sudah login sebagai admin? Langsung ke dashboard.
  if (user && isAdmin) return <Navigate to={tujuan} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(PESAN_ERROR[err.code] || "Gagal masuk. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri: identitas */}
      <aside className="hidden lg:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-deep)]">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Kembali ke profil kelurahan
        </Link>
        <div>
          <Logo size={88} className="mb-6 shadow-lg" />
          <p className="text-xs tracking-[0.2em] uppercase text-white/70">Sistem Informasi Kependudukan</p>
          <h1 className="font-display text-5xl font-semibold mt-3 leading-tight">
            Kelurahan
            <br />
            Matani Satu
          </h1>
          <p className="mt-4 text-white/75 max-w-sm">
            Area khusus perangkat kelurahan untuk mengelola data penduduk secara aman.
          </p>
        </div>
        <p className="text-xs text-white/60">Kec. Tomohon Tengah · Kota Tomohon · Sulawesi Utara</p>
      </aside>

      {/* Panel kanan: form */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          
          
          <Logo size={56} className="lg:hidden mb-4 border border-[var(--border)]" />
          <span className="h-12 w-12 rounded-xl grid place-items-center bg-[var(--primary-soft)] text-[var(--primary)]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-bold mt-5">Masuk Admin</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Gunakan akun yang diberikan pengelola sistem.</p>

          {!isFirebaseConfigured && (
            <div className="mt-6 rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 py-2.5 text-sm">
              <b>Firebase belum dikonfigurasi.</b> Salin <code>.env.example</code> menjadi <code>.env.local</code>,
              isi dengan konfigurasi project Firebase, lalu jalankan ulang <code>npm run dev</code>.
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6 rounded-lg border border-red-300/60 bg-red-500/10 px-3 py-2.5 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input id="email" name="email" type="email" autoComplete="username" required
                  value={form.email} onChange={onChange} className="input pl-9" placeholder="admin@matanisatu.id" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">Kata sandi</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input id="password" name="password" type={showPass ? "text" : "password"}
                  autoComplete="current-password" required value={form.password} onChange={onChange}
                  className="input pl-9 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 icon-btn h-8 w-8"
                  aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting || !form.email || !form.password} className="btn-primary w-full h-11">
              {submitting ? "Memproses…" : "Masuk"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
