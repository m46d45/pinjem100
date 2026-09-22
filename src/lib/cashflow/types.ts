export type Market = "pemda" | "rumah" | "subkon";
export type CurveShape = "front" | "normal" | "back";
export type PortfolioMode = "satu-pasar" | "berbagai-pasar";
export type StartPreset = "bersamaan" | "bergelombang" | "numpuk-q4";
export type Zone = "hijau" | "kuning" | "merah";
export type Lender = "bank" | "rekan";
export type DebtScheme = "revolving" | "term";

export type RabKind = "langsung" | "tidak-langsung";

export type RabItem = {
  id: string;
  name: string;
  amount: number;
  activityId: string;
  kind: RabKind;
};

export type Activity = {
  id: string;
  name: string;
  offsetWeeks: number;
  durationWeeks: number;
  shape: CurveShape;
};

export type PaymentTerms = {
  umPercent: number;
  umLagWeeks: number;
  retentionPercent: number;
  progressLagWeeks: number;
  retentionLagWeeks: number;
  guaranteePercent: number;
  freezeYearEnd: boolean;
  billingEveryWeeks: number;
};

/** Shares of direct cost. Engine normalizes to 1. */
export type CostMix = {
  labor: number;
  material: number;
  equipment: number;
};

/** Weeks after work is done before cash leaves. Expense stays in the work week. */
export type PayPolicy = {
  laborDelayWeeks: number;
  materialDelayWeeks: number;
  equipmentDelayWeeks: number;
};

export const DEFAULT_COST_MIX: CostMix = {
  labor: 0.3,
  material: 0.55,
  equipment: 0.15,
};

export const DEFAULT_PAY_POLICY: PayPolicy = {
  laborDelayWeeks: 0,
  materialDelayWeeks: 3,
  equipmentDelayWeeks: 0,
};

export type Project = {
  id: string;
  name: string;
  owner: string;
  market: Market;
  contractValue: number;
  rab: RabItem[];
  activities: Activity[];
  terms: PaymentTerms;
  startWeek: number;
  enabled: boolean;
  notes: string;
  workShape: CurveShape;
  costMix: CostMix;
  payPolicy: PayPolicy;
};

export type Company = {
  cashStart: number;
  loanLimit: number;
  annualInterest: number;
  supplierCreditWeeks: number;
  materialLeadWeeks: number;
  fiscalYear: number;
  horizonWeeks: number;
  ppnRate: number;
  pphRate: number;
  /** Markup on RAB C before PPN (default 10%). */
  profitRate: number;
  lender: Lender;
  disbursementLagWeeks: number;
  debtScheme: DebtScheme;
  termDrawWeek: number;
  termDrawAmount: number;
  termCount: number;
  termStartWeek: number;
  termIntervalWeeks: number;
  /** Share of equity allowed as operating cash. Rest is cadangan. */
  projectShare: number;
  /** Monthly yield on cadangan. */
  reserveYieldMonthly: number;
  /** Weeks until a cadangan sale becomes cash. */
  reserveLagWeeks: number;
  /** Share of surplus operating cash parked to cadangan. */
  parkShare: number;
  /** Weeks until parked cash sits in cadangan. */
  parkLagWeeks: number;
};

export type WeekPoint = {
  week: number;
  label: string;
  cashIn: number;
  cashOut: number;
  net: number;
  cash: number;
  loan: number;
  interest: number;
  draw: number;
  repay: number;
  pendingDraw: number;
  cumulativeIn: number;
  cumulativeOut: number;
  accumulatedOps: number;
  accumulatedFromZero: number;
  workProgress: number;
  billedProgress: number;
  revenue: number;
  expense: number;
  pph: number;
  ppnKeluaran: number;
  ppnMasukan: number;
  ppnRemit: number;
  laborOut: number;
  materialOut: number;
  otherOut: number;
  reserve: number;
  park: number;
  liquidate: number;
  otherIncome: number;
  projectIn: Record<string, number>;
  projectOut: Record<string, number>;
  projectWork: Record<string, number>;
  projectAccum: Record<string, number>;
  projectEarning: Record<string, number>;
  projectExpense: Record<string, number>;
};

export type ProjectBreakdown = {
  id: string;
  name: string;
  market: Market;
  contractValue: number;
  dpp: number;
  directCost: number;
  margin: number;
  totalIn: number;
  totalOut: number;
  totalEarning: number;
  totalExpense: number;
  laba: number;
  kas: number;
  durationWeeks: number;
};

export type IncomeStatement = {
  revenue: number;
  cogs: number;
  grossProfit: number;
  otherIncome: number;
  ebit: number;
  interest: number;
  ebt: number;
  taxPph: number;
  netProfit: number;
  ppnKeluaran: number;
  ppnMasukan: number;
  ppnNet: number;
};

export type Ratios = {
  der: number;
  debtRatio: number;
  interestCoverage: number;
  netMargin: number;
  roe: number;
};

export type Simulation = {
  weeks: WeekPoint[];
  peakLoan: number;
  peakLoanWeek: number;
  minCash: number;
  minCashWeek: number;
  minAccum: number;
  minAccumWeek: number;
  weeksInDebt: number;
  weeksOverLimit: number;
  totalInterest: number;
  totalCashIn: number;
  totalCashOut: number;
  totalMargin: number;
  totalDraw: number;
  zone: Zone;
  breached: boolean;
  projects: ProjectBreakdown[];
  loanLimit: number;
  cashStart: number;
  totalOtherIncome: number;
  endReserve: number;
  totalPark: number;
  totalLiquidate: number;
  income: IncomeStatement;
  ratios: Ratios;
};

export const MARKET_LABEL: Record<Market, string> = {
  pemda: "Pemda / PUPR kecil",
  rumah: "Rumah tinggal",
  subkon: "Subkon",
};

export const MARKET_BLURB: Record<Market, string> = {
  pemda: "Owner: pemerintah daerah.",
  rumah: "Owner: pemilik rumah.",
  subkon: "Owner: kontraktor utama.",
};

export const PRESET_LABEL: Record<StartPreset, string> = {
  bersamaan: "Bersamaan",
  bergelombang: "Bergelombang",
  "numpuk-q4": "Numpuk Q4",
};

export const PRESET_BLURB: Record<StartPreset, string> = {
  bersamaan: "Tiga proyek mulai di minggu yang sama. Arus keluar bertumpuk.",
  bergelombang: "Mulai bergeser, masih dalam tahun anggaran yang sama.",
  "numpuk-q4": "Semua mulai Agustus–Oktober. Pola serap anggaran.",
};

export const MODE_LABEL: Record<PortfolioMode, string> = {
  "satu-pasar": "Satu pasar (seragam)",
  "berbagai-pasar": "Berbagai pasar (tidak seragam)",
};

export const LENDER_LABEL: Record<Lender, string> = {
  bank: "Bank",
  rekan: "Rekan kerja",
};

export const SCHEME_LABEL: Record<DebtScheme, string> = {
  revolving: "Revolving credit (KMK bergulir)",
  term: "Term loan (Pinjaman berjangka / termyn)",
};
