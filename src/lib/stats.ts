import { createServerFn } from "@tanstack/react-start";

const KINDS = new Set(["view", "sim"]);

export const recordLabEvent = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const d = (input ?? {}) as Record<string, unknown>;
    const kind = String(d.kind ?? "");
    if (!KINDS.has(kind)) throw new Error("invalid kind");
    return {
      kind,
      path: String(d.path ?? "").slice(0, 80),
      zone: String(d.zone ?? "").slice(0, 16),
      preset: String(d.preset ?? "").slice(0, 32),
      mode: String(d.mode ?? "").slice(0, 32),
    };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into lab_events (kind, path, zone, preset, mode)
      values (${data.kind}, ${data.path || null}, ${data.zone || null}, ${data.preset || null}, ${data.mode || null})
    `;
    return { ok: true as const };
  });

export type LabStats = {
  views: number;
  sims: number;
  hijau: number;
  kuning: number;
  merah: number;
};

export const getLabStats = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ kind: string; zone: string | null; n: number }>`
    select kind, zone, count(*)::int as n from lab_events group by kind, zone
  `;
  const stats: LabStats = { views: 0, sims: 0, hijau: 0, kuning: 0, merah: 0 };
  for (const row of rows) {
    if (row.kind === "view") stats.views += row.n;
    if (row.kind === "sim") {
      stats.sims += row.n;
      if (row.zone === "hijau") stats.hijau += row.n;
      if (row.zone === "kuning") stats.kuning += row.n;
      if (row.zone === "merah") stats.merah += row.n;
    }
  }
  return stats;
});
