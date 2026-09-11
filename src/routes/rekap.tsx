import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { usePinjem } from "@/lib/cashflow/store";

export const Route = createFileRoute("/rekap")({ component: RekapPage });

function RekapPage() {
  const journal = usePinjem((s) => s.journal);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pengampu</p>
        <h1 className="text-3xl font-semibold tracking-tight">Rekap pemakaian</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Angka di browser ini, tanpa nama. Mahasiswa tidak perlu membuka halaman ini.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Halaman dibuka" value={String(journal.views)} />
        <Stat label="Simulasi diubah" value={String(journal.simCount)} />
        <Stat label="Zona terakhir" value={journal.lastZone ?? "—"} />
        <Stat label="Hasil hijau" value={String(journal.hijau)} />
        <Stat label="Hasil kuning" value={String(journal.kuning)} />
        <Stat label="Hasil merah" value={String(journal.merah)} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            Proyek: {journal.openedProyek ? "dibuka" : "belum"}. Portofolio:{" "}
            {journal.openedPortofolio ? "dibuka" : "belum"}. Akumulasi:{" "}
            {journal.openedAkumulasi ? "dibuka" : "belum"}.
          </p>
          <p>
            Preset bersamaan: {journal.usedBersamaan ? "ya" : "belum"}. Bergelombang:{" "}
            {journal.usedBergelombang ? "ya" : "belum"}.
          </p>
          <Link to="/" className="text-primary">
            Kembali ke Panduan
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
