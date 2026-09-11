import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRpCompact } from "@/lib/format";
import type { Simulation } from "@/lib/cashflow/types";
import { ClientChart } from "./client-chart";
import { MoneyTick } from "./axis-tick";

export function InOutChart({ sim }: { sim: Simulation }) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    masuk: Math.round(w.cashIn),
    keluar: Math.round(w.cashOut),
  }));

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-display text-base tracking-tight">
        Cash in / cash out per minggu
      </figcaption>
      <ClientChart>
        <div className="h-[240px] w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                  name === "masuk" ? "Masuk" : "Keluar",
                ]}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="masuk" name="masuk" fill="var(--color-in)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="keluar" name="keluar" fill="var(--color-out)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
