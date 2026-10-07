/* js/components/Footer.js
   Footer: identitas kelurahan, tautan cepat, kontak, dan kredit KKT 149. */

const Footer = ({ scrollToId }) => (
  <footer id="kontak" className="bg-[var(--red-deep)] text-white/85 scroll-mt-16">
    <Container className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ShieldIcon className="w-6 h-6 text-white" />
            <StarSolid className="w-3.5 h-3.5 text-[var(--gold)] absolute" />
          </span>
          <span className="font-display font-semibold text-white text-lg">Matani Satu</span>
        </div>
        <p className="text-sm leading-relaxed text-white/70">
          Website profil {PROFIL.nama}, Kecamatan {PROFIL.kecamatan}, {PROFIL.kota}, {PROFIL.provinsi}.
        </p>
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm mb-4">Tautan Cepat</h4>
        <ul className="grid grid-cols-2 gap-2.5 text-sm">
          {NAV_LINKS.map(l => (
            <li key={l.id}>
              <button onClick={() => scrollToId(l.id)} className="text-white/70 hover:text-white transition-colors">{l.label}</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm mb-4">Kontak</h4>
        <ul className="space-y-3.5 text-sm text-white/70">
          <li className="flex gap-3"><MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[var(--gold)]" /><span>{KONTAK.alamat}</span></li>
          {KONTAK.telepon && <li className="flex gap-3 items-center"><PhoneIcon className="w-4 h-4 shrink-0 text-[var(--gold)]" /><span>{KONTAK.telepon}</span></li>}
          {KONTAK.email && <li className="flex gap-3 items-center"><MailIcon className="w-4 h-4 shrink-0 text-[var(--gold)]" /><span>{KONTAK.email}</span></li>}
        </ul>
      </div>
    </Container>

    <div className="border-t border-white/10">
      <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <p>© {new Date().getFullYear()} {PROFIL.nama}.</p>
        <p className="flex items-center gap-2">
          <img src="assets/logo-kkt149.png" alt="Logo KKT 149" className="h-7 w-auto rounded bg-white/90 p-0.5" />
          Dibuat oleh KKT 149 Posko Matani Satu
        </p>
      </Container>
    </div>
  </footer>
);
