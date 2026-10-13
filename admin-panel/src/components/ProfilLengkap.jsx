// src/components/ProfilLengkap.jsx
// "Profil Kelurahan" block for the public page. Data comes from Supabase
// (table profil_kelurahan) and is edited in the admin page /admin/profil.
import { useEffect, useState } from "react";
import { getProfilSections } from "../services/profilService";
import { catatanPublik, itemTerisi } from "../utils/profil";

const tanggal = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

function Butir({ x }) {
  const cat = catatanPublik(x.n);
  const baris = Array.isArray(x.rows) ? x.rows.filter((r) => r[1] && String(r[1]).trim()) : null;
  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">{x.l}</p>
      {baris ? (
        <dl className="mt-2 text-sm divide-y divide-[var(--border)]">
          {baris.map(([k, v], i) => (
            <div key={i} className="flex justify-between gap-4 py-1.5">
              <dt className="text-[var(--text-muted)]">{k}</dt>
              <dd className="font-medium text-right">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
          <p className="mt-1.5 font-medium leading-snug whitespace-pre-line">{x.v}</p>
      )}
      {cat && <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{cat}</p>}
    </div>
  );
}

/** Pure display part (also easy to test): receives the sections as a list. */
export function ProfilView({ sections }) {
  const [aktif, setAktif] = useState(0);
  const s = sections[Math.min(aktif, sections.length - 1)];
  const groups = (s.isi?.groups || [])
    .map((g) => ({ ...g, items: (g.items || []).filter(itemTerisi) }))
    .filter((g) => g.items.length);
  const terbaru = sections.reduce((m, x) => (x.updated_at > m ? x.updated_at : m), "");

  return (
    <>
      <div className="no-scrollbar -mx-2 px-2 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {sections.map((d, i) => (
          <button key={d.kunci} role="tab" aria-selected={i === aktif} onClick={() => setAktif(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              i === aktif
                ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"}`}>
            {d.singkat}
          </button>
        ))}
      </div>

      <h3 className="mt-6 text-base font-semibold">{s.urutan}. {s.judul}</h3>
      {s.isi?.intro && <p className="mt-2 text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">{s.isi.intro}</p>}

      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Data bagian ini belum diisi.</p>
      ) : (
        groups.map((g, gi) => (
          <div key={gi} className="mt-5">
            {g.title && <h4 className="text-sm font-semibold text-[var(--primary-dark)] mb-3">{g.title}</h4>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {g.items.map((x, i) => <Butir key={i} x={x} />)}
            </div>
          </div>
        ))
      )}
      {terbaru && <p className="mt-6 text-xs text-[var(--text-muted)]">Profil diperbarui {tanggal(terbaru)}. Sumber awal: Profil Kelurahan Matani Satu, Desember 2024.</p>}
    </>
  );
}

export default function ProfilLengkap() {
  const [sections, setSections] = useState(undefined); // undefined = loading
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let batal = false;
    getProfilSections()
      .then((d) => !batal && setSections(d))
      .catch(() => { if (!batal) { setGagal(true); setSections([]); } });
    return () => { batal = true; };
  }, []);

  return (
    <section id="profil-lengkap" className="card p-6">
      <h2 className="font-semibold">Profil Kelurahan</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-5">
        Gambaran lengkap wilayah: identitas, kondisi fisik, penduduk, sosial budaya, ekonomi, sarana prasarana, dan program pembangunan.
      </p>
      {sections === undefined ? (
        <div className="space-y-3"><div className="skeleton h-10" /><div className="skeleton h-40" /></div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          {gagal ? "Profil belum dapat dimuat. Silakan coba lagi nanti." : "Profil kelurahan belum tersedia."}
        </p>
      ) : (
        <ProfilView sections={sections} />
      )}
    </section>
  );
}