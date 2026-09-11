import { cn } from "@/lib/utils";
import { MODE_LABEL, PRESET_BLURB, PRESET_LABEL } from "@/lib/cashflow/types";
import type { PortfolioMode, StartPreset } from "@/lib/cashflow/types";
import { usePinjem } from "@/lib/cashflow/store";

const MODES: PortfolioMode[] = ["satu-pasar", "berbagai-pasar"];
const PRESETS: StartPreset[] = ["bersamaan", "bergelombang", "numpuk-q4"];

export function PresetBar() {
  const mode = usePinjem((s) => s.mode);
  const preset = usePinjem((s) => s.preset);
  const setMode = usePinjem((s) => s.setMode);
  const setPreset = usePinjem((s) => s.setPreset);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Pasar</p>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-sm transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Mulai di tahun anggaran
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={cn(
                "min-h-11 rounded-lg px-2 py-2 text-sm transition-colors",
                preset === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              {PRESET_LABEL[p]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{PRESET_BLURB[preset]}</p>
      </div>
    </div>
  );
}
