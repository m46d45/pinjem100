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
import { weekTickInterval } from "@/lib/format";
import { ClientChart } from "./client-chart";

export function ProgressScurve({
  sim,
  projectId,
}: {
  sim: Simulation;
  projectId: string;
}) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    kerja: Math.round((w.projectWork[projectId] ?? 0) * 1000) / 10,
  }));

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-display text-base tracking-tight">
        Kurva S progres kerja
      </figcaption>
      <ClientChart>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval={weekTickInterval(data.length)}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
