import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { payPolicyOf, projectDuration, rabRollup } from "@/lib/cashflow/engine";
import { MARKET_LABEL } from "@/lib/cashflow/types";
import type { Project } from "@/lib/cashflow/types";
import { formatRpCompact, weekLabel } from "@/lib/format";
import { usePinjem } from "@/lib/cashflow/store";

export function ProjectCard({ project }: { project: Project }) {
  const year = usePinjem((s) => s.company.fiscalYear);
  const ppnRate = usePinjem((s) => s.company.ppnRate);
  const setStartWeek = usePinjem((s) => s.setStartWeek);
  const setEnabled = usePinjem((s) => s.setEnabled);
  const setSelected = usePinjem((s) => s.setSelected);
  const selectedId = usePinjem((s) => s.selectedId);
  const duration = projectDuration(project);
  const roll = rabRollup(project, ppnRate);

  return (
    <article
      className={`rounded-lg bg-muted/60 p-4 ${selectedId === project.id ? "ring-1 ring-primary" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => setSelected(project.id)}
        >
          <p className="truncate font-medium">{project.name}</p>
          <p className="truncate text-xs text-muted-foreground">{project.owner}</p>
        </button>
        <Switch
          checked={project.enabled}
          onCheckedChange={(on) => setEnabled(project.id, on)}
          aria-label={`Aktifkan ${project.name}`}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="muted">{MARKET_LABEL[project.market]}</Badge>
        <Badge variant="muted">{formatRpCompact(roll.kontrak)}</Badge>
        <Badge variant="muted">{duration} minggu</Badge>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Mulai</span>
          <span className="tabular-nums">{weekLabel(project.startWeek, year)}</span>
        </div>
        <Slider
          min={0}
          max={44}
          step={1}
          value={[project.startWeek]}
          onValueChange={(v) => setStartWeek(project.id, v[0] ?? 0)}
          aria-label={`Minggu mulai ${project.name}`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Biaya {formatRpCompact(roll.pokok)} · keuntungan 10% · tempo bahan{" "}
        {payPolicyOf(project).materialDelayWeeks} minggu
      </p>
    </article>
  );
}
