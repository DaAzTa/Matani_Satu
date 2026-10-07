// src/components/ProtectedRoute.jsx
// Penjaga rute admin:
//  1. Selama Firebase masih memulihkan sesi → tampilkan loader (jangan redirect).
//  2. Belum login / bukan admin → arahkan ke /login, simpan tujuan awal di state.
//  3. Admin sah → render halaman (<Outlet />).
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "./FullPageLoader";

export default function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader label="Memeriksa sesi…" />;

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
