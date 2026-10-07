// src/layouts/AdminLayout.jsx
// Kerangka halaman admin: Sidebar (Dashboard, Data Penduduk, Logout) + Topbar.
// Halaman anak dirender lewat <Outlet />. Di layar kecil sidebar menjadi drawer.
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const MENU = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/penduduk", label: "Data Penduduk", icon: Users },
];

const JUDUL = {
  "/admin": "Dashboard",
  "/admin/penduduk": "Data Kependudukan",
};

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Tutup drawer setiap pindah halaman
  useEffect(() => setDrawerOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const inisial = (user?.email || "A").charAt(0).toUpperCase();

  const Sidebar = (
    <div className="flex h-full flex-col bg-[var(--primary-deep)] text-white">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <span className="h-9 w-9 rounded-lg bg-white/15 grid place-items-center font-display font-bold">M</span>
        <div className="leading-tight">
          <p className="text-[10px] tracking-widest text-white/60">ADMIN KELURAHAN</p>
          <p className="font-display font-semibold">Matani Satu</p>
        </div>
        <button className="ml-auto lg:hidden icon-btn text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-white/45">MENU</p>
        {MENU.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-white text-[var(--primary-deep)]" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}>
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> Lihat situs publik
        </a>
        <button onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-200 hover:bg-rose-500/20 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">{Sidebar}</aside>

      {/* Drawer mobile */}
      <div className={`lg:hidden fixed inset-0 z-40 transition ${drawerOpen ? "visible" : "invisible"}`}>
        <div onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 w-72 transition-transform ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {Sidebar}
        </aside>
      </div>

      {/* Topbar */}
      <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
        <button className="lg:hidden icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold truncate">{JUDUL[pathname] ?? "Admin"}</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-medium truncate max-w-[220px]">{user?.email}</p>
            <p className="text-xs text-[var(--text-muted)]">{role === "govt" ? "Pemerintah Kelurahan" : "Administrator"}</p>
          </div>
          <span className="h-9 w-9 rounded-full grid place-items-center bg-[var(--primary)] text-white text-sm font-semibold">
            {inisial}
          </span>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
        <Outlet />
      </main>

      <Modal open={confirmLogout} title="Keluar dari admin?" onClose={() => setConfirmLogout(false)} size="max-w-sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirmLogout(false)}>Batal</button>
            <button className="btn-danger" onClick={handleLogout}>Logout</button>
          </>
        }>
        <p className="text-sm text-[var(--text-muted)]">Sesi Anda akan diakhiri di perangkat ini.</p>
      </Modal>
    </div>
  );
}
