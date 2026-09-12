import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRpCompact } from "@/lib/format";
import type { Simulation } from "@/lib/cashflow/types";
import { ClientChart } from "./client-chart";
import { chartBrush, ChartCaption } from "./chart-tools";
import { MoneyTick } from "./axis-tick";

export function ReserveFlowChart({ sim }: { sim: Simulation }) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    cair: Math.round(w.liquidate),
    parkir: -Math.round(w.park),
    cadangan: Math.round(w.reserve),
  }));

  return (
    <figure className="flex flex-col gap-3">
      <ChartCaption file="pinjem100-cadangan" className="text-base">
        Keluar ke cadangan, cair dari cadangan
      </ChartCaption>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-out" />
          Parkir (keluar dari kas proyek)
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-in" />
          Cair (masuk ke kas proyek)
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-foreground" />
          Saldo cadangan
        </li>
      </ul>
      <ClientChart height={260}>
        <div className="h-[240px] w-full sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval={5}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={MoneyTick} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                formatter={(value, name) => {
                  const n = Number(value ?? 0);
                  if (name === "parkir") return [formatRpCompact(Math.abs(n)), "Parkir ke cadangan"];
                  if (name === "cair") return [formatRpCompact(n), "Cair dari cadangan"];
                  if (name === "cadangan") return [formatRpCompact(n), "Saldo cadangan"];
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
              <Bar dataKey="cair" name="cair" fill="var(--color-in)" fillOpacity={0.85} maxBarSize={8} />
              <Bar dataKey="parkir" name="parkir" fill="var(--color-out)" fillOpacity={0.85} maxBarSize={8} />
              <Line
                type="monotone"
                dataKey="cadangan"
                name="cadangan"
                stroke="var(--color-foreground)"
                dot={false}
                strokeWidth={1.8}
              />
              {chartBrush()}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
