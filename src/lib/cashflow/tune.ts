import { simulate, applyStartPreset } from "./engine";
import { DEFAULT_COMPANY, satuPasarProjects, berbagaiPasarProjects } from "./scenarios";
import type { StartPreset } from "./types";

const presets: StartPreset[] = ["bersamaan", "bergelombang", "numpuk-q4"];

function show(label: string, company = DEFAULT_COMPANY) {
  const sim = simulate(
    company,
    label.startsWith("satu")
      ? applyStartPreset(satuPasarProjects(), label.split(" ")[1] as StartPreset)
      : applyStartPreset(berbagaiPasarProjects(), label.split(" ")[1] as StartPreset),
  );
  const peak = (sim.peakLoan / 1e6).toFixed(1);
  const minA = (sim.minAccum / 1e6).toFixed(1);
  const minC = (sim.minCash / 1e6).toFixed(1);
  const ni = (sim.income.netProfit / 1e6).toFixed(1);
  const der = sim.ratios.der.toFixed(2);
  console.log(
    `${label.padEnd(28)} zone=${sim.zone.padEnd(6)} peak=${peak}jt minAccum=${minA} minCash=${minC} NI=${ni} DER=${der} breach=${sim.breached}`,
  );
}

for (const p of presets) {
  show(`satu ${p}`);
  show(`bagai ${p}`);
}

const one = simulate(DEFAULT_COMPANY, [satuPasarProjects()[0]!]);
console.log(
  `single sari                zone=${one.zone} peak=${(one.peakLoan / 1e6).toFixed(1)} minAccum=${(one.minAccum / 1e6).toFixed(1)} NI=${(one.income.netProfit / 1e6).toFixed(1)}`,
);
