import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { costMixOf, payPolicyOf, setCostShare } from "@/lib/cashflow/engine";
import type { PayPolicy, Project } from "@/lib/cashflow/types";
import { usePinjem } from "@/lib/cashflow/store";

export function PayPolicyPanel({ project }: { project: Project }) {
  const patchProject = usePinjem((s) => s.patchProject);
  const mix = costMixOf(project);
  const pay = payPolicyOf(project);

  const setMix = (key: "labor" | "material" | "equipment", pct: number) => {
    patchProject(project.id, { costMix: setCostShare(mix, key, pct / 100) });
  };

  const setPay = (patch: Partial<PayPolicy>) => {
    patchProject(project.id, { payPolicy: { ...pay, ...patch } });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-medium tracking-tight">Bayar ke tukang, toko, dan alat</h3>
      </div>

      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Komposisi beban
      </p>
      <Field label="Upah pekerja" value={`${Math.round(mix.labor * 100)}%`}>
        <Slider
          min={10}
          max={60}
          value={[Math.round(mix.labor * 100)]}
          onValueChange={(v) => setMix("labor", v[0] ?? 30)}
          aria-label="Porsi upah"
        />
      </Field>
      <Field label="Bahan" value={`${Math.round(mix.material * 100)}%`}>
        <Slider
          min={20}
          max={75}
          value={[Math.round(mix.material * 100)]}
          onValueChange={(v) => setMix("material", v[0] ?? 55)}
          aria-label="Porsi bahan"
        />
      </Field>
      <Field
        label="Alat & overhead"
        value={`${Math.round(mix.equipment * 100)}%`}
      >
        <Slider
          min={5}
          max={40}
          value={[Math.round(mix.equipment * 100)]}
          onValueChange={(v) => setMix("equipment", v[0] ?? 15)}
          aria-label="Porsi alat"
        />
      </Field>

      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Tempo bayar
      </p>
      <Field
        label="Pekerja"
        value={pay.laborDelayWeeks === 0 ? "Cash minggu kerja" : `${pay.laborDelayWeeks} minggu`}
      >
        <Slider
          min={0}
          max={6}
          value={[pay.laborDelayWeeks]}
          onValueChange={(v) => setPay({ laborDelayWeeks: v[0] ?? 0 })}
          aria-label="Tempo bayar pekerja"
        />
      </Field>
      <Field
        label="Bahan"
        value={pay.materialDelayWeeks === 0 ? "Cash ke toko" : `${pay.materialDelayWeeks} minggu`}
      >
        <Slider
          min={0}
          max={8}
          value={[pay.materialDelayWeeks]}
          onValueChange={(v) => setPay({ materialDelayWeeks: v[0] ?? 3 })}
          aria-label="Tempo bayar bahan"
        />
      </Field>
      <Field
        label="Alat"
        value={
          pay.equipmentDelayWeeks === 0 ? "Cash minggu kerja" : `${pay.equipmentDelayWeeks} minggu`
        }
      >
        <Slider
          min={0}
          max={6}
          value={[pay.equipmentDelayWeeks]}
          onValueChange={(v) => setPay({ equipmentDelayWeeks: v[0] ?? 0 })}
          aria-label="Tempo bayar alat"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}
