/* js/components/Profil.js
   Profil singkat: deskripsi, angka-angka utama, dan batas wilayah. */

const Profil = () => (
  <section id="profil" className="bg-[var(--bg)] py-16 md:py-24 scroll-mt-16">
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
        <div className="lg:col-span-3">
          <SectionHeading kicker="Profil Kelurahan" title={`Mengenal ${PROFIL.nama}`} desc={PROFIL.deskripsi} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROFIL.fakta.map((f, i) => {
              const I = ICONS[f.icon] || LayersIcon;
              return (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--red)]/10 text-[var(--red)] flex items-center justify-center shrink-0">
                    <I className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">{f.label}</p>
                    {f.value
                      ? <p className="font-display text-2xl font-semibold leading-tight mt-0.5">{f.value}</p>
                      : <p className="text-sm font-medium italic text-[var(--text-muted)] mt-1">Segera diisi</p>}
                    {f.note && <p className="text-[11px] text-[var(--text-muted)] mt-1">{f.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-[var(--red-deep)] text-white p-7 h-full relative overflow-hidden">
            <CompassIcon className="w-40 h-40 absolute -right-10 -bottom-10 text-white/5" />
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--gold)] mb-2">Batas Wilayah</p>
            <h3 className="font-display text-2xl font-semibold mb-6">Letak Matani Satu</h3>
            <ul className="space-y-3 relative">
              {PROFIL.batas.map((b, i) => (
                <li key={i} className="flex items-center gap-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <span className="w-16 text-[11px] font-semibold uppercase tracking-wide text-[var(--gold)]">{b.arah}</span>
                  <span className="text-sm text-white/90">{b.wilayah}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-white/10 text-sm text-white/75 space-y-1 relative">
              <p>Kecamatan {PROFIL.kecamatan}</p>
              <p>{PROFIL.kota}, {PROFIL.provinsi}</p>
              <p>Kode Pos {PROFIL.kodePos}</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </section>
);
