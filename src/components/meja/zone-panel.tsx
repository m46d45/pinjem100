import type { Simulation, Zone } from "@/lib/cashflow/types";
import { formatRpCompact } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ZONE_COPY: Record<Zone, string> = {
  hijau: "Hijau",
  kuning: "Kuning",
  merah: "Merah",
};

export function ZonePanel({ sim }: { sim: Simulation; fiscalYear?: number }) {
  const used = Math.min(1, sim.peakLoan / Math.max(1, sim.loanLimit));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Utang terpakai puncak
          </p>
          <Badge variant={sim.zone} className="h-7 px-3 text-sm">
            {ZONE_COPY[sim.zone]}
          </Badge>
        </div>
        <p className="text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">
          {formatRpCompact(sim.peakLoan)}
        </p>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Terpakai / fasilitas {formatRpCompact(sim.loanLimit)}</span>
          <span className="tabular-nums">{Math.round(used * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              sim.zone === "merah"
                ? "bg-destructive"
                : sim.zone === "kuning"
                  ? "bg-warn"
                  : "bg-primary",
            )}
            style={{ width: `${Math.min(100, used * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}