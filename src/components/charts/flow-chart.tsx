import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRpCompact, weekShort, weekTickInterval } from "@/lib/format";
import { ClientChart } from "./client-chart";
import { chartBrush, ChartCaption } from "./chart-tools";
import { MoneyTick } from "./axis-tick";
import { cn } from "@/lib/utils";

export type FlowRow = {
  week: number;
  earning: number;
  receipt: number;
  expense: number;
  disbursement: number;
  accum: number;
};

export function FlowLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-sm bg-in" />
        Penerimaan kas — batang biru
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block w-4 border-t border-dashed border-in" />
        Pendapatan — garis putus biru
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-sm bg-out" />
        Pengeluaran kas — batang merah
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block w-4 border-t border-dashed border-out" />
        Beban — garis putus merah
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-4 bg-foreground" />
        Kas kumulatif
      </li>
    </ul>
  );
}

export function FlowChart({
  rows,
  title,
  height = 220,
  caption,
  yMax,
  showClue = false,
  showEnd = true,
}: {
  rows: FlowRow[];
  title: string;
  height?: number;
  caption?: string;
  yMax?: number;
  showClue?: boolean;
  showEnd?: boolean;
}) {
  const auto = Math.max(
    1,
    ...rows.flatMap((r) => [
      r.earning,
      r.receipt,
      r.expense,
      r.disbursement,
      Math.abs(r.accum),
    ]),
  );
  const max = Math.ceil((yMax ?? auto) * 1.05);
  const data = rows.map((r) => ({
    label: `M${r.week + 1}`,
    earning: Math.round(r.earning),
    receipt: Math.round(r.receipt),
    expense: -Math.round(r.expense),
    disbursement: -Math.round(r.disbursement),
    plus: Math.round(Math.max(0, r.accum)),
    minus: Math.round(Math.min(0, r.accum)),
    accum: Math.round(r.accum),
  }));

  let laba = 0;
  let kas = 0;
  let minAccum = 0;
  let minWeek = 0;
  for (const r of rows) {
    laba += r.earning - r.expense;
    kas += r.receipt - r.disbursement;
    if (r.accum < minAccum) {
      minAccum = r.accum;
      minWeek = r.week;
    }
  }

  const clueX = `M${minWeek + 1}`;
  const showHole = showClue && minAccum < -1;

  return (
    <figure className="flex flex-col gap-2">
      <ChartCaption file={`pinjem100-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        {title}
      </ChartCaption>
      <ClientChart height={height}>
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval={weekTickInterval(data.length)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={MoneyTick}
                axisLine={false}
                tickLine={false}
                width={52}
                domain={[-max, max]}
              />
              <Tooltip
                formatter={(value, name) => {
                  const n = Number(value ?? 0);
                  const abs = formatRpCompact(Math.abs(n));
                  if (name === "receipt") return [abs, "Receipt (Penerimaan)"];
                  if (name === "disbursement") return [abs, "Disbursement (Pengeluaran)"];
                  if (name === "earning") return [abs, "Earning (Pendapatan)"];
                  if (name === "expense") return [abs, "Expense (Beban)"];
                  if (name === "accum") return [formatRpCompact(n), "Kas kumulatif"];
                  return [formatRpCompact(n), String(name)];
                }}
                labelFormatter={(l) => `Minggu ${String(l).replace("M", "")}`}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <ReferenceLine y={0} stroke="var(--color-foreground)" strokeOpacity={0.4} />
              <Bar
                dataKey="receipt"
                name="receipt"
                fill="var(--color-in)"
                fillOpacity={0.85}
                maxBarSize={8}
              />
              <Bar
                dataKey="disbursement"
                name="disbursement"
                fill="var(--color-out)"
                fillOpacity={0.85}
                maxBarSize={8}
              />
              <Area
                type="monotone"
                dataKey="plus"
                name="plus"
                stroke="none"
                fill="var(--color-in)"
                fillOpacity={0.1}
                legendType="none"
                tooltipType="none"
              />
              <Area
                type="monotone"
                dataKey="minus"
                name="minus"
                stroke="none"
                fill="var(--color-out)"
                fillOpacity={0.14}
                legendType="none"
                tooltipType="none"
              />
              <Line
                type="monotone"
                dataKey="earning"
                name="earning"
                stroke="var(--color-in)"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={1.75}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke="var(--color-out)"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={1.75}
              />
              <Line
                type="monotone"
                dataKey="accum"
                name="accum"
                stroke="var(--color-foreground)"
                dot={false}
                strokeWidth={2}
              />
              {showHole ? (
                <>
                  <ReferenceLine
                    x={clueX}
                    stroke="var(--color-foreground)"
                    strokeDasharray="2 3"
                    strokeOpacity={0.35}
                  />
                  <ReferenceDot
                    x={clueX}
                    y={Math.round(minAccum)}
                    r={4}
                    fill="var(--color-foreground)"
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                </>
              ) : null}
              {chartBrush()}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
      {showHole ? (
        <p className="text-xs font-medium">
          Clue pinjam: {formatRpCompact(minAccum)} pada {weekShort(minWeek)}
        </p>
      ) : null}
      {showEnd ? (
        <div className="grid grid-cols-2 gap-3">
          <EndStat
            label="Laba (pendapatan − beban)"
            hint="Catatan kertas"
            value={laba}
          />
          <EndStat
            label="Kas (penerimaan − pengeluaran)"
            hint="Uang yang bergerak"
            value={kas}
            emphasizeNegative
          />
        </div>
      ) : null}
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
    </figure>
  );
}

function EndStat({
  label,
  hint,
  value,
  emphasizeNegative = false,
}: {
  label: string;
  hint: string;
  value: number;
  emphasizeNegative?: boolean;
}) {
  const neg = emphasizeNegative && value < -1;
  return (
    <div className="rounded-lg bg-muted/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      <p className={cn("tabular-nums text-sm font-medium", neg && "text-destructive")}>
        {formatRpCompact(value)}
      </p>
    </div>
  );
}
