import { useRef, type ReactNode } from "react";
import { Brush } from "recharts";
import { saveChartPng } from "@/lib/chart-export";
import { cn } from "@/lib/utils";

export function ChartCaption({
  children,
  file,
  className,
}: {
  children: ReactNode;
  file: string;
  className?: string;
}) {
  const btn = useRef<HTMLButtonElement>(null);

  return (
    <figcaption className="flex items-start justify-between gap-3">
      <span className={cn("min-w-0 text-sm font-medium tracking-tight", className)}>
        {children}
      </span>
      <button
        ref={btn}
        type="button"
        className="min-h-11 shrink-0 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => {
          const figure = btn.current?.closest("figure") ?? null;
          void saveChartPng(figure, file).catch(() => undefined);
        }}
      >
        Simpan
      </button>
    </figcaption>
  );
}

export function chartBrush() {
  return (
    <Brush
      dataKey="label"
      height={22}
      travellerWidth={10}
      stroke="var(--color-muted-foreground)"
      fill="var(--color-muted)"
    />
  );
}
