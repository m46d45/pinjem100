import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { usePinjem, useSimulation } from "@/lib/cashflow/store";
import { formatRpCompact } from "@/lib/format";

export function ReservePanel() {
  const company = usePinjem((s) => s.company);
  const patch = usePinjem((s) => s.patchCompany);
  const sim = useSimulation();
  const share = Math.round((company.projectShare ?? 0.7) * 100);
  const ops = company.cashStart * (company.projectShare ?? 0.7);
  const parked = company.cashStart - ops;
  const monthly = (company.reserveYieldMonthly ?? 0) * 100;
  const last = sim.weeks[sim.weeks.length - 1];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-medium tracking-tight">Cadangan</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Kas di luar proyek. Boleh dicairkan, sesuai tempo.
        </p>
      </div>

      <Field label="Porsi ke proyek" value={`${share}%`}>
        <Slider
          min={30}
          max={100}
          step={5}
          value={[share]}
          onValueChange={(v) => patch({ projectShare: (v[0] ?? 70) / 100 })}
          aria-label="Porsi ke proyek"
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        Operasional {formatRpCompact(ops)}. Cadangan awal {formatRpCompact(parked)}.
      </p>

      <Field
        label="Kelebihan diparkir"
        value={`${Math.round((company.parkShare ?? 1) * 100)}%`}
      >
        <Slider
          min={0}
          max={100}
          step={5}
          value={[Math.round((company.parkShare ?? 1) * 100)]}
          onValueChange={(v) => patch({ parkShare: (v[0] ?? 100) / 100 })}
          aria-label="Kelebihan diparkir"
        />
      </Field>

      <Field
        label="Tempo parkir"
        value={
          (company.parkLagWeeks ?? 0) === 0
            ? "Masuk minggu yang sama"
            : `${company.parkLagWeeks} minggu`
        }
      >
        <Slider
          min={0}
          max={4}
          step={1}
          value={[company.parkLagWeeks ?? 0]}
          onValueChange={(v) => patch({ parkLagWeeks: v[0] ?? 0 })}
          aria-label="Tempo parkir"
        />
      </Field>

      <Field
        label="Hasil per bulan"
        value={`${monthly.toFixed(1).replace(".", ",")}%`}
      >
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={[monthly]}
          onValueChange={(v) => patch({ reserveYieldMonthly: (v[0] ?? 0.5) / 100 })}
          aria-label="Hasil cadangan per bulan"
        />
      </Field>

      <Field
        label="Tempo cair"
        value={
          company.reserveLagWeeks === 0
            ? "Cair minggu yang sama"
            : `${company.reserveLagWeeks} minggu`
        }
      >
        <Slider
          min={0}
          max={12}
          step={1}
          value={[company.reserveLagWeeks ?? 4]}
          onValueChange={(v) => patch({ reserveLagWeeks: v[0] ?? 4 })}
          aria-label="Tempo cair cadangan"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Mini label="Cadangan sekarang" value={formatRpCompact(last?.reserve ?? parked)} />
        <Mini label="Hasil tahun ini" value={formatRpCompact(sim.totalOtherIncome)} />
        <Mini label="Keluar ke cadangan" value={formatRpCompact(sim.totalPark)} />
        <Mini label="Cair ke proyek" value={formatRpCompact(sim.totalLiquidate)} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}
