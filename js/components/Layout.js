/* js/components/Layout.js
   Komponen kecil yang dipakai berkali-kali: Container, ZigZag, judul
   section, dan SmartImage (gambar yang otomatis jadi placeholder bila
   file belum ada). */

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const ZigZag = () => <div className="zigzag w-full" />;

const SectionHeading = ({ kicker, title, desc, light = false }) => (
  <div className="mb-10 max-w-2xl">
    {kicker && (
      <p className={`text-xs font-semibold tracking-[0.18em] uppercase mb-2 ${light ? "text-[var(--gold)]" : "text-[var(--red)]"}`}>{kicker}</p>
    )}
    <h2 className={`font-display text-3xl sm:text-4xl font-semibold ${light ? "text-white" : ""}`}>{title}</h2>
    {desc && <p className={`mt-3 text-sm sm:text-base leading-relaxed ${light ? "text-white/75" : "text-[var(--text-muted)]"}`}>{desc}</p>}
  </div>
);

const MediaPlaceholder = ({ icon: I = ImageIcon, label, hint, className = "" }) => (
  <div className={`placeholder-stripes w-full h-full flex flex-col items-center justify-center text-center gap-2 p-4 text-[var(--text-muted)] ${className}`}>
    <I className="w-8 h-8 opacity-60" />
    {label && <span className="text-xs font-medium">{label}</span>}
    {hint && <span className="text-[10px] opacity-70 break-all">{hint}</span>}
  </div>
);

const SmartImage = ({ src, alt, className = "", placeholderLabel, icon }) => {
  const [failed, setFailed] = React.useState(!src);
  React.useEffect(() => setFailed(!src), [src]);
  if (failed) return <MediaPlaceholder icon={icon} label={placeholderLabel || "Foto belum tersedia"} hint={src} />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`placeholder-stripes ${className}`} />;
};
