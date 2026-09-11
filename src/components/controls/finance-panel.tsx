import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePinjem } from "@/lib/cashflow/store";
import { LENDER_LABEL, SCHEME_LABEL, type DebtScheme, type Lender } from "@/lib/cashflow/types";
import { formatRpCompact, weekLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FinancePanel() {
  const company = usePinjem((s) => s.company);
  const patch = usePinjem((s) => s.patchCompany);
  const resetLesson = usePinjem((s) => s.resetLesson);
  const year = company.fiscalYear;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-medium tracking-tight">Ekuitas dan utang</h3>
      </div>

      <Field label="Equity (Ekuitas / Modal sendiri)" value={formatRpCompact(company.cashStart)}>
        <Slider
          min={20_000_000}
          max={200_000_000}
          step={5_000_000}
          value={[company.cashStart]}
          onValueChange={(v) => patch({ cashStart: v[0] ?? 70_000_000 })}
          aria-label="Ekuitas"
        />
      </Field>

      <Field
        label="Debt facility (Fasilitas utang / Plafon KMK)"
        value={formatRpCompact(company.loanLimit)}
      >
        <Slider
          min={30_000_000}
          max={300_000_000}
          step={10_000_000}
          value={[company.loanLimit]}
          onValueChange={(v) => patch({ loanLimit: v[0] ?? 100_000_000 })}
          aria-label="Fasilitas utang"
        />
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Sumber</p>
        <div className="grid grid-cols-2 gap-2">
          {( ["bank", "rekan"] as Lender[]).map((l) => (
            <button
              key={l}
              type="button"
              className={cn(
                "min-h-11 rounded-lg px-3 text-sm",
                company.lender === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
              onClick={() =>
                patch({
                  lender: l,
                  disbursementLagWeeks: l === "bank" ? 2 : 0,
                })
              }
            >
              {LENDER_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Disbursement lag (Lag pencairan)"
        value={
          company.disbursementLagWeeks === 0
            ? "Cair minggu yang sama"
            : `${company.disbursementLagWeeks} minggu`
        }
      >
        <Slider
          min={0}
          max={6}
          step={1}
          value={[company.disbursementLagWeeks]}
          onValueChange={(v) => patch({ disbursementLagWeeks: v[0] ?? 0 })}
          aria-label="Lag pencairan"
        />
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Skema</p>
        <div className="grid gap-2">
          {( ["revolving", "term"] as DebtScheme[]).map((s) => (
            <button
              key={s}
              type="button"
              className={cn(
                "min-h-11 rounded-lg px-3 text-left text-sm",
                company.debtScheme === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
              onClick={() => patch({ debtScheme: s })}
            >
              {SCHEME_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {company.debtScheme === "term" ? (
        <div className="flex flex-col gap-4 rounded-lg bg-muted/60 p-3">
          <Field label="Minggu pencairan" value={weekLabel(company.termDrawWeek, year)}>
            <Slider
              min={0}
              max={44}
              value={[company.termDrawWeek]}
              onValueChange={(v) => patch({ termDrawWeek: v[0] ?? 8 })}
            />
          </Field>
          <Field
            label="Jumlah ditarik (0 = pakai plafon)"
            value={
              company.termDrawAmount > 0
                ? formatRpCompact(company.termDrawAmount)
                : `Plafon ${formatRpCompact(company.loanLimit)}`
            }
          >
            <Slider
              min={0}
              max={300_000_000}
              step={10_000_000}
              value={[company.termDrawAmount]}
              onValueChange={(v) => patch({ termDrawAmount: v[0] ?? 0 })}
            />
          </Field>
          <Field label="Jumlah termyn" value={`${company.termCount} kali`}>
            <Slider
              min={2}
              max={12}
              value={[company.termCount]}
              onValueChange={(v) => patch({ termCount: v[0] ?? 4 })}
            />
          </Field>
          <Field label="Termyn pertama" value={weekLabel(company.termStartWeek, year)}>
            <Slider
              min={0}
              max={48}
              value={[company.termStartWeek]}
              onValueChange={(v) => patch({ termStartWeek: v[0] ?? 22 })}
            />
          </Field>
          <Field label="Jarak termyn" value={`${company.termIntervalWeeks} minggu`}>
            <Slider
              min={2}
              max={8}
              value={[company.termIntervalWeeks]}
              onValueChange={(v) => patch({ termIntervalWeeks: v[0] ?? 4 })}
            />
          </Field>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Bunga 12% per tahun, dihitung mingguan.
      </p>
      <Button type="button" variant="outline" onClick={resetLesson}>
        Kembalikan data awal
      </Button>
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
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}
