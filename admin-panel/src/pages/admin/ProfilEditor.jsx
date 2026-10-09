// src/pages/admin/ProfilEditor.jsx
// Admin page (/admin/profil): edit the profile sections. Every save is written
// to the Supabase table profil_kelurahan and shows up on the public page.
import { useEffect, useState } from "react";
import { AlertTriangle, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { getProfilSections, saveProfilSection } from "../../services/profilService";
import * as P from "../../utils/profil";

const AREA =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none " +
  "focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)]";

const tanggalJam = (iso) =>
  iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function pesan(e) {
  if (e?.code === "PGRST116" || e?.code === "42501") return "Tidak punya izin untuk menyimpan.";
  return "Gagal menyimpan. Periksa koneksi lalu coba lagi.";
}

export default function ProfilEditor() {
  const [sections, setSections] = useState(null); // null = loading
  const [gagal, setGagal] = useState(false);
  const [aktif, setAktif] = useState(0);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const section = sections?.[aktif];
  const dirty = !!section && !!draft && JSON.stringify(draft) !== JSON.stringify(section.isi);

  useEffect(() => {
    let batal = false;
    getProfilSections()
      .then((rows) => { if (!batal) { setSections(rows); setDraft(rows[0]?.isi ?? null); } })
      .catch(() => { if (!batal) { setGagal(true); setSections([]); } });
    return () => { batal = true; };
  }, []);

  // warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const pilih = (i) => {
    if (i === aktif) return;
    if (dirty && !window.confirm("Perubahan belum disimpan. Pindah bagian dan buang perubahan?")) return;
    setAktif(i);
    setDraft(sections[i].isi);
  };

  const simpan = async () => {
    setSaving(true);
    try {
      const baru = await saveProfilSection(section.kunci, P.bersihkan(draft));
      setSections((prev) => prev.map((s) => (s.kunci === baru.kunci ? baru : s)));
      setDraft(baru.isi);
      showToast("Profil berhasil disimpan.");
    } catch (e) {
      showToast(pesan(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const batalkan = () => setDraft(section.isi);
  const up = (fn) => setDraft((d) => fn(d));

  if (sections === null) {
    return <div className="space-y-4"><div className="skeleton h-24" /><div className="skeleton h-64" /></div>;
  }
  if (sections.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-semibold">Profil Kelurahan</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {gagal
            ? "Data profil gagal dimuat. Pastikan Anda sudah masuk dan koneksi stabil."
            : "Data profil belum ada di database. Jalankan skrip awal: npm run seed:profil (lihat panduan)."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-xl font-semibold">Profil Kelurahan</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Ubah isi profil per bagian. Setelah disimpan, perubahan langsung tampil di halaman publik.
        </p>
      </div>

      <div className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {sections.map((d, i) => (
          <button key={d.kunci} role="tab" aria-selected={i === aktif} onClick={() => pilih(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              i === aktif
                ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"}`}>
            {d.urutan}. {d.singkat}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold">{section.urutan}. {section.judul}</h3>
        {section.updated_at && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Terakhir diubah {tanggalJam(section.updated_at)}{section.updated_by ? ` oleh ${section.updated_by}` : ""}
          </p>
        )}
        <label htmlFor="intro" className="label mt-4">Pengantar bagian (opsional)</label>
        <textarea id="intro" rows={2} className={AREA} value={draft.intro ?? ""}
          onChange={(e) => up((d) => P.setIntro(d, e.target.value))} />
      </div>

      {draft.groups.map((g, gi) => (
        <div key={gi} className="space-y-3">
          {g.title !== undefined && (
            <input className="input font-semibold" value={g.title} aria-label="Judul kelompok"
              onChange={(e) => up((d) => P.setGroupTitle(d, gi, e.target.value))} />
          )}

          {g.items.map((x, ii) => (
            <div key={ii} className="card p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="label" htmlFor={`l-${gi}-${ii}`}>Judul butir</label>
                  <input id={`l-${gi}-${ii}`} className="input" value={x.l}
                    onChange={(e) => up((d) => P.setItem(d, gi, ii, { l: e.target.value }))} />
                </div>
                <button type="button" className="icon-btn mt-6" aria-label="Hapus butir"
                  onClick={() => window.confirm(`Hapus butir "${x.l || "tanpa judul"}"?`) && up((d) => P.removeItem(d, gi, ii))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {Array.isArray(x.rows) ? (
                <div className="mt-3 space-y-2">
                  <p className="label">Isi tabel</p>
                  {x.rows.map((r, ri) => (
                    <div key={ri} className="flex gap-2">
                      <input className="input flex-1" placeholder="Nama" value={r[0]} aria-label="Nama baris"
                        onChange={(e) => up((d) => P.setRow(d, gi, ii, ri, 0, e.target.value))} />
                      <input className="input flex-1" placeholder="Nilai" value={r[1]} aria-label="Nilai baris"
                        onChange={(e) => up((d) => P.setRow(d, gi, ii, ri, 1, e.target.value))} />
                      <button type="button" className="icon-btn" aria-label="Hapus baris"
                        onClick={() => up((d) => P.removeRow(d, gi, ii, ri))}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-ghost h-9" onClick={() => up((d) => P.addRow(d, gi, ii))}>
                    <Plus className="h-4 w-4" /> Tambah baris
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="label" htmlFor={`v-${gi}-${ii}`}>Isi</label>
                  <textarea id={`v-${gi}-${ii}`} rows={2} className={AREA} value={x.v ?? ""}
                    onChange={(e) => up((d) => P.setItem(d, gi, ii, { v: e.target.value }))} />
                </div>
              )}

              <div className="mt-3">
                <label className="label" htmlFor={`n-${gi}-${ii}`}>Catatan (opsional)</label>
                <input id={`n-${gi}-${ii}`} className="input" value={x.n ?? ""}
                  onChange={(e) => up((d) => P.setItem(d, gi, ii, { n: e.target.value }))} />
                {P.catatanInternal(x.n) && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Catatan ini tampak seperti catatan petugas, jadi tidak ditampilkan di halaman publik.
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => up((d) => P.addItem(d, gi, "teks"))}>
              <Plus className="h-4 w-4" /> Tambah butir teks
            </button>
            <button type="button" className="btn-ghost" onClick={() => up((d) => P.addItem(d, gi, "tabel"))}>
              <Plus className="h-4 w-4" /> Tambah butir tabel
            </button>
          </div>
        </div>
      ))}

      {/* Save bar */}
      <div className="sticky bottom-4 z-20">
        <div className="card p-3 flex items-center justify-between gap-3 shadow-lg">
          <p className="text-sm text-[var(--text-muted)]">
            {dirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" disabled={!dirty || saving} onClick={batalkan}>
              <RotateCcw className="h-4 w-4" /> Batalkan
            </button>
            <button type="button" className="btn-primary" disabled={!dirty || saving} onClick={simpan}>
              <Save className="h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div role="status"
          className={`fixed bottom-24 right-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === "error" ? "bg-[var(--danger)]" : "bg-emerald-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}