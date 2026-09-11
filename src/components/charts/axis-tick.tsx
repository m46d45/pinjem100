import { formatAxisJt } from "@/lib/format";

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value: number };
};

export function MoneyTick({ x = 0, y = 0, payload }: TickProps) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={11}
      fill="var(--color-muted-foreground)"
    >
      {formatAxisJt(payload?.value ?? 0)}
    </text>
  );
}
