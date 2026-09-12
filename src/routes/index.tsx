import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: PanduanPage });

const SPACES: { to: "/proyek" | "/portofolio" | "/keuangan"; name: string; about: string }[] = [
  {
    to: "/proyek",
    name: "Proyek",
    about: "Satu kontrak: setting, RAB A–G, Gantt, kurva S, kas, laba rugi.",
  },
  {
    to: "/portofolio",
    name: "Portofolio",
    about: "Tiga proyek, satu atau berbagai pasar, kas gabungan, posisi kas, laba rugi perusahaan.",
  },
  {
    to: "/keuangan",
    name: "Keuangan",
    about: "Setting ekuitas dan utang perusahaan. Grafik: Portofolio (default) atau Satu proyek.",
  },
];

const TERMS: { group: string; items: { name: string; about: string }[] }[] = [
  {
    group: "Empat arus",
    items: [
      { name: "Pendapatan (Earning)", about: "Kerja selesai. RAB E, diakui sesuai progres." },
      { name: "Penerimaan (Receipt)", about: "Kas masuk. Bisa mundur karena lag, UM, retensi." },
      { name: "Beban (Expense)", about: "Biaya diakui saat kerja. RAB C." },
      { name: "Pengeluaran (Disbursement)", about: "Kas keluar ke tukang, toko, alat, pajak." },
    ],
  },
  {
    group: "RAB",
    items: [
      { name: "A", about: "Biaya langsung — upah, bahan, alat. Porsi slider berlaku di sini." },
      { name: "B", about: "Biaya tidak langsung — overhead, tidak dipecah porsi." },
      { name: "C", about: "Biaya total (A + B). Beban pokok di laba rugi." },
      { name: "D", about: "Keuntungan 10% × C, sebelum pajak." },
      { name: "E", about: "Biaya total & keuntungan (C + D). DPP, pendapatan." },
      { name: "F", about: "PPN 11% × E. Bukan beban laba rugi." },
      { name: "G", about: "Nilai kontrak (E + F). Kas kotor ke owner." },
    ],
  },
  {
    group: "Pajak dan kontrak",
    items: [
      { name: "DPP", about: "Dasar pengenaan pajak. Sama dengan RAB E." },
      { name: "PPN", about: "Pajak pertambahan nilai 11%. Keluaran saat tagih, masukan saat beli bahan." },
      { name: "PPh Final 4(2)", about: "1,75% × RAB E. Pajak penghasilan jasa konstruksi." },
      { name: "UM", about: "Uang muka. Default rumah 15%." },
      { name: "Lag", about: "Jeda cair. Tagihan, pinjaman, atau bayar ke toko." },
      { name: "Tempo bayar", about: "Jeda kerja selesai sampai kas keluar ke tukang, toko, atau alat." },
      { name: "Retensi", about: "Sisa ditahan owner sampai beres." },
      { name: "Termyn", about: "Angsuran tagihan atau pengembalian utang." },
      { name: "SP2D", about: "Pencairan pemda. Bisa beku di akhir tahun anggaran." },
    ],
  },
  {
    group: "Waktu kerja",
    items: [
      { name: "Gantt", about: "Jadwal pekerjaan dalam minggu kalender." },
      { name: "Kurva S", about: "Progres kerja kumulatif 0–100%. Di spreadsheet: Progress m." },
    ],
  },
  {
    group: "Perusahaan",
    items: [
      { name: "Ekuitas", about: "Modal sendiri di kas awal." },
      { name: "Fasilitas utang", about: "Plafon KMK. Batas, bukan jumlah yang otomatis terpakai." },
      { name: "Puncak utang terpakai", about: "Kebutuhan kas yang benar-benar ditarik. Ini yang dibawa ke bank." },
      { name: "Lingkup grafik", about: "Di Keuangan: Portofolio (kas perusahaan) atau Satu proyek. Setting tetap perusahaan." },
      { name: "Zona hijau / kuning / merah", about: "Longgar, mepet, atau menembus plafon." },
      { name: "Cadangan", about: "Kas di luar proyek. Hasilnya masuk laba, cairnya bisa mundur." },
      { name: "Parkir / cair", about: "Kelebihan kas dipindah ke cadangan; cadangan dijual kembali ke proyek." },
      { name: "Kas kumulatif", about: "Jumlah penerimaan minus pengeluaran, dari nol, tanpa utang." },
      { name: "Kas di tangan", about: "Uang di rekening: ekuitas, arus proyek, utang, cadangan yang sudah cair." },
      { name: "DER", about: "Utang puncak ÷ ekuitas." },
      { name: "ROE", about: "Laba bersih ÷ ekuitas." },
    ],
  },
];

function PanduanPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pinjem100</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Laboratorium Virtual Simulasi Kas Proyek Konstruksi
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed">
          <h2 className="text-lg font-medium">Tujuan</h2>
          <p>
            Mahasiswa mempertimbangkan apakah suatu proyek atau portofolio masih muat di kas
            jangka pendek. Laba di laporan belum tentu ada uang di rekening.
          </p>
          <p>Buka sekali saat ada jaringan. Setelah itu bisa dipakai tanpa koneksi.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed">
          <h2 className="text-lg font-medium">Setelah lab ini</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Membedakan pendapatan, penerimaan, beban, dan pengeluaran.</li>
            <li>Membaca RAB A–G sampai ke laba rugi: C beban, D laba kotor, E pendapatan, F PPN, G kontrak.</li>
            <li>Melihat kas menumpuk minus meskipun laba positif.</li>
            <li>Membandingkan satu pasar dengan berbagai pasar, dan jadwal mulai yang berbeda.</li>
            <li>Menimbang ekuitas, cadangan, dan utang, termasuk jeda pencairan dan termyn.</li>
            <li>Memilih lingkup grafik Keuangan: satu proyek atau portofolio perusahaan.</li>
            <li>Melihat hasil cadangan di laba rugi, sementara uangnya belum cair.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Tiga ruang kerja</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {SPACES.map((tab) => (
              <li key={tab.name}>
                <Link to={tab.to} className="font-medium text-primary">
                  {tab.name}
                </Link>
                <span className="text-muted-foreground"> — {tab.about}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Modul lab ada di dokumen terpisah. Untuk salinan, hubungi pengampu (
            <a href="mailto:abduh@itb.ac.id" className="text-primary">
              abduh@itb.ac.id
            </a>
            ).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h2 className="text-lg font-medium">Istilah</h2>
          {TERMS.map((block) => (
            <div key={block.group} className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">{block.group}</h3>
              <dl className="flex flex-col gap-2 text-sm">
                {block.items.map((t) => (
                  <div key={t.name} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-3">
                    <dt className="font-medium">{t.name}</dt>
                    <dd className="text-muted-foreground">{t.about}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Untuk pengampu:{" "}
        <Link to="/rekap" className="text-primary">
          Rekap pemakaian
        </Link>
      </p>
    </div>
  );
}
