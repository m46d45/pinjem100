import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FlowChart, FlowLegend } from "@/components/charts/flow-chart";
import { ProgressScurve } from "@/components/charts/progress-scurve";
import { PayPolicyPanel } from "@/components/controls/pay-policy-panel";
import { ProjectGantt } from "@/components/gantt/gantt-chart";
import { IncomeStatementTable } from "@/components/ledger/income-statement";
import { WeekSheet } from "@/components/ledger/week-sheet";
import { RabTable } from "@/components/rab/rab-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cropActiveWeeks, projectDuration } from "@/lib/cashflow/engine";
import { MARKET_LABEL } from "@/lib/cashflow/types";
import {
  usePinjem,
  useProjectSimulation,
  useProjects,
  useSelectedProject,
} from "@/lib/cashflow/store";
import { formatRpCompact, weekLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proyek")({ component: ProyekPage });

function ProyekPage() {
  const projects = useProjects();
  const selected = useSelectedProject();
  const setSelected = usePinjem((s) => s.setSelected);
  const patchTerms = usePinjem((s) => s.patchTerms);
  const setStartWeek = usePinjem((s) => s.setStartWeek);
  const company = usePinjem((s) => s.company);
  const sim = useProjectSimulation(selected);

  if (!selected) {
    return <p>Tidak ada proyek.</p>;
  }

  const duration = projectDuration(selected);
  const view = { ...sim, weeks: cropActiveWeeks(sim.weeks) };

  const flowRows = view.weeks.map((w) => ({
    week: w.week,
    earning: w.revenue,
    receipt: w.cashIn,
    expense: w.expense,
    disbursement: w.cashOut,
    accum: w.accumulatedFromZero,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Satu proyek, tidak digabung
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{selected.name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{selected.notes}</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-lg px-3 text-sm",
              p.id === selected.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Setting kontrak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Meta label="Owner" value={selected.owner} />
              <Meta label="Pasar" value={MARKET_LABEL[selected.market]} />
              <Meta label="Kontrak termasuk PPN" value={formatRpCompact(selected.contractValue)} />
              <Meta label="Durasi" value={`${duration} minggu`} />
            </div>
            <Field label="Mulai" value={weekLabel(selected.startWeek, company.fiscalYear)}>
              <Slider
                min={0}
                max={44}
                value={[selected.startWeek]}
                onValueChange={(v) => setStartWeek(selected.id, v[0] ?? 0)}
              />
            </Field>
            <Field label="Uang muka" value={`${Math.round(selected.terms.umPercent * 100)}%`}>
              <Slider
                min={0}
                max={30}
                value={[Math.round(selected.terms.umPercent * 100)]}
                onValueChange={(v) => patchTerms(selected.id, { umPercent: (v[0] ?? 0) / 100 })}
              />
            </Field>
            <Field
              label="Lag pencairan termyn"
              value={`${selected.terms.progressLagWeeks} minggu`}
            >
              <Slider
                min={0}
                max={8}
                value={[selected.terms.progressLagWeeks]}
                onValueChange={(v) =>
                  patchTerms(selected.id, { progressLagWeeks: v[0] ?? 0 })
                }
              />
            </Field>
            {selected.market === "pemda" ? (
              <label className="flex min-h-11 flex-col gap-1 text-sm">
                <span className="flex items-center justify-between gap-3">
                  Beku SP2D akhir tahun
                  <Switch
                    checked={selected.terms.freezeYearEnd}
                    onCheckedChange={(on) => patchTerms(selected.id, { freezeYearEnd: on })}
                  />
                </span>
                <span className="text-xs text-muted-foreground">
                  Khusus pemda. SP2D tertahan di pergantian tahun anggaran, kas masuk mundur.
                </span>
              </label>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <PayPolicyPanel project={selected} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <RabTable project={selected} ppnRate={company.ppnRate} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ProjectGantt project={selected} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ProgressScurve sim={view} projectId={selected.id} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <FlowLegend />
          <FlowChart
            rows={flowRows}
            title="Masuk dan keluar"
            height={280}
            showClue
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <WeekSheet sim={view} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <IncomeStatementTable
            income={sim.income}
            ratios={sim.ratios}
            ppnRate={company.ppnRate}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
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
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}
