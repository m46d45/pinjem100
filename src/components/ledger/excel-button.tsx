import type { Simulation } from "@/lib/cashflow/types";
import { downloadSimExcel } from "@/lib/excel-export";

export function ExcelButton({
  sim,
  file,
}: {
  sim: Simulation;
  file: string;
}) {
  return (
    <button
      type="button"
      className="min-h-11 shrink-0 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={() => downloadSimExcel(sim, file)}
    >
      Excel
    </button>
  );
}
