/* js/data-profil.js
   ISI SEKSI "DATA PROFIL" (10 bagian). Sumber data terisi: dokumen
   "Profil Kelurahan Matani Satu, Desember 2024" (format Permendagri 12/2021).

   Cara mengubah:
   • Butir yang value-nya null tampil sebagai "Segera diisi" — cukup ganti null
     dengan teks, mis.  it("Sejarah dan asal-usul", "Teks sejarah ...").
   • it(label, nilai, catatan)            → satu butir berisi teks/angka
   • tb(label, [[nama, nilai], ...], cat) → butir berisi tabel kecil
   • Bagian 9 (peta) memakai "maps": letakkan hasil ekspor ArcGIS (PNG/JPG)
     di folder assets/peta/ dengan nama file yang tertera di bawah. */

const it = (l, v = null, n = "") => ({ l, v, n });
const tb = (l, rows, n = "") => ({ l, rows, n });
const SUMBER_DOK = "Profil Kelurahan Des 2024";

const DATA_PROFIL = [
  {
    no: 1, judul: "Identitas & Gambaran Umum", singkat: "Identitas",
    groups: [{ items: [
      it("Nama desa/kelurahan", "Kelurahan Matani Satu", "Kode pos 95445"),
      it("Kode wilayah"),
      it("Kecamatan, kota, dan provinsi", "Kec. Tomohon Tengah, Kota Tomohon, Sulawesi Utara"),
      it("Sejarah dan asal-usul"),
      it("Visi dan misi"),
      it("Status administratif", "Kelurahan", "Berada di bawah Kecamatan Tomohon Tengah"),
      tb("Batas-batas wilayah", [
        ["Utara", "Kel. Paslaten Dua"], ["Selatan", "Kel. Matani Dua"],
        ["Timur", "Kab. Minahasa"], ["Barat", "Kel. Matani Dua"],
      ], `Menurut ${SUMBER_DOK}`),
      it("Luas wilayah dan jumlah lingkungan", "513,13 ha · 5 lingkungan", `Menurut ${SUMBER_DOK}`),
      it("Kondisi geografis dan topografi", "Dataran tinggi, 700–900 mdpl", "Kemiringan lahan 0–40°"),
    ]}],
  },
  {
    no: 2, judul: "Kondisi Fisik & Geografis", singkat: "Fisik",
    groups: [{ items: [
      it("Letak geografis dan koordinat"),
      it("Luas dan batas administrasi", "513,13 ha", "Batas: lihat bagian 1"),
      it("Ketinggian dan kemiringan lereng", "700–900 mdpl · kemiringan 0–40°"),
      tb("Iklim dan curah hujan", [
        ["Curah hujan", "2.000 mm/tahun"], ["Bulan hujan", "6 bulan"],
        ["Suhu rata-rata harian", "26 °C"], ["Kelembapan", "Menengah"],
      ]),
      tb("Jenis tanah dan geologi", [
        ["Warna tanah", "Merah, kuning, hitam, abu-abu"],
        ["Tekstur", "Lempung, pasiran, debuan"],
        ["Tanpa erosi", "500 ha"], ["Erosi ringan", "150 ha"], ["Erosi sedang", "59 ha"],
      ], "Geologi rinci belum tersedia"),
      tb("Hidrologi dan sumber air", [
        ["Mata air", "1 unit (128 KK)"], ["Sumur gali", "146 unit (167 KK)"],
        ["Sumur pompa", "168 unit (168 KK)"], ["PAM", "327 unit (329 KK)"],
        ["Rawa", "1 ha"], ["Sungai", "Belum ada data"],
      ], "Jumlah unit menurut tabel sumber air bersih"),
      tb("Penggunaan lahan eksisting", [
        ["Permukiman", "112 ha"], ["Perkebunan / tegalan", "129 ha"], ["Pekarangan", "21 ha"],
        ["Perkantoran", "317 ha"], ["Prasarana umum lain", "19 ha"], ["Kuburan", "3,125 ha"],
        ["Total tercatat", "513,13 ha"],
      ], "Rincian belum cocok dengan totalnya, perlu diverifikasi. Hutan lindung 23 ha, hutan produksi 27 ha, hutan kota 3 ha."),
      it("Potensi dan risiko bencana", null, "Banjir, longsor, dan kekeringan belum diisi. Tercatat lahan kritis 12 ha."),
    ]}],
  },
  {
    no: 3, judul: "Kondisi Kependudukan", singkat: "Penduduk",
    groups: [{ items: [
      tb("Penduduk menurut jenis kelamin", [["Laki-laki", "1.056 jiwa"], ["Perempuan", "1.019 jiwa"], ["Total", "2.075 jiwa"]]),
      tb("Kepala keluarga (KK)", [["Total", "729 KK"], ["KK laki-laki", "510"], ["KK perempuan", "219"]]),
      tb("Kelompok umur", [
        ["0–14 tahun", "369"], ["15–24 tahun", "318"], ["25–44 tahun", "646"],
        ["45–64 tahun", "503"], ["65 tahun ke atas", "254"],
      ], "Dihitung dari tabel usia per tahun (jumlah 2.090, selisih 15 jiwa dari angka resmi 2.075)"),
      it("Kepadatan penduduk", "404 jiwa/km²", `Menurut ${SUMBER_DOK}`),
      it("Tingkat pertumbuhan penduduk", null, "Data tahun lalu belum diisi"),
      tb("Tingkat pendidikan (tamatan)", [
        ["SD", "250"], ["SMP", "652"], ["SMA", "621"], ["Diploma (D1–D3)", "73"],
        ["S1", "172"], ["S2", "31"], ["S3", "7"],
      ]),
      tb("Mata pencaharian", [
        ["Wiraswasta", "244"], ["Karyawan swasta", "198"], ["Pegawai Negeri Sipil", "89"],
        ["Petani", "100"], ["Buruh tani", "25"], ["Karyawan perusahaan pemerintah", "47"],
        ["Ibu rumah tangga", "298"],
      ]),
      tb("Agama", [["Kristen", "1.201"], ["Katolik", "811"], ["Islam", "13"]], "Komposisi sosial: etnis Minahasa 2.030 jiwa"),
      tb("Status pekerjaan (usia 18–56 th)", [
        ["Bekerja penuh", "521"], ["Bekerja tidak tentu", "335"], ["Ibu rumah tangga", "392"],
        ["Sekolah / tidak bekerja", "289"], ["Angkatan kerja", "1.145"],
      ]),
      it("Migrasi penduduk", "Pendatang dan pekerja musiman: 53 orang", "Pendatang tanpa keterangan penduduk: 5 orang"),
    ]}],
  },
  {
    no: 4, judul: "Kondisi Sosial & Budaya", singkat: "Sosbud",
    groups: [{ items: [
      it("Adat istiadat dan tradisi", null, "Tercatat 1 lembaga adat; uraian tradisi belum diisi. Etnis terbanyak: Minahasa."),
      it("Kegiatan sosial dan kemasyarakatan", "Panti Lydia (1 unit), organisasi Bapak (3 unit)"),
      tb("Organisasi kepemudaan dan kelompok masyarakat", [
        ["Karang Taruna", "26 pengurus"], ["PKK", "9 pengurus"], ["LPM", "9 pengurus"], ["Kelompok tani", "12 unit"],
      ]),
      tb("Pendidikan dan partisipasi sekolah", [
        ["Usia 7–18 th sedang sekolah", "168"], ["Usia 3–6 th sedang TK", "11"],
        ["Usia 7–18 th tidak pernah sekolah", "5"], ["Buta aksara usia 18–56 th", "8"],
      ]),
      tb("Kesehatan masyarakat", [
        ["Bayi lahir hidup", "12"], ["Balita", "34 (semua gizi baik)"],
        ["Keluarga dengan WC sehat", "720"], ["Kader Posyandu aktif", "12"], ["Akseptor KB", "71"],
      ]),
      it("Fasilitas pendidikan dan kesehatan", "Lihat bagian 6c"),
      it("Kegiatan keagamaan", "2 organisasi keagamaan", "Rumah ibadah: lihat bagian 6c"),
      tb("Kesejahteraan dan kelompok rentan", [
        ["Prasejahtera", "9 keluarga"], ["Sejahtera I", "180"], ["Sejahtera II", "302"], ["Sejahtera III", "7"],
        ["Disabilitas fisik", "7 jiwa"], ["Disabilitas mental", "6 jiwa"], ["Lansia > 75 th", "61 jiwa"],
      ]),
    ]}],
  },
  {
    no: 5, judul: "Kondisi Perekonomian", singkat: "Ekonomi",
    groups: [{ items: [
      it("Mata pencaharian utama", "Wiraswasta, karyawan swasta, PNS, dan petani"),
      it("Sektor ekonomi dominan", "Jasa dan perdagangan", "Tipologi lain: kerajinan industri kecil, peternakan, perkebunan, pariwisata"),
      it("Potensi sumber daya alam", "Hutan 411 ha, kayu 30 m³/th, bambu 10 m³/th"),
      tb("UMKM", [["Industri makanan", "1"], ["Industri material bangunan", "4"], ["Rumah makan / restoran", "14"], ["Total", "19 unit"]]),
      it("Industri rumah tangga", "2 jenis: perabot dan pembuat kue", "Penjahit/bordir: 1 orang"),
      tb("Pertanian, peternakan, dan perikanan", [
        ["Jagung", "34 ha"], ["Sayuran", "13 ha"], ["Ayam kampung", "1.703 ekor"],
        ["Babi", "85 ekor"], ["Sapi", "12 ekor"], ["Kolam ikan", "0,01 ha"],
      ], "Luas jagung di tabel tanaman pangan tertulis 4 ha, perlu dicek"),
      tb("Sarana perdagangan dan jasa", [
        ["Pasar", "Belum ada data"], ["Restoran", "2"], ["SPBU", "1"], ["Pengecer LPG", "3"],
        ["Persewaan kamar", "127 unit"], ["Hotel bintang 1", "1"],
      ]),
      it("Tingkat pendapatan masyarakat"),
      it("Potensi ekonomi dan peluang usaha", "Wisata hutan, wisata goa, wisata air tawar", "Indikator tipologi pariwisata. Kendala: peternakan berada di pusat kota, belum ada penampung ikan."),
    ]}],
  },
  {
    no: 6, judul: "Sarana & Prasarana", singkat: "Sarpras",
    groups: [
      { title: "a. Prasarana transportasi", items: [
        tb("Jalan dan permukaannya", [
          ["Jalan kelurahan (aspal)", "2 km, baik"], ["Jalan antar kelurahan/kecamatan (aspal)", "10 km"],
          ["Jalan kota (aspal)", "20 km"], ["Jalan provinsi (aspal)", "35 km"], ["Jalan negara (aspal)", "2.000 m"],
        ], "Semua beraspal dan berkondisi baik"),
        it("Jembatan dan aksesibilitas", "1 jembatan beton", "Ke ibu kota kecamatan 3,5 km; ke pusat kota 3 km; ke ibu kota provinsi 25 km"),
        tb("Sarana transportasi umum", [["Ojek", "273 unit"], ["Pangkalan ojek", "3"], ["Truk umum", "4 unit"], ["Bendi/dokar", "2 unit"]], "Kendaraan umum ke kecamatan ± 4 unit"),
      ]},
      { title: "b. Prasarana utilitas", items: [
        tb("Jaringan air bersih", [["Sumur pompa", "203"], ["Sumur gali", "210"], ["PAM", "135"], ["Mata air", "1"], ["Tangki air", "4"]]),
        it("Jaringan listrik", "PLN: 1.119 unit", "Kayu bakar masih dipakai 4 keluarga"),
        tb("Telekomunikasi dan internet", [["Pelanggan GSM", "322"], ["Pelanggan CDMA", "11"], ["Televisi", "1.398 unit"], ["Parabola", "31 unit"]], "Data internet/fiber belum diisi"),
        it("Sistem drainase"),
        it("Pengelolaan persampahan", null, "TPS, TPA, dan armada pengangkut tercatat 0"),
        it("Sanitasi dan air limbah", "Jamban keluarga: 498 KK", "Keluarga dengan WC sehat: 720"),
      ]},
      { title: "c. Sarana pelayanan umum", items: [
        tb("Pendidikan", [["TK", "2"], ["SD", "2"], ["SMP", "1"], ["SMA", "3"], ["Perguruan tinggi negeri", "1"], ["Perguruan tinggi swasta", "1"], ["SLB", "1"], ["Kursus komputer", "1"]], "PAUD belum tercatat"),
        tb("Kesehatan", [["Puskesmas pembantu", "1"], ["Posyandu", "2"], ["Dokter umum", "5"], ["Dokter spesialis", "2"], ["Bidan", "25"], ["Perawat", "84"]]),
        tb("Peribadatan", [["Masjid", "1"], ["Gereja Katolik", "1"], ["Gereja Protestan", "Belum ada data"]]),
        tb("Pemerintahan", [["Ruang kerja kantor", "4"], ["Komputer", "3 unit"], ["Kendaraan dinas", "1 unit"], ["Balai pertemuan", "Belum ada data"]]),
        it("Perdagangan", "Restoran 2, SPBU 1", "Pasar kelurahan dan kios belum diisi"),
        tb("Olahraga dan ruang terbuka", [["Lapangan voli", "1"], ["Lapangan basket", "2"], ["Taman / ruang publik", "Belum ada data"]]),
      ]},
    ],
  },
  {
    no: 7, judul: "Kelembagaan & Pemerintahan", singkat: "Lembaga",
    groups: [{ items: [
      it("Struktur organisasi pemerintahan", "10 aparat · 10 unit kerja", "Bagan lengkap ada di bagian Struktur"),
      it("Kepala desa dan perangkat", "Lurah: Erick Y. Kalengkongan, S.Sos., M.A.P.", "Sekretaris Kelurahan: Bobby R.A. Suak, S.H. Staf 7 orang."),
      it("Badan Permusyawaratan Desa (BPD)", null, "Belum ada data"),
      tb("Lembaga Kemasyarakatan (LKD/LKK)", [["PKK", "9 pengurus"], ["Karang Taruna", "26 pengurus"], ["Lembaga adat", "1 unit"], ["RT/RW", "Belum ada data"]]),
      it("LPMD / LPM", "9 pengurus"),
      it("Kelompok tani, nelayan, dan usaha", "12 kelompok tani/nelayan"),
      it("Program dan kegiatan pembangunan"),
      it("APBDes / anggaran kelurahan", null, "Rincian belum diisi. Target PBB Rp317.918.391, realisasi 85%."),
      it("Keamanan lingkungan", "Hansip 15 orang, Linmas 15 orang, 3 pos kamling"),
    ]}],
  },
  {
    no: 8, judul: "Potensi & Permasalahan", singkat: "Potensi",
    groups: [
      { title: "Potensi", items: [
        it("Sumber daya alam", "Hutan 411 ha, lahan perkebunan 129 ha, mata air"),
        it("Sumber daya manusia", "Angkatan kerja 1.145 orang", "Lulusan perguruan tinggi usia 18–56 th: 255 orang"),
        it("Ekonomi dan pariwisata", "Wisata hutan, goa, dan air tawar", "Hutan khusus 1,9 ha"),
        it("Sosial dan budaya", "Masyarakat mayoritas Minahasa", "Lembaga adat 1 unit"),
        it("Lahan untuk pengembangan", "Lahan terlantar 100 ha", "Perlu dicek kesesuaiannya dengan tata ruang"),
      ]},
      { title: "Permasalahan", items: [
        it("Infrastruktur dan pelayanan dasar", null, "Belum ada puskesmas, apotek, dan pasar kelurahan menurut dokumen"),
        it("Lingkungan dan persampahan", "TPS/TPA belum ada", "Lahan kritis 12 ha; hutan rusak 15 ha (produksi 7, lindung 8)"),
        it("Sosial dan ekonomi", "530 warga usia 18–56 th belum/tidak bekerja", "335 bekerja tidak tentu; 9 keluarga prasejahtera"),
        it("Tata guna lahan dan kebencanaan", null, "Erosi ringan 150 ha dan sedang 59 ha"),
      ]},
    ],
  },
  {
    no: 9, judul: "Penggunaan Lahan & Tata Ruang", singkat: "Tata Ruang",
    intro: "Peta-peta di bawah ini menunggu hasil ekspor dari ArcGIS Matani 1. Simpan gambarnya di folder assets/peta/ dengan nama file yang tertera, dan otomatis tampil di sini.",
    maps: [
      { judul: "Peta administrasi", file: "assets/peta/peta-administrasi.png" },
      { judul: "Peta penggunaan lahan eksisting", file: "assets/peta/peta-guna-lahan.png" },
      { judul: "Peta jaringan jalan dan transportasi", file: "assets/peta/peta-jaringan-jalan.png" },
      { judul: "Peta persebaran sarana dan prasarana", file: "assets/peta/peta-sarpras.png" },
      { judul: "Peta kawasan permukiman", file: "assets/peta/peta-permukiman.png" },
      { judul: "Peta kawasan pertanian dan perkebunan", file: "assets/peta/peta-pertanian-perkebunan.png" },
      { judul: "Peta kawasan lindung dan rawan bencana", file: "assets/peta/peta-lindung-rawan-bencana.png" },
    ],
    groups: [{ items: [
      it("Kesesuaian dengan rencana tata ruang"),
      it("Arah dan kecenderungan perkembangan wilayah"),
    ]}],
  },
  {
    no: 10, judul: "Program & Arah Pembangunan", singkat: "Program",
    groups: [{ items: [
      it("RPJM Desa/Kelurahan"),
      it("RKP Desa/Kelurahan"),
      it("Prioritas pembangunan", "Menyejahterakan masyarakat sesuai visi, misi, dan tujuan pemerintah", "Indikasi program tahun depan, dari Profil Des 2024"),
      it("Program pemberdayaan masyarakat"),
      it("Program peningkatan infrastruktur"),
      it("Program ekonomi dan kesejahteraan"),
      it("Program perlindungan lingkungan dan mitigasi bencana"),
    ]}],
  },
];
