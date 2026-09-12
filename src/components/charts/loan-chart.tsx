import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function LoanChart({ sim }: { sim: Simulation }) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    pinjam: Math.round(w.loan),
    plafon: sim.loanLimit,
  }));

  return (
    <figure className="flex flex-col gap-3">
      <ChartCaption file="pinjem100-utang" className="text-base">
        Utang terpakai vs fasilitas
      </ChartCaption>
      <ClientChart>
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval={5}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={MoneyTick} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(value, name) => [
                  formatRpCompact(Number(value ?? 0)),
                  name === "pinjam" ? "Utang terpakai" : "Fasilitas",
                ]}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={sim.loanLimit}
                stroke="var(--color-loan)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="pinjam"
                name="pinjam"
                stroke="var(--color-out)"
                fill="var(--color-out)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              {chartBrush()}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
