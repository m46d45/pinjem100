import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePinjem } from "@/lib/cashflow/store";
import { getLabStats, type LabStats } from "@/lib/stats";

export const Route = createFileRoute("/rekap")({ component: RekapPage });

function RekapPage() {
  const journal = usePinjem((s) => s.journal);
  const [server, setServer] = useState<LabStats | null>(null);
  const [serverOk, setServerOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getLabStats()
      .then((stats) => {
        if (cancelled) return;
        setServer(stats);
        setServerOk(stats.views > 0 || stats.sims > 0);
      })
      .catch(() => {
        if (!cancelled) setServer(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pengampu</p>
        <h1 className="text-3xl font-semibold tracking-tight">Rekap pemakaian</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Angka di browser ini selalu tersedia. Jika server punya database, agregat kelas
          muncul di bawah.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-labelledby="rekap-browser">
        <h2 id="rekap-browser" className="text-lg font-medium">
          Browser ini
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Halaman dibuka" value={String(journal.views)} />
          <Stat label="Simulasi diubah" value={String(journal.simCount)} />
          <Stat label="Zona terakhir" value={journal.lastZone ?? "—"} />
          <Stat label="Hasil hijau" value={String(journal.hijau)} />
          <Stat label="Hasil kuning" value={String(journal.kuning)} />
          <Stat label="Hasil merah" value={String(journal.merah)} />
        </div>
      </section>

      <Card>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            Proyek: {journal.openedProyek ? "dibuka" : "belum"}. Portofolio:{" "}
            {journal.openedPortofolio ? "dibuka" : "belum"}. Keuangan:{" "}
            {journal.openedKeuangan ? "dibuka" : "belum"}.
          </p>
          <p>
            Preset bersamaan: {journal.usedBersamaan ? "ya" : "belum"}. Bergelombang:{" "}
            {journal.usedBergelombang ? "ya" : "belum"}.
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3" aria-labelledby="rekap-server">
        <h2 id="rekap-server" className="text-lg font-medium">
          Agregat server
        </h2>
        {serverOk && server ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="View (semua klien)" value={String(server.views)} />
            <Stat label="Simulasi (semua klien)" value={String(server.sims)} />
            <Stat label="Hijau" value={String(server.hijau)} />
            <Stat label="Kuning" value={String(server.kuning)} />
            <Stat label="Merah" value={String(server.merah)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada data server (butuh DATABASE_URL dan traffic lab). Event tetap
            dicatat lokal lewat beacon.
          </p>
        )}
      </section>

      <Link to="/" className="text-sm text-primary">
        Kembali ke Panduan
      </Link>
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
