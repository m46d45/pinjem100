import {
  Area,
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
import { MoneyTick } from "./axis-tick";

export function CashPositionChart({ sim, title }: { sim: Simulation; title?: string }) {
  const data = sim.weeks.map((w) => ({
    label: `M${w.week + 1}`,
    plus: Math.round(Math.max(0, w.accumulatedOps)),
    minus: Math.round(Math.min(0, w.accumulatedOps)),
    accum: Math.round(w.accumulatedOps),
    kas: Math.round(w.cash),
    pinjam: Math.round(w.loan),
    cadangan: Math.round(w.reserve),
  }));

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-base font-medium tracking-tight">
        {title ?? "Akumulasi kas"}
      </figcaption>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-in/40" />
          Surplus kumulatif
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-out/40" />
          Defisit kumulatif
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-in" />
          Kas di tangan
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-px w-4 border-t border-dashed border-loan" />
          Utang terpakai
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-foreground" />
          Cadangan
        </li>
      </ul>
      <ClientChart height={300}>
        <div className="h-[260px] w-full sm:h-[300px]">
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
                  if (name === "accum") return [formatRpCompact(n), "Kas kumulatif operasional"];
                  if (name === "kas") return [formatRpCompact(n), "Kas di tangan (setelah utang)"];
                  if (name === "pinjam") return [formatRpCompact(n), "Utang terpakai"];
                  if (name === "cadangan") return [formatRpCompact(n), "Cadangan"];
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
              <Area
                type="monotone"
                dataKey="plus"
                stroke="none"
                fill="var(--color-in)"
                fillOpacity={0.14}
                tooltipType="none"
                legendType="none"
              />
              <Area
                type="monotone"
                dataKey="minus"
                stroke="none"
                fill="var(--color-out)"
                fillOpacity={0.2}
                tooltipType="none"
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="accum"
                name="accum"
                stroke="var(--color-loan)"
                dot={false}
                strokeWidth={2.2}
              />
              <Line
                type="monotone"
                dataKey="kas"
                name="kas"
                stroke="var(--color-in)"
                dot={false}
                strokeWidth={1.8}
              />
              <Line
                type="monotone"
                dataKey="pinjam"
                name="pinjam"
                stroke="var(--color-loan)"
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="cadangan"
                name="cadangan"
                stroke="var(--color-foreground)"
                dot={false}
                strokeWidth={1.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ClientChart>
    </figure>
  );
}
