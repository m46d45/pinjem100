import { rabKind, rabRollup } from "@/lib/cashflow/engine";
import type { Project } from "@/lib/cashflow/types";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RabTable({ project, ppnRate }: { project: Project; ppnRate: number }) {
  const roll = rabRollup(project, ppnRate);
  const langsung = project.rab.filter((i) => rabKind(i) === "langsung");
  const tidak = project.rab.filter((i) => rabKind(i) === "tidak-langsung");
  const pct = Math.round(ppnRate * 100);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="px-5 pt-5 text-base font-medium tracking-tight">RAB</h3>
      <table className="w-full min-w-[480px] text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-2 font-medium">Uraian</th>
            <th className="px-5 py-2 font-medium">Aktivitas</th>
            <th className="px-5 py-2 text-right font-medium">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <Section label="A. Biaya langsung" />
          {langsung.map((item) => (
            <ItemRow
              key={item.id}
              name={item.name}
              activity={project.activities.find((a) => a.id === item.activityId)?.name}
              amount={item.amount}
            />
          ))}
          <SumRow label="Subtotal biaya langsung" amount={roll.langsung} />

          <Section label="B. Biaya tidak langsung" />
          {tidak.map((item) => (
            <ItemRow
              key={item.id}
              name={item.name}
              activity={project.activities.find((a) => a.id === item.activityId)?.name}
              amount={item.amount}
            />
          ))}
          <SumRow label="Subtotal biaya tidak langsung" amount={roll.overhead} />

          <SumRow
            label="C. Biaya total (A + B)"
            amount={roll.pokok}
            hint="Belum termasuk keuntungan dan PPN"
            tone
          />
          <SumRow
            label="D. Keuntungan 10%"
            amount={roll.keuntungan}
            hint="10% × C, sebelum PPN"
          />
          <SumRow
            label="E. Biaya total & keuntungan (C + D)"
            amount={roll.total}
            hint="DPP — nilai kontrak tanpa PPN"
            tone
          />
          <SumRow
            label={`F. PPN ${pct}%`}
            amount={roll.ppn}
            hint={`${pct}% × E`}
          />
          <SumRow
            label="G. Nilai kontrak (E + F)"
            amount={roll.kontrak}
            hint="Biaya total & keuntungan termasuk PPN"
            tone
          />
        </tbody>
      </table>
    </div>
  );
}

function Section({ label }: { label: string }) {
  return (
    <tr className="border-t border-border bg-muted/50">
      <td className="px-5 py-2 font-medium" colSpan={3}>
        {label}
      </td>
    </tr>
  );
}

function ItemRow({
  name,
  activity,
  amount,
}: {
  name: string;
  activity?: string;
  amount: number;
}) {
  return (
    <tr className="border-t border-border/80">
      <td className="px-5 py-1.5 pl-8">{name}</td>
      <td className="px-5 py-1.5 text-muted-foreground">{activity ?? "—"}</td>
      <td className="px-5 py-1.5 text-right tabular-nums">{formatRp(amount)}</td>
    </tr>
  );
}

function SumRow({
  label,
  amount,
  hint,
  tone,
}: {
  label: string;
  amount: number;
  hint?: string;
  tone?: boolean;
}) {
  return (
    <tr className={cn("border-t border-border", tone && "bg-muted/70")}>
      <td className="px-5 py-2 font-bold">
        {label}
        {hint ? (
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </td>
      <td />
      <td className="px-5 py-2 text-right font-bold tabular-nums">{formatRp(amount)}</td>
    </tr>
  );
}
