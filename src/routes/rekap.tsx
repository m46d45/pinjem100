import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getLabStats, type LabStats } from "@/lib/stats";

export const Route = createFileRoute("/rekap")({ component: RekapPage });

function RekapPage() {
  const [stats, setStats] = useState<LabStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void getLabStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Rekap lab</p>
        <h1 className="text-3xl font-semibold tracking-tight">Pengunjung dan simulasi</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Angka agregat, tanpa nama dan tanpa isi RAB. Bukan bagian tugas mahasiswa.
        </p>
      </header>

      {error ? (
        <p className="text-sm text-muted-foreground">Rekap belum tersedia di sesi ini.</p>
      ) : !stats ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Kunjungan halaman" value={String(stats.views)} />
          <Stat label="Simulasi tercatat" value={String(stats.sims)} />
          <Stat label="Hasil hijau" value={String(stats.hijau)} />
          <Stat label="Hasil kuning" value={String(stats.kuning)} />
          <Stat label="Hasil merah" value={String(stats.merah)} />
        </div>
      )}

      <Card>
        <CardContent className="text-sm text-muted-foreground">
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
