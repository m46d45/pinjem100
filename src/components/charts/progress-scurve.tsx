import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Simulation } from "@/lib/cashflow/types";
import { weekShort } from "@/lib/format";
import { ClientChart } from "./client-chart";
import { chartBrush, ChartCaption } from "./chart-tools";

export function ProgressScurve({
  sim,
  projectId,
  fromWeek,
  toWeek,
}: {
  sim: Simulation;
  projectId: string;
  fromWeek?: number;
  toWeek?: number;
}) {
  const weeks = sim.weeks.filter((w) => {
    if (fromWeek != null && w.week < fromWeek) return false;
    if (toWeek != null && w.week > toWeek) return false;
    return true;
  });
  const data = weeks.map((w) => ({
    label: weekShort(w.week),
    kerja: Math.round((w.projectWork[projectId] ?? 0) * 1000) / 10,
  }));

  return (
    <figure className="flex flex-col gap-3">
      <ChartCaption file="pinjem100-kurva-s-kerja" className="font-display text-base">
        Kurva S progres kerja
      </ChartCaption>
      <ClientChart>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={24}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0).toFixed(0)}%`, "Progres"]}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="kerja"
                stroke="var(--color-loan)"
                strokeWidth={2}
                dot={false}
              />
              {chartBrush()}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
