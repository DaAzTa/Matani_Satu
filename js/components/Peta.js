/* js/components/Peta.js
   Peta lokasi Matani Satu (Google Maps embed, tanpa API key). */

const petaTarget = () => (PETA.lat != null && PETA.lng != null) ? `${PETA.lat},${PETA.lng}` : PETA.query;

const Peta = () => {
  const q = encodeURIComponent(petaTarget());
  const embed = `https://maps.google.com/maps?q=${q}&z=${PETA.zoom}&output=embed`;
  const link = `https://www.google.com/maps/search/?api=1&query=${q}`;
  return (
    <section id="peta" className="bg-[var(--bg)] py-16 md:py-24 scroll-mt-16">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <SectionHeading kicker="Peta Wilayah" title="Lokasi Matani Satu"
            desc={`Kecamatan ${PROFIL.kecamatan}, ${PROFIL.kota}. Geser dan perbesar peta untuk melihat sekitar kelurahan.`} />
          <a href={link} target="_blank" rel="noopener"
            className="mb-10 inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-lg bg-[var(--red)] text-white text-sm font-semibold hover:bg-[var(--red-dark)] transition-colors">
            Buka di Google Maps <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] h-[360px] sm:h-[460px]">
            <iframe title="Peta Kelurahan Matani Satu" src={embed} className="w-full h-full border-0"
              loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex gap-3 mb-5">
              <MapPinIcon className="w-5 h-5 text-[var(--red)] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Kantor Kelurahan</p>
                <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{KONTAK.alamat}</p>
              </div>
            </div>
            <p className="font-semibold text-sm mb-3 flex items-center gap-2"><CompassIcon className="w-5 h-5 text-[var(--red)]" /> Berbatasan dengan</p>
            <dl className="text-sm divide-y divide-[var(--border)]">
              {PROFIL.batas.map((b, i) => (
                <div key={i} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-[var(--text-muted)]">{b.arah}</dt>
                  <dd className="font-medium text-right">{b.wilayah}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
};
