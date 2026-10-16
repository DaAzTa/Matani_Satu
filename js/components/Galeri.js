/* js/components/Galeri.js
   Galeri foto dengan lightbox (klik foto → tampil besar; ← → atau geser untuk
   berpindah, Esc untuk menutup).
   Foto diambil dari database (tabel "galeri", diatur lewat panel admin).
   Jika database belum diisi atau tidak bisa dihubungi, memakai daftar GALERI di data.js. */

const Lightbox = ({ items, index, setIndex }) => {
  const item = items[index];
  const go = (d) => setIndex((index + d + items.length) % items.length);
  const touchX = React.useRef(0);
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setIndex(null)} role="dialog" aria-modal="true"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <button aria-label="Tutup" onClick={() => setIndex(null)}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <CloseIcon className="w-5 h-5" />
      </button>
      <button aria-label="Sebelumnya" onClick={(e) => { e.stopPropagation(); go(-1); }}
        className="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <figure className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-xl overflow-hidden bg-[var(--card)] max-h-[78vh] flex items-center justify-center aspect-video">
          <SmartImage key={item.src} src={item.src} alt={item.judul} className="max-h-[78vh] w-auto h-full object-contain" />
        </div>
        <figcaption className="text-white/85 text-sm mt-3 flex justify-between gap-4">
          <span>{item.judul}</span>
          <span className="text-white/50">{index + 1} / {items.length}</span>
        </figcaption>
      </figure>
      <button aria-label="Berikutnya" onClick={(e) => { e.stopPropagation(); go(1); }}
        className="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const Galeri = () => {
  const [open, setOpen] = React.useState(null);
  const [items, setItems] = React.useState(GALERI); // data bawaan dulu

  React.useEffect(() => {
    if (!dbClient) return;
    let batal = false;
    dbClient.from("galeri").select("foto_url,judul").eq("terbit", true)
      .order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(60)
      .then(({ data, error }) => {
        if (!batal && !error && data && data.length) setItems(data.map((r) => ({ src: r.foto_url, judul: r.judul || "Foto kelurahan" })));
      });
    return () => { batal = true; };
  }, []);

  return (
    <section id="galeri" className="bg-[var(--bg-alt)] py-16 md:py-24 scroll-mt-16">
      <Container>
        <SectionHeading kicker="Galeri Foto" title="Potret Matani Satu"
          desc="Dokumentasi suasana, kegiatan warga, dan sudut-sudut kelurahan. Klik foto untuk memperbesar." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] sm:auto-rows-[190px]">
          {items.map((g, i) => (
            <button key={i} onClick={() => setOpen(i)}
              className={`group relative rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] text-left ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <SmartImage src={g.src} alt={g.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-medium opacity-90">
                {g.judul}
              </span>
            </button>
          ))}
        </div>
      </Container>
      {open !== null && <Lightbox items={items} index={open} setIndex={setOpen} />}
    </section>
  );
};