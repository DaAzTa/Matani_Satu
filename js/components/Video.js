/* js/components/Video.js
   Daftar video: mendukung file lokal (.mp4 di assets/video) dan YouTube. */

const VideoCard = ({ v }) => {
  const [failed, setFailed] = React.useState(!v.src && !v.youtube);
  return (
    <div className="rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
      <div className="aspect-video bg-black">
        {v.youtube ? (
          <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${v.youtube}`} title={v.judul}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
        ) : failed ? (
          <MediaPlaceholder icon={VideoIcon} label="Video belum tersedia" hint={v.src} />
        ) : (
          <video className="w-full h-full" controls preload="metadata" poster={v.poster || undefined}
            onError={() => setFailed(true)}>
            <source src={v.src} type="video/mp4" onError={() => setFailed(true)} />
          </video>
        )}
      </div>
      <div className="p-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[var(--red)] text-white flex items-center justify-center shrink-0">
          <PlayIcon className="w-4 h-4" />
        </span>
        <p className="font-semibold text-sm sm:text-base">{v.judul}</p>
      </div>
    </div>
  );
};

const Video = () => (
  <section id="video" className="bg-[var(--bg)] py-16 md:py-24 scroll-mt-16">
    <Container>
      <SectionHeading kicker="Video" title="Matani Satu dalam Video"
        desc="Tayangan profil dan dokumentasi kegiatan kelurahan." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VIDEOS.map((v, i) => <VideoCard key={i} v={v} />)}
      </div>
    </Container>
  </section>
);
