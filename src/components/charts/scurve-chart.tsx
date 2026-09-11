import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRpCompact } from "@/lib/format";
import type { Simulation } from "@/lib/cashflow/types";
import { ClientChart } from "./client-chart";
import { MoneyTick } from "./axis-tick";

export function ScurveChart({ sim }: { sim: Simulation }) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    masuk: Math.round(w.cumulativeIn),
    keluar: Math.round(w.cumulativeOut),
  }));

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-display text-base tracking-tight">
        Kurva S kas — kumulatif masuk vs keluar
      </figcaption>
      <ClientChart>
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval={5}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={MoneyTick} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                formatter={(value, name) => [
                  formatRpCompact(Number(value ?? 0)),
                  name === "masuk" ? "Kumulatif masuk" : "Kumulatif keluar",
                ]}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="masuk"
                name="masuk"
                stroke="var(--color-in)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="keluar"
                name="keluar"
                stroke="var(--color-out)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
      <p className="text-xs text-muted-foreground">
        Kalau garis keluar di atas garis masuk, kontraktor sedang pre-finance — itu sebabnya pinjam.
      </p>
    </figure>
  );
}
