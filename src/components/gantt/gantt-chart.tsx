import { weekShort } from "@/lib/format";
import { projectDuration } from "@/lib/cashflow/engine";
import type { Project } from "@/lib/cashflow/types";
import { MARKET_LABEL } from "@/lib/cashflow/types";
import { cn } from "@/lib/utils";

const MARKET_TONE: Record<string, string> = {
  pemda: "bg-loan/80",
  rumah: "bg-primary/80",
  subkon: "bg-destructive/70",
};

export function PortfolioGantt({
  projects,
  horizon = 52,
}: {
  projects: Project[];
  horizon?: number;
}) {
  const ticks = Array.from({ length: Math.ceil(horizon / 4) }, (_, i) => i * 4);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-medium tracking-tight">Gantt</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-2 flex pl-36">
            {ticks.map((w) => (
              <div
                key={w}
                className="text-[10px] text-muted-foreground"
                style={{ width: `${(4 / horizon) * 100}%` }}
              >
                {weekShort(w)}
              </div>
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {projects.map((p) => {
              const duration = projectDuration(p);
              const left = (p.startWeek / horizon) * 100;
              const width = (duration / horizon) * 100;
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-36 shrink-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {MARKET_LABEL[p.market]}
                    </p>
                  </div>
                  <div className="relative h-8 flex-1 rounded-md bg-muted">
                    <div
                      className={cn(
                        "absolute top-1 h-6 rounded-sm",
                        p.enabled ? MARKET_TONE[p.market] : "bg-border",
                      )}
                      style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProjectGantt({ project }: { project: Project }) {
  const duration = Math.max(projectDuration(project), 1);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-medium tracking-tight">Gantt pekerjaan</h3>
      <ul className="flex flex-col gap-2">
        {project.activities.map((a) => {
          const left = (a.offsetWeeks / duration) * 100;
          const width = (a.durationWeeks / duration) * 100;
          return (
            <li key={a.id} className="flex items-center gap-3">
              <p className="w-36 shrink-0 truncate text-sm">{a.name}</p>
              <div className="relative h-7 flex-1 rounded-md bg-muted">
                <div
                  className="absolute top-1 h-5 rounded-sm bg-primary/80"
                  style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
