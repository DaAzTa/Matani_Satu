// src/pages/admin/DataKependudukan.jsx
// Tabel daftar penduduk + CRUD (tambah, lihat, ubah, hapus) ke Firestore.
//
// State management:
//   • data/loading/error      → daftar penduduk dari getDocs
//   • search/filter/page      → penyaringan & paginasi di sisi klien
//   • formState (useReducer)  → modal form tambah/edit: mode, nilai, error, status simpan
//   • deleteTarget            → dialog konfirmasi hapus
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle, ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Trash2, Users,
} from "lucide-react";
import Modal from "../../components/Modal";

import ExportButtons from "../../components/ExportButtons";
import { unduhPenduduk } from "../../utils/exportData";

import {
  getAllPenduduk, addPenduduk, updatePenduduk, deletePenduduk,
} from "../../services/pendudukService";
import { publikasikanRingkasan } from "../../services/statistikService";
import {
  AGAMA, EMPTY_FORM, HUBUNGAN, LINGKUNGAN,
  formatAngka, formatTanggal, hitungUmur, normalizePenduduk, todayISO, validatePenduduk,
} from "../../utils/penduduk";

const PAGE_SIZE = 15;

/* ------------------------------------------------------------------ */
/* State form modal (useReducer)                                       */
/* ------------------------------------------------------------------ */
const initialFormState = {
  open: false,
  mode: "create", // "create" | "edit"
  editingId: null,
  values: EMPTY_FORM,
  errors: {},
  saving: false,
  serverError: "",
};

function formReducer(state, action) {
  switch (action.type) {
    case "OPEN_CREATE":
      return { ...initialFormState, open: true };
    case "OPEN_EDIT": {
      const { id, ...rest } = action.payload;
      // Ambil hanya field yang ada di form, isi "" bila kosong
      const values = Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, rest[k] ?? ""]));
      return { ...initialFormState, open: true, mode: "edit", editingId: id, values };
    }
    case "CHANGE": {
      const { name, value } = action;
      const errors = { ...state.errors };
      delete errors[name]; // hapus pesan error saat field diperbaiki
      return { ...state, values: { ...state.values, [name]: value }, errors };
    }
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SUBMIT":
      return { ...state, saving: true, serverError: "" };
    case "SUBMIT_FAIL":
      return { ...state, saving: false, serverError: action.message };
    case "CLOSE":
      return initialFormState;
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Halaman                                                              */
/* ------------------------------------------------------------------ */
export default function DataKependudukan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [fLingkungan, setFLingkungan] = useState("");
  const [fJk, setFJk] = useState("");
  const hanyaVerifikasi = searchParams.get("filter") === "verifikasi";
  const [page, setPage] = useState(1);

  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Statistik publik diperbarui di latar belakang setelah data berubah.
  const syncStatistik = () => publikasikanRingkasan().catch((e) => console.warn("Sinkron statistik gagal:", e));

  /* ---------- READ ---------- */
  const muatData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setData(await getAllPenduduk());
    } catch (e) {
      console.error(e);
      setLoadError("Gagal memuat data penduduk. Pastikan Anda login sebagai admin dan koneksi stabil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  /* ---------- Filter, cari, paginasi (sisi klien) ---------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (hanyaVerifikasi && !p.perluVerifikasi) return false;
      if (fLingkungan && p.lingkungan !== fLingkungan) return false;
      if (fJk && p.jenisKelamin !== fJk) return false;
      if (!q) return true;
      return p.nama?.toLowerCase().includes(q) || p.nik?.includes(q) || p.noKk?.includes(q);
    });
  }, [data, search, fLingkungan, fJk, hanyaVerifikasi]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => setPage(1), [search, fLingkungan, fJk, hanyaVerifikasi]);

  /* ---------- CREATE & UPDATE ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePenduduk(form.values);
    if (Object.keys(errors).length) {
      dispatch({ type: "SET_ERRORS", errors });
      return;
    }
    dispatch({ type: "SUBMIT" });
    const payload = normalizePenduduk(form.values);
    try {
      if (form.mode === "create") {
        const created = await addPenduduk(payload);
        setData((prev) => [...prev, created].sort((a, b) => a.nama.localeCompare(b.nama)));
        showToast(`${created.nama} berhasil ditambahkan.`);
      } else {
        const updated = await updatePenduduk(form.editingId, payload);
        setData((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        showToast(`Data ${updated.nama} berhasil diperbarui.`);
      }
      dispatch({ type: "CLOSE" });
      syncStatistik();
    } catch (err) {
      console.error(err);
      const msg = err.code === "permission-denied"
        ? "Akses ditolak oleh aturan keamanan Firestore."
        : err.message || "Gagal menyimpan data.";
      dispatch({ type: "SUBMIT_FAIL", message: msg });
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePenduduk(deleteTarget.id);
      setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`Data ${deleteTarget.nama} dihapus.`);
      setDeleteTarget(null);
      syncStatistik();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus data.", "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-5">
      {/* Header halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Daftar Penduduk</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {loading ? "Memuat…" : `${formatAngka(filtered.length)} dari ${formatAngka(data.length)} warga ditampilkan`}
          </p>
        </div>
        <div className="flex gap-2">
            <ExportButtons disabled={loading || filtered.length === 0}
            onDownload={(format) => unduhPenduduk(format, filtered, { cari: search, lingkungan: fLingkungan, jk: fJk, verifikasi: hanyaVerifikasi })} />
          <button className="btn-ghost" onClick={muatData} disabled={loading} aria-label="Muat ulang">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary" onClick={() => dispatch({ type: "OPEN_CREATE" })}>
            <Plus className="h-4 w-4" /> Tambah Warga
          </button>
        </div>
      </div>

      {/* Toolbar pencarian & filter */}
      <div className="card p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input className="input pl-9" placeholder="Cari nama, NIK, atau No. KK…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input md:w-48" value={fLingkungan} onChange={(e) => setFLingkungan(e.target.value)}>
          <option value="">Semua lingkungan</option>
          {LINGKUNGAN.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="input md:w-40" value={fJk} onChange={(e) => setFJk(e.target.value)}>
          <option value="">Semua gender</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </div>

      {hanyaVerifikasi && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-500/10 border border-amber-400/50 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Menampilkan data yang perlu diverifikasi.</span>
          <button className="font-semibold text-[var(--primary)]" onClick={() => setSearchParams({})}>Tampilkan semua</button>
        </div>
      )}

      {loadError && <div className="rounded-lg bg-red-500/10 text-[var(--danger)] text-sm px-4 py-3">{loadError}</div>}

      {/* Tabel (desktop) */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-alt)] text-[var(--text-muted)] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-4 py-3">NIK</th>
                <th className="text-left font-semibold px-4 py-3">Nama Lengkap</th>
                <th className="text-left font-semibold px-4 py-3">Tempat / Tgl Lahir</th>
                <th className="text-left font-semibold px-4 py-3">JK</th>
                <th className="text-left font-semibold px-4 py-3">Alamat</th>
                <th className="text-right font-semibold px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-5" /></td></tr>
                ))}
              {!loading && rows.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-alt)]/60">
                  <td className="px-4 py-3 font-mono text-xs tabular-nums whitespace-nowrap">{p.nik}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-2">
                      {p.nama || <span className="text-[var(--text-muted)] italic">(kosong)</span>}
                      {p.perluVerifikasi && <span className="badge bg-amber-500/15 text-amber-700 dark:text-amber-300">Cek</span>}
                    </div>
                    {p.hubungan && <div className="text-xs text-[var(--text-muted)]">{p.hubungan}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.tempatLahir || "—"}, {formatTanggal(p.tanggalLahir)}
                    {p.tanggalLahir && <div className="text-xs text-[var(--text-muted)]">{hitungUmur(p.tanggalLahir)} tahun</div>}
                  </td>
                  <td className="px-4 py-3"><JkBadge jk={p.jenisKelamin} /></td>
                  <td className="px-4 py-3 max-w-[260px]"><span className="line-clamp-2">{p.alamat || "—"}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="icon-btn" title="Ubah" aria-label={`Ubah ${p.nama}`}
                        onClick={() => dispatch({ type: "OPEN_EDIT", payload: p })}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="icon-btn hover:!text-[var(--danger)]" title="Hapus" aria-label={`Hapus ${p.nama}`}
                        onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <EmptyState hasData={data.length > 0} />}
      </div>

      {/* Kartu (mobile) */}
      <div className="md:hidden space-y-3">
        {loading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        {!loading && rows.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.nama || "(kosong)"}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{p.nik}</p>
              </div>
              <JkBadge jk={p.jenisKelamin} />
            </div>
            <p className="text-sm mt-2">{p.tempatLahir || "—"}, {formatTanggal(p.tanggalLahir)}</p>
            <p className="text-sm text-[var(--text-muted)]">{p.alamat}</p>
            <div className="flex gap-2 mt-3">
              <button className="btn-ghost h-9 flex-1" onClick={() => dispatch({ type: "OPEN_EDIT", payload: p })}>
                <Pencil className="h-4 w-4" /> Ubah
              </button>
              <button className="btn-ghost h-9 flex-1 text-[var(--danger)]" onClick={() => setDeleteTarget(p)}>
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && <div className="card"><EmptyState hasData={data.length > 0} /></div>}
      </div>

      {/* Paginasi */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">Halaman <span translate="no">{currentPage}</span> dari <span translate="no">{totalPages}</span></span>
          <div className="flex gap-2">
            <button className="btn-ghost h-9 px-3" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </button>
            <button className="btn-ghost h-9 px-3" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              Berikutnya <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal form tambah / edit */}
      <Modal
        open={form.open}
        title={form.mode === "create" ? "Tambah Data Warga" : "Ubah Data Warga"}
        onClose={() => !form.saving && dispatch({ type: "CLOSE" })}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => dispatch({ type: "CLOSE" })} disabled={form.saving}>Batal</button>
            <button type="submit" form="form-penduduk" className="btn-primary" disabled={form.saving}>
              {form.saving ? "Menyimpan…" : form.mode === "create" ? "Simpan" : "Simpan Perubahan"}
            </button>
          </>
        }
      >
        <PendudukForm form={form} dispatch={dispatch} onSubmit={handleSubmit} />
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <Modal open={!!deleteTarget} title="Hapus data warga?" size="max-w-md"
        onClose={() => !deleting && setDeleteTarget(null)}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Batal</button>
            <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus…" : "Ya, hapus"}
            </button>
          </>
        }>
        <p className="text-sm text-[var(--text-muted)]">
          Data <b className="text-[var(--text)]">{deleteTarget?.nama}</b> (NIK {deleteTarget?.nik}) akan dihapus permanen
          dan tidak dapat dikembalikan.
        </p>
      </Modal>

      {/* Toast */}
      {toast && (
        <div role="status"
          className={`fixed bottom-5 right-5 left-5 sm:left-auto z-[60] rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"
          }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-komponen                                                         */
/* ------------------------------------------------------------------ */
function PendudukForm({ form, dispatch, onSubmit }) {
  const { values, errors } = form;
  const onChange = (e) => {
    let { name, value } = e.target;
    if (name === "nik" || name === "noKk") value = value.replace(/\D/g, "").slice(0, 16);
    dispatch({ type: "CHANGE", name, value });
  };

  const Field = ({ name, label, required, children, className = "" }) => (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-[var(--danger)]">*</span>}
      </label>
      {children}
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );
  const inputProps = (name) => ({
    id: name, name, value: values[name], onChange, className: "input", "aria-invalid": !!errors[name],
  });

  return (
    <form id="form-penduduk" onSubmit={onSubmit} noValidate className="space-y-5">
      {form.serverError && (
        <div role="alert" className="rounded-lg bg-red-500/10 text-[var(--danger)] text-sm px-3 py-2.5">{form.serverError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Field({ name: "nik", label: "NIK", required: true, className: "sm:col-span-2", children: (
          <input {...inputProps("nik")} inputMode="numeric" placeholder="16 digit" className="input font-mono" />
        ) })}
        {Field({ name: "nama", label: "Nama Lengkap", required: true, className: "sm:col-span-2", children: (
          <input {...inputProps("nama")} placeholder="Sesuai KTP" />
        ) })}
        {Field({ name: "tempatLahir", label: "Tempat Lahir", required: true, children: (
          <input {...inputProps("tempatLahir")} placeholder="mis. Tomohon" />
        ) })}
        {Field({ name: "tanggalLahir", label: "Tanggal Lahir", required: true, children: (
          <input {...inputProps("tanggalLahir")} type="date" max={todayISO()} />
        ) })}
        {Field({ name: "jenisKelamin", label: "Jenis Kelamin", required: true, className: "sm:col-span-2", children: (
          <div className="grid grid-cols-2 gap-2">
            {[["L", "Laki-laki"], ["P", "Perempuan"]].map(([v, l]) => (
              <label key={v}
                className={`flex items-center gap-2 h-10 px-3 rounded-lg border cursor-pointer text-sm ${
                  values.jenisKelamin === v ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)]"
                }`}>
                <input type="radio" name="jenisKelamin" value={v} checked={values.jenisKelamin === v} onChange={onChange}
                  className="accent-[var(--primary)]" />
                {l}
              </label>
            ))}
          </div>
        ) })}
        {Field({ name: "alamat", label: "Alamat", required: true, className: "sm:col-span-2", children: (
          <textarea {...inputProps("alamat")} rows={2} className="input h-auto py-2"
            placeholder="mis. Lingkungan II, Kel. Matani Satu, Kec. Tomohon Tengah" />
        ) })}
      </div>

      <details className="rounded-xl border border-[var(--border)] px-4 py-3" open={form.mode === "edit"}>
        <summary className="text-sm font-semibold cursor-pointer select-none">Data tambahan (opsional)</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {Field({ name: "lingkungan", label: "Lingkungan", children: (
            <select {...inputProps("lingkungan")}>
              <option value="">— Pilih —</option>
              {LINGKUNGAN.map((l) => <option key={l}>{l}</option>)}
            </select>
          ) })}
          {Field({ name: "noKk", label: "No. KK", children: (
            <input {...inputProps("noKk")} inputMode="numeric" className="input font-mono" placeholder="16 digit" />
          ) })}
          {Field({ name: "hubungan", label: "Hubungan dalam Keluarga", children: (
            <select {...inputProps("hubungan")}>
              <option value="">— Pilih —</option>
              {HUBUNGAN.map((h) => <option key={h}>{h}</option>)}
            </select>
          ) })}
          {Field({ name: "agama", label: "Agama", children: (
            <select {...inputProps("agama")}>
              <option value="">— Pilih —</option>
              {AGAMA.map((a) => <option key={a}>{a}</option>)}
            </select>
          ) })}
          {Field({ name: "pekerjaan", label: "Pekerjaan", className: "sm:col-span-2", children: (
            <input {...inputProps("pekerjaan")} placeholder="mis. Wiraswasta" />
          ) })}
        </div>
      </details>
    </form>
  );
}

function JkBadge({ jk }) {
  if (jk === "L") return <span className="badge bg-sky-500/15 text-sky-700 dark:text-sky-300">L</span>;
  if (jk === "P") return <span className="badge bg-rose-500/15 text-rose-700 dark:text-rose-300">P</span>;
  return <span className="badge bg-amber-500/15 text-amber-700">?</span>;
}

function EmptyState({ hasData }) {
  return (
    <div className="py-14 text-center text-[var(--text-muted)]">
      <Users className="h-10 w-10 mx-auto opacity-40" />
      <p className="mt-3 font-medium">{hasData ? "Tidak ada data yang cocok." : "Belum ada data penduduk."}</p>
      <p className="text-sm">{hasData ? "Ubah kata kunci atau filter." : "Tambahkan warga atau jalankan skrip impor Excel."}</p>
    </div>
  );
}
