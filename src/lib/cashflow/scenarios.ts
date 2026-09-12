import {
  DEFAULT_COST_MIX,
  DEFAULT_PAY_POLICY,
  type Company,
  type PaymentTerms,
  type Project,
} from "./types";
import { applyStartPreset } from "./engine";

const TERMS_RUMAH: PaymentTerms = {
  umPercent: 0.15,
  umLagWeeks: 2,
  retentionPercent: 0.05,
  progressLagWeeks: 2,
  retentionLagWeeks: 8,
  guaranteePercent: 0,
  freezeYearEnd: false,
  billingEveryWeeks: 4,
};

const TERMS_PEMDA: PaymentTerms = {
  umPercent: 0.2,
  umLagWeeks: 2,
  retentionPercent: 0.05,
  progressLagWeeks: 4,
  retentionLagWeeks: 10,
  guaranteePercent: 0.03,
  freezeYearEnd: true,
  billingEveryWeeks: 4,
};

const TERMS_SUBKON: PaymentTerms = {
  umPercent: 0,
  umLagWeeks: 0,
  retentionPercent: 0.1,
  progressLagWeeks: 6,
  retentionLagWeeks: 12,
  guaranteePercent: 0,
  freezeYearEnd: false,
  billingEveryWeeks: 4,
};

function house(
  id: string,
  name: string,
  owner: string,
  contract: number,
  scale: number,
  notes: string,
): Project {
  const c = (n: number) => Math.round(n * scale);
  return {
    id,
    name,
    owner,
    market: "rumah",
    contractValue: contract,
    workShape: "normal",
    startWeek: 7,
    enabled: true,
    notes,
    costMix: { ...DEFAULT_COST_MIX },
    payPolicy: { ...DEFAULT_PAY_POLICY },
    activities: [
      { id: "prep", name: "Persiapan & galian", offsetWeeks: 0, durationWeeks: 3, shape: "front" },
      { id: "pondasi", name: "Pondasi", offsetWeeks: 2, durationWeeks: 4, shape: "normal" },
      { id: "struktur", name: "Struktur", offsetWeeks: 5, durationWeeks: 6, shape: "front" },
      { id: "atap", name: "Dinding & atap", offsetWeeks: 10, durationWeeks: 5, shape: "normal" },
      { id: "finish", name: "Finishing & ME", offsetWeeks: 14, durationWeeks: 6, shape: "back" },
    ],
    rab: [
      { id: "r1", name: "Persiapan lahan", amount: c(28_000_000), activityId: "prep", kind: "langsung" },
      { id: "r2", name: "Pondasi & sloof", amount: c(95_000_000), activityId: "pondasi", kind: "langsung" },
      { id: "r3", name: "Struktur beton", amount: c(210_000_000), activityId: "struktur", kind: "langsung" },
      { id: "r4", name: "Dinding, kusen, atap", amount: c(165_000_000), activityId: "atap", kind: "langsung" },
      { id: "r5", name: "Finishing", amount: c(155_000_000), activityId: "finish", kind: "langsung" },
      { id: "r6", name: "ME sederhana", amount: c(48_000_000), activityId: "finish", kind: "langsung" },
      { id: "r7", name: "Overhead lapangan", amount: c(32_000_000), activityId: "prep", kind: "tidak-langsung" },
    ],
    terms: { ...TERMS_RUMAH },
  };
}

export function satuPasarProjects(): Project[] {
  return applyStartPreset(
    [
      house(
        "sari",
        "Rumah Bu Sari",
        "Bu Sari — Bandung Timur",
        880_000_000,
        0.95,
        "Rumah tinggal 2 lantai.",
      ),
      house(
        "andi",
        "Rumah Pak Andi",
        "Pak Andi — Cimahi",
        720_000_000,
        0.78,
        "Rumah type 70.",
      ),
      house(
        "lina",
        "Renovasi Bu Lina",
        "Bu Lina — Buahbatu",
        510_000_000,
        0.55,
        "Renovasi total.",
      ),
    ],
    "bersamaan",
  );
}

export function berbagaiPasarProjects(): Project[] {
  const drainase: Project = {
    id: "drainase",
    name: "Drainase Kelurahan",
    owner: "Pemda — APBD 2026",
    market: "pemda",
    contractValue: 620_000_000,
    workShape: "normal",
    startWeek: 7,
    enabled: true,
    notes: "Paket drainase kelurahan.",
    costMix: { ...DEFAULT_COST_MIX },
    payPolicy: { ...DEFAULT_PAY_POLICY },
    terms: { ...TERMS_PEMDA },
    activities: [
      { id: "mob", name: "Mobilisasi", offsetWeeks: 0, durationWeeks: 3, shape: "front" },
      { id: "galian", name: "Galian & buis", offsetWeeks: 2, durationWeeks: 8, shape: "normal" },
      { id: "cor", name: "Cor & pasangan", offsetWeeks: 8, durationWeeks: 8, shape: "normal" },
      { id: "finish", name: "Tutupan & beres", offsetWeeks: 15, durationWeeks: 6, shape: "back" },
    ],
    rab: [
      { id: "d1", name: "Mobilisasi & jaminan", amount: 32_000_000, activityId: "mob", kind: "langsung" },
      { id: "d2", name: "Galian tanah", amount: 95_000_000, activityId: "galian", kind: "langsung" },
      { id: "d3", name: "Buis beton & material", amount: 155_000_000, activityId: "galian", kind: "langsung" },
      { id: "d4", name: "Pekerjaan beton", amount: 140_000_000, activityId: "cor", kind: "langsung" },
      { id: "d5", name: "Pasangan & tutupan", amount: 78_000_000, activityId: "finish", kind: "langsung" },
      { id: "d6", name: "Overhead & direksi", amount: 28_000_000, activityId: "mob", kind: "tidak-langsung" },
    ],
  };

  const rumah = house(
    "sari-mix",
    "Rumah Bu Sari",
    "Bu Sari — Bandung Timur",
    880_000_000,
    0.95,
    "Rumah tinggal 2 lantai.",
  );
  rumah.id = "sari-mix";

  const subkon: Project = {
    id: "subkon",
    name: "Finishing ruko 3 pintu",
    owner: "Maincon CV Karya",
    market: "subkon",
    contractValue: 280_000_000,
    workShape: "back",
    startWeek: 7,
    enabled: true,
    notes: "Finishing ruko 3 pintu.",
    costMix: { labor: 0.42, material: 0.46, equipment: 0.12 },
    payPolicy: { ...DEFAULT_PAY_POLICY, laborDelayWeeks: 0, materialDelayWeeks: 2 },
    terms: { ...TERMS_SUBKON },
    activities: [
      { id: "prep", name: "Siap lapangan", offsetWeeks: 0, durationWeeks: 2, shape: "front" },
      { id: "dinding", name: "Dinding & plafon", offsetWeeks: 1, durationWeeks: 5, shape: "normal" },
      { id: "finish", name: "Cat, lantai, ME", offsetWeeks: 5, durationWeeks: 6, shape: "back" },
    ],
    rab: [
      { id: "k1", name: "Persiapan", amount: 12_000_000, activityId: "prep", kind: "langsung" },
      { id: "k2", name: "Dinding & plafon", amount: 88_000_000, activityId: "dinding", kind: "langsung" },
      { id: "k3", name: "Lantai & cat", amount: 74_000_000, activityId: "finish", kind: "langsung" },
      { id: "k4", name: "ME & pintu", amount: 46_000_000, activityId: "finish", kind: "langsung" },
      { id: "k5", name: "Upah mandor", amount: 15_000_000, activityId: "prep", kind: "langsung" },
      { id: "k6", name: "Overhead lapangan", amount: 8_000_000, activityId: "prep", kind: "tidak-langsung" },
    ],
  };

  return applyStartPreset([drainase, rumah, subkon], "bersamaan");
}

export const DEFAULT_COMPANY: Company = {
  cashStart: 70_000_000,
  loanLimit: 100_000_000,
  annualInterest: 0.12,
  supplierCreditWeeks: 3,
  materialLeadWeeks: 2,
  fiscalYear: 2026,
  horizonWeeks: 60,
  ppnRate: 0.11,
  pphRate: 0.0175,
  lender: "bank",
  disbursementLagWeeks: 0,
  debtScheme: "revolving",
  termDrawWeek: 8,
  termDrawAmount: 0,
  termCount: 4,
  termStartWeek: 22,
  termIntervalWeeks: 4,
  projectShare: 0.7,
  reserveYieldMonthly: 0.005,
  reserveLagWeeks: 4,
  parkShare: 1,
  parkLagWeeks: 0,
};
