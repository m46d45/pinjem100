import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyStartPreset, simulate, syncContractValue } from "./engine.ts";
import { DEFAULT_COMPANY, berbagaiPasarProjects, satuPasarProjects } from "./scenarios.ts";
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
} from "./types.ts";

/** Bump when persisted shape changes; migrate() handles older versions. */
export const PINJEM_STORE_VERSION = 3;

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
  openedKeuangan: boolean;
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

function hydrateProject(p: Project, company: Company): Project {
  const terms = { ...p.terms };
  if (p.market === "rumah" && terms.umPercent === 0.18) terms.umPercent = 0.15;
  const base: Project = {
    ...p,
    terms,
    costMix: { ...DEFAULT_COST_MIX, ...(p.costMix ?? {}) },
    payPolicy: { ...DEFAULT_PAY_POLICY, ...(p.payPolicy ?? {}) },
    rab: (p.rab ?? []).map((item) => ({
      ...item,
      kind: item.kind ?? (/overhead|direksi|kantor/i.test(item.name) ? "tidak-langsung" : "langsung"),
    })),
  };
  return syncContractValue(anonIdentity(base), company);
}

function anonIdentity(p: Project): Project {
  if (p.id === "sari" || p.id === "sari-mix" || /Bu Sari/i.test(p.name)) {
    return { ...p, name: "Rumah 2 Lantai — Cileunyi", owner: "Owner — Cileunyi" };
  }
  if (p.id === "andi" || /Pak Andi/i.test(p.name)) {
    return { ...p, name: "Rumah Type 70 — Cimahi", owner: "Owner — Cimahi" };
  }
  if (p.id === "lina" || /Bu Lina/i.test(p.name)) {
    return { ...p, name: "Renovasi Rumah — Lembang", owner: "Owner — Lembang" };
  }
  if (p.id === "drainase") {
    return { ...p, name: "Drainase — Ujungberung", owner: "Pemda — Ujungberung" };
  }
  if (p.id === "subkon" || /CV Karya/i.test(p.owner + p.name)) {
    return { ...p, name: "Finishing Ruko — Pasteur", owner: "Maincon — Bandung" };
  }
  return p;
}

function hydrateList(
  list: Project[] | undefined,
  fallback: Project[],
  company: Company,
): Project[] {
  if (!Array.isArray(list) || !list[0]?.rab?.length) return fallback;
  const byId = Object.fromEntries(fallback.map((p) => [p.id, p]));
  return list.map((p) => {
    const fresh = byId[p.id];
    return hydrateProject(
      {
        ...p,
        name: fresh?.name ?? p.name,
        owner: fresh?.owner ?? p.owner,
        notes: fresh?.notes ?? p.notes,
      },
      company,
    );
  });
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
  openedKeuangan: false,
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

function preferProjectId(list: Project[], id: string): string {
  if (list.some((p) => p.id === id)) return id;
  const alias: Record<string, string> = { sari: "sari-mix", "sari-mix": "sari" };
  const mapped = alias[id];
  if (mapped && list.some((p) => p.id === mapped)) return mapped;
  return list.find((p) => p.market === "rumah")?.id ?? list[0]?.id ?? id;
}

function mapProjects(state: PinjemState, fn: (p: Project) => Project): PinjemState {
  if (state.mode === "satu-pasar") return { ...state, satu: state.satu.map(fn) };
  return { ...state, berbagai: state.berbagai.map(fn) };
}

function hydrateCompany(raw: Partial<Company> | undefined): Company {
  const c = { ...DEFAULT_COMPANY, ...raw };
  if (c.ppnRate === 0.12) c.ppnRate = 0.11;
  if (typeof c.profitRate !== "number" || !Number.isFinite(c.profitRate)) {
    c.profitRate = DEFAULT_COMPANY.profitRate;
  }
  return c;
}

function hydrateJournal(raw: Partial<Journal> & { openedAkumulasi?: boolean } | undefined): Journal {
  const base = { ...emptyJournal(), ...raw };
  if (raw && "openedAkumulasi" in raw && raw.openedAkumulasi) {
    base.openedKeuangan = true;
  }
  delete (base as { openedAkumulasi?: boolean }).openedAkumulasi;
  return {
    views: base.views,
    simCount: base.simCount,
    lastZone: base.lastZone,
    hijau: base.hijau,
    kuning: base.kuning,
    merah: base.merah,
    usedBersamaan: base.usedBersamaan,
    usedBergelombang: base.usedBergelombang,
    openedProyek: base.openedProyek,
    openedPortofolio: base.openedPortofolio,
    openedKeuangan: base.openedKeuangan,
  };
}

type PersistedSlice = Partial<PinjemState> & {
  journal?: Partial<Journal> & { openedAkumulasi?: boolean };
};

function migratePersisted(persisted: unknown, fromVersion: number): PinjemState {
  const p = (persisted ?? {}) as PersistedSlice;
  const company = hydrateCompany(p.company);
  const journal = hydrateJournal(p.journal);
  const satu = hydrateList(p.satu, satuPasarProjects(), company);
  const berbagai = hydrateList(p.berbagai, berbagaiPasarProjects(), company);
  return {
    company,
    mode: p.mode ?? "satu-pasar",
    preset: p.preset ?? "bersamaan",
    satu,
    berbagai,
    selectedId: p.selectedId ?? "sari",
    journal: fromVersion < 3 ? journal : hydrateJournal(p.journal),
  };
}

export const usePinjem = create<PinjemState & PinjemActions>()(
  persist(
    (set) => ({
      ...initial(),
      setMode: (mode) =>
        set((s) => {
          const list = mode === "satu-pasar" ? s.satu : s.berbagai;
          const selectedId = preferProjectId(list, s.selectedId);
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
        set((s) =>
          mapProjects(s, (p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch, id: p.id };
            return syncContractValue(next, s.company);
          }),
        ),
      patchTerms: (id, patch) =>
        set((s) =>
          mapProjects(s, (p) => (p.id === id ? { ...p, terms: { ...p.terms, ...patch } } : p)),
        ),
      patchCompany: (patch) =>
        set((s) => {
          const company = hydrateCompany({ ...s.company, ...patch });
          const sync = (list: Project[]) => list.map((p) => syncContractValue(p, company));
          return {
            company,
            satu: sync(s.satu),
            berbagai: sync(s.berbagai),
          };
        }),
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
      version: PINJEM_STORE_VERSION,
      skipHydration: true,
      migrate: (persisted, fromVersion) => migratePersisted(persisted, fromVersion),
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
        const p = (persisted ?? {}) as PersistedSlice;
        const company = hydrateCompany({ ...current.company, ...p.company });
        const satu = hydrateList(p.satu, current.satu, company);
        const berbagai = hydrateList(p.berbagai, current.berbagai, company);
        return {
          ...current,
          ...p,
          company,
          satu,
          berbagai,
          selectedId: p.selectedId ?? current.selectedId,
          mode: p.mode ?? current.mode,
          preset: p.preset ?? current.preset,
          journal: hydrateJournal({ ...current.journal, ...p.journal }),
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
  return useMemo(() => simulate(company, projects), [company, projects]);
}

export function useSelectedProject(): Project | undefined {
  const id = usePinjem((s) => s.selectedId);
  const projects = useProjects();
  return projects.find((p) => p.id === id) ?? projects[0];
}

export function useProjectSimulation(project: Project | undefined): Simulation {
  const company = usePinjem((s) => s.company);
  return useMemo(
    () => simulate(company, project ? [{ ...project, enabled: true }] : []),
    [company, project],
  );
}
