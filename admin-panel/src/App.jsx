// src/App.jsx — peta rute aplikasi.
//
//   /                  → Profil Kelurahan (PUBLIK, halaman pertama yang dilihat)
//   /login             → Login admin
//   /admin             → Dashboard admin        ┐ dibungkus ProtectedRoute
//   /admin/penduduk    → Data Kependudukan CRUD ┘ + AdminLayout
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import FullPageLoader from "./components/FullPageLoader";
import ProfilKelurahan from "./pages/ProfilKelurahan";
import Login from "./pages/Login";

// Halaman admin dimuat terpisah (code-splitting): pengunjung publik tidak ikut mengunduhnya.
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const DataKependudukan = lazy(() => import("./pages/admin/DataKependudukan"));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
    <Routes>
      <Route path="/" element={<ProfilKelurahan />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="penduduk" element={<DataKependudukan />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
