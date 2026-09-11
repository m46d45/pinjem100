import type { IncomeStatement, Ratios } from "@/lib/cashflow/types";
import { formatPct, formatRatio } from "@/lib/cashflow/engine";
import { formatRp } from "@/lib/format";

export function IncomeStatementTable({
  income,
  ratios,
}: {
  income: IncomeStatement;
  ratios: Ratios;
}) {
  const rows: { label: string; value: string; hint?: string; strong?: boolean }[] = [
    { label: "Revenue (Pendapatan / DPP)", value: formatRp(income.revenue), hint: "Nilai kontrak tanpa PPN" },
    { label: "− Cost of sales (Beban pokok)", value: formatRp(income.cogs) },
    { label: "= Gross profit (Laba kotor)", value: formatRp(income.grossProfit), strong: true },
    { label: "EBIT (Laba usaha)", value: formatRp(income.ebit) },
    { label: "− Interest (Beban bunga)", value: formatRp(income.interest) },
    { label: "= EBT (Laba sebelum pajak)", value: formatRp(income.ebt) },
    { label: "− Income tax / PPh Final 4(2)", value: formatRp(income.taxPph), hint: "1,75% × DPP" },
    { label: "= Net profit (Laba bersih)", value: formatRp(income.netProfit), strong: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-medium tracking-tight">Laporan laba rugi</h3>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border">
              <td className={`py-2 pr-3 ${r.strong ? "font-medium" : ""}`}>
                {r.label}
                {r.hint ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{r.hint}</span>
                ) : null}
              </td>
              <td className={`py-2 text-right tabular-nums ${r.strong ? "font-medium" : ""}`}>
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-2 sm:grid-cols-2">
        <TaxChip
          label="Output VAT (PPN Keluaran)"
          value={formatRp(income.ppnKeluaran)}
        />
        <TaxChip label="Input VAT (PPN Masukan)" value={formatRp(income.ppnMasukan)} />
        <TaxChip label="PPN net ke negara" value={formatRp(income.ppnNet)} />
        <TaxChip label="PPh Final 4(2)" value={formatRp(income.taxPph)} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <RatioChip label="DER" hint="Utang ÷ ekuitas" value={formatRatio(ratios.der)} />
        <RatioChip label="Debt ratio" hint="Rasio utang" value={formatPct(ratios.debtRatio)} />
        <RatioChip label="Interest coverage" hint="Liputan bunga" value={formatRatio(ratios.interestCoverage, 1)} />
        <RatioChip label="Net margin" hint="Margin laba bersih" value={formatPct(ratios.netMargin)} />
        <RatioChip label="ROE" hint="Imbal hasil ekuitas" value={formatPct(ratios.roe)} />
      </div>
    </div>
  );
}

function TaxChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-medium">{value}</p>
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
