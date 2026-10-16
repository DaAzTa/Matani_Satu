/* js/components/Kegiatan.js
   Kegiatan mendatang. Data dari database (tabel "kegiatan", diatur lewat panel admin).
   Jika belum ada kegiatan atau database tidak terhubung, bagian ini tidak tampil. */

const Kegiatan = () => {
  const [daftar, setDaftar] = React.useState([]);

  React.useEffect(() => {
    if (!dbClient) return;
    let batal = false;
    const n = new Date();
    const hari = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    dbClient.from("kegiatan").select("id,judul,deskripsi,tanggal,tanggal_selesai,waktu,lokasi")
      .eq("terbit", true).or(`tanggal.gte.${hari},tanggal_selesai.gte.${hari}`)
      .order("tanggal").limit(6)
      .then(({ data, error }) => { if (!batal && !error && data) setDaftar(data); });
    return () => { batal = true; };
  }, []);

  if (!daftar.length) return null;
  const tgl = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section id="kegiatan" className="py-16 md:py-24 scroll-mt-16">
      <Container>
        <SectionHeading kicker="Kegiatan" title="Kegiatan Mendatang"
          desc="Jadwal kegiatan dan acara di Kelurahan Matani Satu." />
        <ul className="grid gap-4 md:grid-cols-2">
          {daftar.map((k) => (
            <li key={k.id} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="w-16 h-16 shrink-0 rounded-xl bg-[var(--red)] text-white flex flex-col items-center justify-center leading-tight">
                <span className="text-xl font-bold">{Number(k.tanggal.slice(8, 10))}</span>
                <span className="text-[10px] uppercase tracking-wide">{new Date(`${k.tanggal}T00:00:00`).toLocaleDateString("id-ID", { month: "short" })}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug">{k.judul}</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />
                    {k.tanggal_selesai && k.tanggal_selesai !== k.tanggal ? `${tgl(k.tanggal)} - ${tgl(k.tanggal_selesai)}` : tgl(k.tanggal)}</span>
                  {k.waktu && <span className="inline-flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{k.waktu}</span>}
                  {k.lokasi && <span className="inline-flex items-center gap-1"><MapAreaIcon className="w-3.5 h-3.5" />{k.lokasi}</span>}
                </p>
                {k.deskripsi && <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{k.deskripsi}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};