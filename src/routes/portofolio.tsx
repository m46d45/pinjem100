import { createFileRoute } from "@tanstack/react-router";
import { CashPositionChart } from "@/components/charts/cash-position-chart";
import { FlowChart, FlowLegend } from "@/components/charts/flow-chart";
import { ScurveChart } from "@/components/charts/scurve-chart";
import { PresetBar } from "@/components/controls/preset-bar";
import { PortfolioGantt } from "@/components/gantt/gantt-chart";
import { IncomeStatementTable } from "@/components/ledger/income-statement";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ExcelButton } from "@/components/ledger/excel-button";
import { ZonePanel } from "@/components/meja/zone-panel";
import { Card, CardContent } from "@/components/ui/card";
import { MODE_LABEL, MARKET_BLURB } from "@/lib/cashflow/types";
import { usePinjem, useProjects, useSimulation } from "@/lib/cashflow/store";
import { formatRpCompact } from "@/lib/format";

export const Route = createFileRoute("/portofolio")({ component: PortofolioPage });

function PortofolioPage() {
  const sim = useSimulation();
  const projects = useProjects();
  const mode = usePinjem((s) => s.mode);
  const year = usePinjem((s) => s.company.fiscalYear);
  const ppnRate = usePinjem((s) => s.company.ppnRate);
  const enabled = projects.filter((p) => p.enabled);

  const yMax = Math.max(
    1,
    ...sim.weeks.flatMap((w) => [
      w.cashIn,
      w.cashOut,
      w.revenue,
      w.expense,
      Math.abs(w.accumulatedFromZero),
    ]),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tiga proyek, satu tahun anggaran {year}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{MODE_LABEL[mode]}</h1>
        </div>
        <ExcelButton sim={sim} file="pinjem100-portofolio" />
      </header>

      <Card>
        <CardContent>
          <PresetBar />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {mode === "berbagai-pasar" ? (
        <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className="rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
              <span className="font-medium text-foreground">{p.name}. </span>
              {MARKET_BLURB[p.market]}
            </li>
          ))}
        </ul>
      ) : null}

      <Card>
        <CardContent>
          <PortfolioGantt projects={projects} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ScurveChart sim={sim} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium tracking-tight">Masuk dan keluar</h2>
          <FlowLegend />
        </div>
        {enabled.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <FlowChart
                rows={sim.weeks.map((w) => ({
                  week: w.week,
                  earning: w.projectEarning[p.id] ?? 0,
                  receipt: w.projectIn[p.id] ?? 0,
                  expense: w.projectExpense[p.id] ?? 0,
                  disbursement: w.projectOut[p.id] ?? 0,
                  accum: w.projectAccum[p.id] ?? 0,
                }))}
                title={p.name}
                height={200}
                yMax={yMax}
              />
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent>
            <FlowChart
              rows={sim.weeks.map((w) => ({
                week: w.week,
                earning: w.revenue,
                receipt: w.cashIn,
                expense: w.expense,
                disbursement: w.cashOut,
                accum: w.accumulatedFromZero,
              }))}
              title="Gabungan"
              height={280}
              yMax={yMax}
              showClue
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <ZonePanel sim={sim} />
          <CashPositionChart sim={sim} />
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Kas kumulatif terdalam" value={formatRpCompact(sim.minAccum)} />
        <Stat label="Puncak utang terpakai" value={formatRpCompact(sim.peakLoan)} />
        <Stat label="Kas di tangan terendah" value={formatRpCompact(sim.minCash)} />
        <Stat label="Net profit (Laba bersih)" value={formatRpCompact(sim.income.netProfit)} />
      </section>

      <Card>
        <CardContent>
          <IncomeStatementTable income={sim.income} ratios={sim.ratios} ppnRate={ppnRate} />
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
