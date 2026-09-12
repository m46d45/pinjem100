import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoanChart } from "@/components/charts/loan-chart";
import { ReserveFlowChart } from "@/components/charts/reserve-flow-chart";
import { FinancePanel } from "@/components/controls/finance-panel";
import { ReservePanel } from "@/components/controls/reserve-panel";
import { ExcelButton } from "@/components/ledger/excel-button";
import { ZonePanel } from "@/components/meja/zone-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRatio } from "@/lib/cashflow/engine";
import { MODE_LABEL } from "@/lib/cashflow/types";
import { monthLabel, formatRp, formatRpCompact } from "@/lib/format";
import type { Simulation } from "@/lib/cashflow/types";
import {
  usePinjem,
  useProjectSimulation,
  useProjects,
  useSelectedProject,
  useSimulation,
} from "@/lib/cashflow/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/keuangan")({ component: KeuanganPage });

type Scope = "portofolio" | "proyek";

function KeuanganPage() {
  const [scope, setScope] = useState<Scope>("portofolio");
  const portfolioSim = useSimulation();
  const selected = useSelectedProject();
  const projectSim = useProjectSimulation(selected);
  const projects = useProjects();
  const setSelected = usePinjem((s) => s.setSelected);
  const mode = usePinjem((s) => s.mode);
  const year = usePinjem((s) => s.company.fiscalYear);

  const setMode = usePinjem((s) => s.setMode);

  const sim = scope === "proyek" ? projectSim : portfolioSim;
  const months = summarizeMonths(sim, year);
  const enabled = projects.filter((p) => p.enabled);
  const scopeLabel =
    scope === "proyek"
      ? selected
        ? `Satu proyek: ${selected.name}`
        : "Satu proyek"
      : `Portofolio · ${MODE_LABEL[mode]} · ${enabled.length} proyek`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Kebijakan perusahaan. Grafik mengikuti lingkup di bawah.
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Keuangan</h1>
          <p className="max-w-xl text-sm text-muted-foreground">{scopeLabel}</p>
        </div>
        <ExcelButton
          sim={sim}
          file={scope === "proyek" ? "pinjem100-keuangan-proyek" : "pinjem100-keuangan"}
        />
      </header>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Lingkup grafik</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setScope("portofolio")}
            className={cn(
              "min-h-11 rounded-lg px-3 py-2 text-sm",
              scope === "portofolio"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            Portofolio
          </button>
          <button
            type="button"
            onClick={() => setScope("proyek")}
            className={cn(
              "min-h-11 rounded-lg px-3 py-2 text-sm",
              scope === "proyek"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            Satu proyek
          </button>
        </div>
        {scope === "proyek" ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-lg px-3 text-sm",
                  p.id === selected?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Jenis portofolio</p>
            <div className="grid grid-cols-2 gap-2">
              {(["satu-pasar", "berbagai-pasar"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "min-h-11 rounded-lg px-3 py-2 text-sm",
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {enabled.map((p) => p.name).join(" · ") || "Tidak ada proyek nyala"}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-8">
            <FinancePanel />
            <ReservePanel />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="flex flex-col gap-6">
            <ZonePanel sim={sim} />
            <LoanChart sim={sim} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <ReserveFlowChart sim={sim} />
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Drawn debt (puncak)" value={formatRpCompact(sim.peakLoan)} />
        <Stat label="Cadangan akhir" value={formatRpCompact(sim.endReserve)} />
        <Stat label="Hasil cadangan" value={formatRpCompact(sim.totalOtherIncome)} />
        <Stat label="Minggu terutang" value={`${sim.weeksInDebt} minggu`} />
        <Stat label="Interest (Beban bunga)" value={formatRpCompact(sim.totalInterest)} />
        <Stat label="DER" value={formatRatio(sim.ratios.der)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Rekap bulanan utang</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-2 font-medium">Bulan</th>
                <th className="px-5 py-2 text-right font-medium">Pencairan</th>
                <th className="px-5 py-2 text-right font-medium">Pengembalian</th>
                <th className="px-5 py-2 text-right font-medium">Bunga</th>
                <th className="px-5 py-2 text-right font-medium">Sisa akhir</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.key} className="border-t border-border">
                  <td className="px-5 py-2">{m.label}</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatRp(m.draw)}</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatRp(m.repay)}</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatRp(m.interest)}</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatRp(m.loanEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

function summarizeMonths(sim: Simulation, year: number) {
  const map = new Map<
    string,
    { key: string; label: string; draw: number; repay: number; interest: number; loanEnd: number }
  >();
  for (const w of sim.weeks) {
    const label = monthLabel(w.week, year);
    const prev = map.get(label) ?? {
      key: label,
      label,
      draw: 0,
      repay: 0,
      interest: 0,
      loanEnd: 0,
    };
    prev.draw += w.draw;
    prev.repay += w.repay;
    prev.interest += w.interest;
    prev.loanEnd = w.loan;
    map.set(label, prev);
  }
  return [...map.values()].filter((m) => m.draw || m.repay || m.interest || m.loanEnd);
}
