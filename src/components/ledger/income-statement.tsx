import type { IncomeStatement, Ratios } from "@/lib/cashflow/types";
import { formatPct, formatRatio } from "@/lib/cashflow/engine";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";

export function IncomeStatementTable({
  income,
  ratios,
  ppnRate = 0.11,
}: {
  income: IncomeStatement;
  ratios: Ratios;
  ppnRate?: number;
}) {
  const vat = Math.round(ppnRate * 100);
  const pph = "1,75%";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-medium tracking-tight">Laporan laba rugi</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Rumus di kolom kanan. Jumlah tebal adalah subtotal bagian.
        </p>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="py-2 pr-3 font-medium">Pos</th>
            <th className="py-2 pr-3 font-medium">Rumus / sumber</th>
            <th className="py-2 text-right font-medium">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <HeadRow label="Pendapatan usaha" />
          <Line
            label="Revenue (Pendapatan / DPP)"
            formula="RAB baris E  ·  biaya total & keuntungan, sebelum PPN"
            value={income.revenue}
          />

          <HeadRow label="Beban pokok" />
          <Line
            label="− Cost of sales (Beban pokok)"
            formula="RAB baris C  ·  biaya langsung + tidak langsung"
            value={income.cogs}
          />
          <Line
            label="= Gross profit (Laba kotor)"
            formula="RAB baris D  ·  10% × C, sebelum pajak"
            value={income.grossProfit}
            sum
          />

          <HeadRow label="Pendapatan lain" />
          <Line
            label="+ Other income (Hasil cadangan)"
            formula="Hasil investasi di luar proyek  ·  tab Pinjam"
            value={income.otherIncome}
          />
          <Line
            label="= EBIT (Laba usaha)"
            formula="Laba kotor + hasil cadangan"
            value={income.ebit}
            sum
          />

          <HeadRow label="Beban keuangan dan pajak" />
          <Line
            label="− Interest (Beban bunga)"
            formula="Utang × 12% per tahun, dihitung mingguan  ·  tab Pinjam"
            value={income.interest}
          />
          <Line
            label="= EBT (Laba sebelum pajak)"
            formula="Laba usaha − bunga"
            value={income.ebt}
            sum
          />
          <Line
            label="− PPh Final 4(2)"
            formula={`${pph} × DPP  ·  pajak penghasilan jasa konstruksi`}
            value={income.taxPph}
          />
          <Line
            label="= Net profit (Laba bersih)"
            formula="EBT − PPh"
            value={income.netProfit}
            sum
            strong
          />
        </tbody>
      </table>

      <div>
        <h4 className="text-sm font-medium">PPN — bukan beban laba rugi</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          PPN menyertai kas (keluaran saat tagih, masukan saat beli). Net ke negara di grafik
          pengeluaran, bukan di laba.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <TaxChip
            label="Output VAT (PPN Keluaran)"
            hint={`${vat}% × DPP saat tagihan`}
            value={formatRp(income.ppnKeluaran)}
          />
          <TaxChip
            label="Input VAT (PPN Masukan)"
            hint={`${vat}% × bahan (DPP)`}
            value={formatRp(income.ppnMasukan)}
          />
          <TaxChip
            label="PPN net ke negara"
            hint="Keluaran − masukan"
            value={formatRp(income.ppnNet)}
          />
          <TaxChip
            label="PPh Final 4(2)"
            hint={`${pph} × DPP, sudah di laba rugi`}
            value={formatRp(income.taxPph)}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium">Rasio</h4>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <RatioChip label="DER" hint="Utang puncak ÷ ekuitas" value={formatRatio(ratios.der)} />
          <RatioChip label="Debt ratio" hint="Utang ÷ (utang + ekuitas)" value={formatPct(ratios.debtRatio)} />
          <RatioChip
            label="Interest coverage"
            hint="EBIT ÷ bunga"
            value={formatRatio(ratios.interestCoverage, 1)}
          />
          <RatioChip label="Net margin" hint="Laba bersih ÷ pendapatan" value={formatPct(ratios.netMargin)} />
          <RatioChip label="ROE" hint="Laba bersih ÷ ekuitas" value={formatPct(ratios.roe)} />
        </div>
      </div>
    </div>
  );
}

function HeadRow({ label }: { label: string }) {
  return (
    <tr className="border-t border-border bg-muted/50">
      <td className="py-2 pr-3 font-medium" colSpan={3}>
        {label}
      </td>
    </tr>
  );
}

function Line({
  label,
  formula,
  value,
  sum,
  strong,
}: {
  label: string;
  formula: string;
  value: number;
  sum?: boolean;
  strong?: boolean;
}) {
  return (
    <tr className={cn("border-t border-border", sum && "bg-muted/40")}>
      <td className={cn("py-2 pr-3", (sum || strong) && "font-bold")}>{label}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground">{formula}</td>
      <td
        className={cn(
          "py-2 text-right tabular-nums",
          (sum || strong) && "font-bold",
        )}
      >
        {formatRp(value)}
      </td>
    </tr>
  );
}

function TaxChip({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-medium">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function RatioChip({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-medium">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
