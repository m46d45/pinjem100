import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FlowChart, FlowLegend } from "@/components/charts/flow-chart";
import { ProgressScurve } from "@/components/charts/progress-scurve";
import { PayPolicyPanel } from "@/components/controls/pay-policy-panel";
import { ProjectGantt } from "@/components/gantt/gantt-chart";
import { IncomeStatementTable } from "@/components/ledger/income-statement";
import { WeekSheet } from "@/components/ledger/week-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { dppOf, directCost, projectDuration } from "@/lib/cashflow/engine";
import { MARKET_LABEL } from "@/lib/cashflow/types";
import {
  usePinjem,
  useProjectSimulation,
  useProjects,
  useSelectedProject,
} from "@/lib/cashflow/store";
import { formatRp, formatRpCompact, weekLabel } from "@/lib/format";
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

  const cost = directCost(selected);
  const duration = projectDuration(selected);
  const dpp = dppOf(selected.contractValue, company.ppnRate);

  const flowRows = sim.weeks.map((w) => ({
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Meta label="Owner" value={selected.owner} />
              <Meta label="Pasar" value={MARKET_LABEL[selected.market]} />
              <Meta label="Kontrak termasuk PPN" value={formatRpCompact(selected.contractValue)} />
              <Meta label="Revenue / DPP" value={formatRpCompact(dpp)} />
              <Meta label="Cost of sales" value={formatRpCompact(cost)} />
              <Meta label="Gross profit" value={formatRpCompact(dpp - cost)} />
              <Meta label="Durasi" value={`${duration} minggu`} />
            </div>
            <ProjectGantt project={selected} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kontrak (owner yang bayar)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
              <span>Beku SP2D akhir tahun</span>
              <Switch
                checked={selected.terms.freezeYearEnd}
                onCheckedChange={(on) => patchTerms(selected.id, { freezeYearEnd: on })}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <PayPolicyPanel project={selected} />
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
          <IncomeStatementTable income={sim.income} ratios={sim.ratios} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RAB</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-2 font-medium">Pekerjaan</th>
                <th className="px-5 py-2 font-medium">Aktivitas</th>
                <th className="px-5 py-2 text-right font-medium">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {selected.rab.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-5 py-2">{item.name}</td>
                  <td className="px-5 py-2 text-muted-foreground">
                    {selected.activities.find((a) => a.id === item.activityId)?.name}
                  </td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatRp(item.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-border font-medium">
                <td className="px-5 py-2">Total biaya langsung</td>
                <td />
                <td className="px-5 py-2 text-right tabular-nums">{formatRp(cost)}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-5 py-2">Nilai kontrak (termasuk PPN)</td>
                <td />
                <td className="px-5 py-2 text-right tabular-nums">
                  {formatRp(selected.contractValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-8">
          <ProgressScurve sim={sim} projectId={selected.id} />
          <WeekSheet sim={sim} />
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
