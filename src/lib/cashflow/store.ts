import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyStartPreset, simulate } from "./engine";
import { DEFAULT_COMPANY, berbagaiPasarProjects, satuPasarProjects } from "./scenarios";
import {
  DEFAULT_COST_MIX,
  DEFAULT_PAY_POLICY,
  type Company,
  type PaymentTerms,
  type PortfolioMode,
  type Project,
  type Simulation,
  type StartPreset,
  type Zone,
} from "./types";

export type Journal = {
  views: number;
  simCount: number;
  lastZone: Zone | null;
  hijau: number;
  kuning: number;
  merah: number;
  usedBersamaan: boolean;
  usedBergelombang: boolean;
  openedProyek: boolean;
  openedPortofolio: boolean;
  openedAkumulasi: boolean;
};

export type PinjemState = {
  company: Company;
  mode: PortfolioMode;
  preset: StartPreset;
  satu: Project[];
  berbagai: Project[];
  selectedId: string;
  journal: Journal;
};

type PinjemActions = {
  setMode: (mode: PortfolioMode) => void;
  setPreset: (preset: StartPreset) => void;
  setStartWeek: (id: string, week: number) => void;
  setEnabled: (id: string, enabled: boolean) => void;
  setSelected: (id: string) => void;
  patchProject: (id: string, patch: Partial<Project>) => void;
  patchTerms: (id: string, patch: Partial<PaymentTerms>) => void;
  patchCompany: (patch: Partial<Company>) => void;
  markJournal: (patch: Partial<Journal>) => void;
  bumpView: () => void;
  bumpSim: (zone: Zone) => void;
  resetLesson: () => void;
};

function hydrateProject(p: Project): Project {
  const terms = { ...p.terms };
  if (p.market === "rumah" && terms.umPercent === 0.18) terms.umPercent = 0.15;
  return {
    ...p,
    terms,
    costMix: { ...DEFAULT_COST_MIX, ...(p.costMix ?? {}) },
    payPolicy: { ...DEFAULT_PAY_POLICY, ...(p.payPolicy ?? {}) },
  };
}

function hydrateList(list: Project[] | undefined, fallback: Project[]): Project[] {
  if (!Array.isArray(list) || !list[0]?.rab?.length) return fallback;
  const notesById = Object.fromEntries(fallback.map((p) => [p.id, p.notes]));
  return list.map((p) =>
    hydrateProject({ ...p, notes: notesById[p.id] ?? p.notes }),
  );
}

const emptyJournal = (): Journal => ({
  views: 0,
  simCount: 0,
  lastZone: null,
  hijau: 0,
  kuning: 0,
  merah: 0,
  usedBersamaan: true,
  usedBergelombang: false,
  openedProyek: false,
  openedPortofolio: false,
  openedAkumulasi: false,
});

const initial = (): PinjemState => ({
  company: { ...DEFAULT_COMPANY },
  mode: "satu-pasar",
  preset: "bersamaan",
  satu: satuPasarProjects(),
  berbagai: berbagaiPasarProjects(),
  selectedId: "sari",
  journal: emptyJournal(),
});

function mapProjects(state: PinjemState, fn: (p: Project) => Project): PinjemState {
  if (state.mode === "satu-pasar") return { ...state, satu: state.satu.map(fn) };
  return { ...state, berbagai: state.berbagai.map(fn) };
}

export const usePinjem = create<PinjemState & PinjemActions>()(
  persist(
    (set) => ({
      ...initial(),
      setMode: (mode) =>
        set((s) => {
          const list = mode === "satu-pasar" ? s.satu : s.berbagai;
          const selectedId = list.some((p) => p.id === s.selectedId)
            ? s.selectedId
            : (list[0]?.id ?? s.selectedId);
          return { mode, selectedId };
        }),
      setPreset: (preset) =>
        set((s) => ({
          preset,
          satu: applyStartPreset(s.satu, preset),
          berbagai: applyStartPreset(s.berbagai, preset),
          journal: {
            ...s.journal,
            usedBersamaan: s.journal.usedBersamaan || preset === "bersamaan",
            usedBergelombang: s.journal.usedBergelombang || preset === "bergelombang",
          },
        })),
      setStartWeek: (id, week) =>
        set((s) =>
          mapProjects(s, (p) =>
            p.id === id ? { ...p, startWeek: Math.max(0, Math.min(44, Math.round(week))) } : p,
          ),
        ),
      setEnabled: (id, enabled) =>
        set((s) => mapProjects(s, (p) => (p.id === id ? { ...p, enabled } : p))),
      setSelected: (selectedId) => set({ selectedId }),
      patchProject: (id, patch) =>
        set((s) => mapProjects(s, (p) => (p.id === id ? { ...p, ...patch, id: p.id } : p))),
      patchTerms: (id, patch) =>
        set((s) =>
          mapProjects(s, (p) => (p.id === id ? { ...p, terms: { ...p.terms, ...patch } } : p)),
        ),
      patchCompany: (patch) => set((s) => ({ company: { ...s.company, ...patch } })),
      markJournal: (patch) => set((s) => ({ journal: { ...s.journal, ...patch } })),
      bumpView: () =>
        set((s) => ({ journal: { ...s.journal, views: s.journal.views + 1 } })),
      bumpSim: (zone) =>
        set((s) => ({
          journal: {
            ...s.journal,
            simCount: s.journal.simCount + 1,
            lastZone: zone,
            hijau: s.journal.hijau + (zone === "hijau" ? 1 : 0),
            kuning: s.journal.kuning + (zone === "kuning" ? 1 : 0),
            merah: s.journal.merah + (zone === "merah" ? 1 : 0),
          },
        })),
      resetLesson: () => set(initial()),
    }),
    {
      name: "pinjem100-v2",
      skipHydration: true,
      partialize: (s) => ({
        company: s.company,
        mode: s.mode,
        preset: s.preset,
        satu: s.satu,
        berbagai: s.berbagai,
        selectedId: s.selectedId,
        journal: s.journal,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PinjemState>;
        const satu = hydrateList(p.satu, current.satu);
        const berbagai = hydrateList(p.berbagai, current.berbagai);
        return {
          ...current,
          ...p,
          company: { ...DEFAULT_COMPANY, ...current.company, ...p.company },
          satu,
          berbagai,
          selectedId: p.selectedId ?? current.selectedId,
          mode: p.mode ?? current.mode,
          preset: p.preset ?? current.preset,
          journal: { ...emptyJournal(), ...current.journal, ...p.journal },
        };
      },
    },
  ),
);

export function useProjects(): Project[] {
  return usePinjem((s) => (s.mode === "satu-pasar" ? s.satu : s.berbagai));
}

export function useSimulation(): Simulation {
  const company = usePinjem((s) => s.company);
  const projects = useProjects();
  return simulate(company, projects);
}

export function useSelectedProject(): Project | undefined {
  const id = usePinjem((s) => s.selectedId);
  const projects = useProjects();
  return projects.find((p) => p.id === id) ?? projects[0];
}

export function useProjectSimulation(project: Project | undefined): Simulation {
  const company = usePinjem((s) => s.company);
  return simulate(company, project ? [{ ...project, enabled: true }] : []);
}
