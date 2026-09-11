import { createFileRoute } from "@tanstack/react-router";
import { LoanChart } from "@/components/charts/loan-chart";
import { FinancePanel } from "@/components/controls/finance-panel";
import { ZonePanel } from "@/components/meja/zone-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPct, formatRatio } from "@/lib/cashflow/engine";
import { monthLabel, formatRp, formatRpCompact } from "@/lib/format";
import type { Simulation } from "@/lib/cashflow/types";
import { usePinjem, useSimulation } from "@/lib/cashflow/store";

export const Route = createFileRoute("/pinjam")({ component: PinjamPage });

function PinjamPage() {
  const sim = useSimulation();
  const year = usePinjem((s) => s.company.fiscalYear);
  const months = summarizeMonths(sim, year);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Utang, ekuitas, pencairan
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Pinjam</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent>
            <FinancePanel />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="flex flex-col gap-6">
            <ZonePanel sim={sim} />
            <LoanChart sim={sim} />
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Drawn debt (puncak)" value={formatRpCompact(sim.peakLoan)} />
        <Stat label="Minggu terutang" value={`${sim.weeksInDebt} minggu`} />
        <Stat label="Interest (Beban bunga)" value={formatRpCompact(sim.totalInterest)} />
        <Stat label="DER" value={formatRatio(sim.ratios.der)} />
        <Stat label="Debt ratio" value={formatPct(sim.ratios.debtRatio)} />
        <Stat label="ROE" value={formatPct(sim.ratios.roe)} />
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
