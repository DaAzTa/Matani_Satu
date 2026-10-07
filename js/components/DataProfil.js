/* js/components/DataProfil.js
   Seksi "Data Profil": 10 bagian dengan tab. Butir yang belum ada datanya
   tampil sebagai "Segera diisi". Isi data ada di js/data-profil.js. */

const itemFilled = (x) => !!(x.v || (x.rows && x.rows.length));

const DataItem = ({ x }) => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
    <p className="text-xs font-semibold tracking-wide uppercase text-[var(--red)]">{x.l}</p>
    {x.rows ? (
      <dl className="mt-3 text-sm divide-y divide-[var(--border)]">
        {x.rows.map(([k, v], i) => (
          <div key={i} className="flex justify-between gap-4 py-1.5">
            <dt className="text-[var(--text-muted)]">{k}</dt>
            <dd className="font-medium text-right">{v}</dd>
          </div>
        ))}
      </dl>
    ) : x.v ? (
      <p className="mt-2 font-display text-lg font-semibold leading-snug">{x.v}</p>
    ) : (
      <p className="mt-2 text-sm italic text-[var(--text-muted)]">Segera diisi</p>
    )}
    {x.n && <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">{x.n}</p>}
  </div>
);

const MapCard = ({ m }) => (
  <figure className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
    <div className="aspect-[4/3]">
      <SmartImage src={m.file} alt={m.judul} icon={MapAreaIcon} placeholderLabel="Menunggu peta ArcGIS" className="w-full h-full object-contain bg-white" />
    </div>
    <figcaption className="px-4 py-3 text-sm font-semibold border-t border-[var(--border)]">{m.judul}</figcaption>
  </figure>
);

const DataProfil = () => {
  const [aktif, setAktif] = React.useState(0);
  const s = DATA_PROFIL[aktif];
  const semua = s.groups.flatMap(g => g.items);
  const terisi = semua.filter(itemFilled).length;
  const pct = semua.length ? Math.round((terisi / semua.length) * 100) : 0;

  return (
    <section id="data" className="bg-[var(--bg-alt)] py-16 md:py-24 scroll-mt-16">
      <Container>
        <SectionHeading kicker="Data Profil" title="Profil Lengkap Kelurahan"
          desc={`Sepuluh bagian data kelurahan. Sumber terisi: ${SUMBER_DOK}. Butir bertanda "Segera diisi" menunggu data.`} />

        <div className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {DATA_PROFIL.map((d, i) => (
            <button key={d.no} role="tab" aria-selected={i === aktif} onClick={(e) => { setAktif(i); e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }}
              className={`shrink-0 touch-manipulation inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                i === aktif ? "bg-[var(--red)] border-[var(--red)] text-white" : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--red)]"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${i === aktif ? "bg-white/20" : "bg-[var(--bg-alt)]"}`}>{d.no}</span>
              {d.singkat}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <h3 className="font-display text-2xl sm:text-3xl font-semibold">{s.no}. {s.judul}</h3>
          {semua.length > 0 && (
            <div className="sm:w-56">
              <p className="text-xs text-[var(--text-muted)] mb-1">{terisi} dari {semua.length} butir terisi</p>
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--red)]" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
        </div>

        {s.intro && <p className="mt-4 text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">{s.intro}</p>}

        {s.maps && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.maps.map((m, i) => <MapCard key={i} m={m} />)}
          </div>
        )}

        {s.groups.map((g, gi) => (
          <div key={gi} className="mt-8">
            {g.title && <h4 className="font-semibold text-[var(--red-dark)] mb-4">{g.title}</h4>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {g.items.map((x, i) => <DataItem key={i} x={x} />)}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
};
