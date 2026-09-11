import { createFileRoute } from "@tanstack/react-router";
import { FlowChart, FlowLegend } from "@/components/charts/flow-chart";
import { PresetBar } from "@/components/controls/preset-bar";
import { PortfolioGantt } from "@/components/gantt/gantt-chart";
import { ProjectCard } from "@/components/portfolio/project-card";
import { Card, CardContent } from "@/components/ui/card";
import { MODE_LABEL, MARKET_BLURB } from "@/lib/cashflow/types";
import { usePinjem, useProjects, useSimulation } from "@/lib/cashflow/store";

export const Route = createFileRoute("/portofolio")({ component: PortofolioPage });

function PortofolioPage() {
  const sim = useSimulation();
  const projects = useProjects();
  const mode = usePinjem((s) => s.mode);
  const year = usePinjem((s) => s.company.fiscalYear);
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
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Tiga proyek, satu tahun anggaran {year}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{MODE_LABEL[mode]}</h1>
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
    </div>
  );
}
