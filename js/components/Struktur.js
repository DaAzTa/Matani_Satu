/* js/components/Struktur.js
   Bagan struktur organisasi Kelurahan: Lurah → Sekretaris → Kasi/Staf
   → Kepala Lingkungan. Isi nama & foto di STRUKTUR (data.js). */

const PersonCard = ({ p, highlight = false, compact = false }) => (
  <div className={`relative rounded-2xl border text-center ${compact ? "p-3" : "p-4"} ${highlight
      ? "bg-[var(--red)] border-[var(--red)] text-white shadow-xl shadow-[var(--red)]/20"
      : "bg-[var(--card)] border-[var(--border)]"}`}>
    {!compact && (
      <div className={`mx-auto mb-3 rounded-full overflow-hidden ${highlight ? "w-24 h-24 ring-4 ring-white/30" : "w-16 h-16 ring-2 ring-[var(--border)]"}`}>
        <SmartImage src={p.foto} alt={p.nama} icon={UserIcon} placeholderLabel=" " className="w-full h-full object-cover" />
      </div>
    )}
    <p className={`text-[11px] font-semibold uppercase tracking-wide ${highlight ? "text-[var(--gold)]" : "text-[var(--red)]"}`}>{p.jabatan}</p>
    {p.nama
      ? <p className={`font-semibold mt-1 ${highlight ? "text-base sm:text-lg" : "text-sm"}`}>{p.nama}</p>
      : <p className={`text-xs italic mt-1 ${highlight ? "text-white/70" : "text-[var(--text-muted)]"}`}>Nama belum diisi</p>}
  </div>
);

const MD_COLS = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

const VLine = ({ h = "h-8" }) => <div className={`mx-auto w-px ${h} bg-[var(--gold)]`} />;

const Struktur = () => {
  const tengah = [...STRUKTUR.seksi, ...STRUKTUR.staf];
  return (
    <section id="struktur" className="bg-[var(--bg-alt)] py-16 md:py-24 scroll-mt-16">
      <Container>
        <SectionHeading kicker="Pemerintahan" title="Struktur Kelurahan"
          desc="Susunan perangkat Kelurahan Matani Satu yang melayani warga sehari-hari." />

        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs"><PersonCard p={STRUKTUR.lurah} highlight /></div>
          <VLine />
          <div className="w-full max-w-xs"><PersonCard p={STRUKTUR.sekretaris} /></div>
          <VLine />

          <div className="w-full">
            <div className="hidden md:block mx-auto h-px bg-[var(--gold)]" style={{ width: `calc(100% - ${100 / tengah.length}%)` }} />
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 ${MD_COLS[Math.min(tengah.length, 4)]}`}>
              {tengah.map((p, i) => (
                <div key={i} className="flex flex-col">
                  <div className="hidden md:block"><VLine h="h-6" /></div>
                  <PersonCard p={p} />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full mt-10">
            <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-muted)] mb-4">Kepala Lingkungan</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {STRUKTUR.lingkungan.map((p, i) => <PersonCard key={i} p={p} compact />)}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
