/* js/components/Hero.js
   Hero: latar video (jika HERO_VIDEO ada) atau ilustrasi SVG, lalu kartu
   judul dengan tombol ke Galeri dan Peta. */

const Hero = ({ scrollToId }) => {
  const [videoOk, setVideoOk] = React.useState(!!HERO_VIDEO);
  return (
    <section id="beranda" className="relative scroll-mt-16">
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-[var(--red-deep)]">
        <HeroArtwork />
        {videoOk && (
          <video className="absolute inset-0 w-full h-full object-cover" src={HERO_VIDEO}
            autoPlay muted loop playsInline onError={() => setVideoOk(false)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <Container className="relative lg:absolute lg:inset-x-0 lg:bottom-10">
        <div className="-mt-40 sm:-mt-48 lg:mt-0 lg:ml-auto lg:w-[480px] bg-[var(--red)]/95 backdrop-blur-sm text-white rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          <p className="text-white/75 text-sm font-medium mb-1">Selamat datang di</p>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-4">
            {PROFIL.nama}
          </h1>
          <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed mb-6">
            Kecamatan {PROFIL.kecamatan}, {PROFIL.kota}, {PROFIL.provinsi}. Kenali kelurahan
            kami lewat foto, video, struktur perangkat, dan peta wilayah.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => scrollToId("galeri")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[var(--red-dark)] text-sm font-semibold hover:bg-[var(--gold)] hover:text-[var(--red-deep)] transition-colors">
              <ImageIcon className="w-4 h-4" /> Lihat Galeri
            </button>
            <button onClick={() => scrollToId("peta")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/70 text-white text-sm font-medium hover:bg-white hover:text-[var(--red-dark)] transition-colors">
              <MapPinIcon className="w-4 h-4" /> Lokasi di Peta
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};
