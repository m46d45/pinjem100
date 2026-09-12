import { useState } from "react";
import { ExcelButton } from "@/components/ledger/excel-button";
import type { Simulation, WeekPoint } from "@/lib/cashflow/types";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WeekSheet({ sim }: { sim: Simulation }) {
  const [open, setOpen] = useState<number | null>(null);
  let last = 0;
  for (const w of sim.weeks) {
    if (
      w.cashIn ||
      w.cashOut ||
      w.draw ||
      w.repay ||
      w.revenue ||
      w.expense ||
      Math.abs(w.net) > 1
    ) {
      last = w.week;
    }
  }
  const rows = sim.weeks.filter((w) => w.week <= Math.min(sim.weeks.length - 1, last + 4));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium tracking-tight">Spreadsheet kas</h3>
        <ExcelButton sim={sim} file="pinjem100-proyek" />
      </div>
      <div className="rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        <p>Progress m = kerja kumulatif sampai minggu m, dari kurva S (tabel dalam %; rumus pakai desimal, 5% = 0,05)</p>
        <p>Earning m = RAB E × (Progress m − Progress m−1)</p>
        <p>Expense m = RAB C × (Progress m − Progress m−1)</p>
        <p>Receipt m = tagihan ke owner − PPh, masuk setelah lag</p>
        <p>Disbursement m = upah + bahan + alat + overhead B + PPN disetor (upah/bahan/alat sesuai tempo)</p>
        <p>Net m = Receipt m − Disbursement m</p>
        <p>Kumulatif m = Kumulatif m−1 + Net m</p>
        <p>Kas di tangan m = ekuitas + Kumulatif m − bunga + Cair m − Kembali m</p>
      </div>
      <div className="max-h-[480px] overflow-auto rounded-lg border border-border">
        <table className="w-full min-w-[860px] text-xs">
          <thead className="sticky top-0 z-10 bg-card text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">Minggu</th>
              <th className="px-2 py-2 text-right font-medium">Progress</th>
              <th className="px-2 py-2 text-right font-medium">Earning</th>
              <th className="px-2 py-2 text-right font-medium">Expense</th>
              <th className="px-2 py-2 text-right font-medium">Receipt</th>
              <th className="px-2 py-2 text-right font-medium">Disbursement</th>
              <th className="px-2 py-2 text-right font-medium">Net</th>
              <th className="px-2 py-2 text-right font-medium">Kumulatif</th>
              <th className="px-2 py-2 text-right font-medium">Cair</th>
              <th className="px-2 py-2 text-right font-medium">Kembali</th>
              <th className="px-2 py-2 text-right font-medium">Kas di tangan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <WeekRows
                key={w.week}
                w={w}
                open={open === w.week}
                onToggle={() => setOpen(open === w.week ? null : w.week)}
              />
            ))}
            <tr className="border-t border-border font-medium">
              <td className="px-2 py-2" colSpan={2}>
                Total
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{formatRp(sim.income.revenue)}</td>
              <td className="px-2 py-2 text-right tabular-nums">
                {formatRp(sim.weeks.reduce((s, w) => s + w.expense, 0))}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{formatRp(sim.totalCashIn)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{formatRp(sim.totalCashOut)}</td>
              <td className="px-2 py-2 text-right tabular-nums">
                {formatRp(sim.totalCashIn - sim.totalCashOut)}
              </td>
              <td />
              <td className="px-2 py-2 text-right tabular-nums">{formatRp(sim.totalDraw)}</td>
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeekRows({
  w,
  open,
  onToggle,
}: {
  w: WeekPoint;
  open: boolean;
  onToggle: () => void;
}) {
  const neg = w.accumulatedFromZero < -1;
  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-t border-border/80 hover:bg-muted/50",
          neg && "bg-destructive/5",
        )}
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-2 py-1.5">{w.label}</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{(w.workProgress * 100).toFixed(0)}%</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.revenue)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.expense)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums text-primary">{n(w.cashIn)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums text-destructive">{n(w.cashOut)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.net)}</td>
        <td className={cn("px-2 py-1.5 text-right tabular-nums", neg && "text-destructive")}>
          {n(w.accumulatedFromZero)}
        </td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.draw)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.repay)}</td>
        <td className="px-2 py-1.5 text-right tabular-nums">{n(w.cash)}</td>
      </tr>
      {open ? (
        <tr className="bg-muted/40 text-[11px] text-muted-foreground">
          <td className="px-2 py-2" colSpan={11}>
            Upah {formatRp(w.laborOut)} · Bahan {formatRp(w.materialOut)} · Lainnya{" "}
            {formatRp(w.otherOut)} · PPh dipotong {formatRp(w.pph)} · PPN keluaran{" "}
            {formatRp(w.ppnKeluaran)} · PPN masukan {formatRp(w.ppnMasukan)} · PPN disetor{" "}
            {formatRp(w.ppnRemit)} · Bunga {formatRp(w.interest)}
            {w.pendingDraw > 0 ? ` · Pengajuan belum cair ${formatRp(w.pendingDraw)}` : ""}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function n(v: number): string {
  if (Math.abs(v) < 1) return "—";
  return formatRp(v);
}
