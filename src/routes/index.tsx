import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: PanduanPage });

const SPACES: { to: "/proyek" | "/portofolio" | "/akumulasi" | "/pinjam"; name: string; about: string }[] = [
  {
    to: "/proyek",
    name: "Proyek",
    about: "Satu kontrak: RAB, Gantt, bayar tukang/toko/alat, grafik, laba rugi, spreadsheet.",
  },
  {
    to: "/portofolio",
    name: "Portofolio",
    about: "Tiga proyek dalam satu tahun anggaran.",
  },
  {
    to: "/akumulasi",
    name: "Akumulasi",
    about: "Kas perusahaan, minggu ke minggu.",
  },
  {
    to: "/pinjam",
    name: "Pinjam",
    about: "Ekuitas, fasilitas utang, pencairan, termyn.",
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed">
          <h2 className="text-lg font-medium">Setelah lab ini</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Membedakan pendapatan, penerimaan, beban, dan pengeluaran.</li>
            <li>Membaca RAB, Gantt, dan kurva S sebagai arus kas.</li>
            <li>Melihat kas menumpuk minus meskipun laba positif.</li>
            <li>Membandingkan satu pasar dengan berbagai pasar, dan jadwal mulai yang berbeda.</li>
            <li>Menimbang ekuitas dan utang, termasuk jeda pencairan dan termyn.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Empat ruang kerja</h2>
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
            Modul lab ada di dokumen terpisah. Untuk salinan, hubungi pengampu.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 text-sm leading-relaxed">
          <h2 className="text-lg font-medium">Istilah</h2>
          <p>
            <strong>Pendapatan</strong> (Earning) — kerja selesai.{" "}
            <strong>Penerimaan</strong> (Receipt) — kas masuk. <strong>Beban</strong> (Expense) —
            biaya diakui. <strong>Pengeluaran</strong> (Disbursement) — kas keluar.{" "}
            <strong>DPP</strong> — nilai tanpa PPN. <strong>UM</strong> — uang muka.{" "}
            <strong>Lag</strong> — jeda cair. <strong>Retensi</strong> — sisa ditahan owner.{" "}
            <strong>DER</strong> — utang ÷ ekuitas. <strong>SP2D</strong> — pencairan pemda.
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Rekap pengunjung:{" "}
        <Link to="/rekap" className="text-primary">
          Rekap
        </Link>
      </p>
    </div>
  );
}
