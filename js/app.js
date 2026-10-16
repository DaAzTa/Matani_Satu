/* js/app.js
   Komponen App: state menu mobile, status scroll, dan section aktif,
   lalu menyusun semua section. Di-load PALING TERAKHIR. */

const { useState, useEffect } = React;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("beranda");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      let current = NAV_LINKS[0].id;
      for (const l of NAV_LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= 120) current = l.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToId = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrollToId={scrollToId} activeId={activeId} />
      <Hero scrollToId={scrollToId} />
      <ZigZag />
      <Profil />
      <DataProfil />
      <Galeri />
      <Kegiatan />
      <Video />
      <Struktur />
      <Peta />
      <ZigZag />
      <Footer scrollToId={scrollToId} />
    </div>
  );
}

const mulaiRender = () => ReactDOM.createRoot(document.getElementById("root")).render(<App />);
// Ambil angka terbaru dari database dulu (maks. 4 detik). Jika gagal, tampil data bawaan.
muatDataLive().then(mulaiRender, mulaiRender);
