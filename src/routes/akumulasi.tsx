import { createFileRoute } from "@tanstack/react-router";
import { CashPositionChart } from "@/components/charts/cash-position-chart";
import { ScurveChart } from "@/components/charts/scurve-chart";
import { PresetBar } from "@/components/controls/preset-bar";
import { ZonePanel } from "@/components/meja/zone-panel";
import { IncomeStatementTable } from "@/components/ledger/income-statement";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulation } from "@/lib/cashflow/store";
import { formatRpCompact } from "@/lib/format";

export const Route = createFileRoute("/akumulasi")({ component: AkumulasiPage });

function AkumulasiPage() {
  const sim = useSimulation();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Kas perusahaan
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Akumulasi kas</h1>
      </header>

      <Card>
        <CardContent>
          <PresetBar />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ScurveChart sim={sim} />
        </CardContent>
      </Card>

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
        <Stat label="Interest (Beban bunga)" value={formatRpCompact(sim.totalInterest)} />
        <Stat label="Net profit (Laba bersih)" value={formatRpCompact(sim.income.netProfit)} />
        <Stat label="DER" value={sim.ratios.der.toFixed(2).replace(".", ",")} />
      </section>

      <Card>
        <CardContent>
          <IncomeStatementTable income={sim.income} ratios={sim.ratios} />
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
