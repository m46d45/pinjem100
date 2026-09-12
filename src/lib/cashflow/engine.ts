import { weekLabel } from "../format";
import {
  DEFAULT_COST_MIX,
  DEFAULT_PAY_POLICY,
  type Activity,
  type Company,
  type CostMix,
  type CurveShape,
  type IncomeStatement,
  type PayPolicy,
  type Project,
  type ProjectBreakdown,
  type Ratios,
  type Simulation,
  type WeekPoint,
  type Zone,
} from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function sCurve(t: number, shape: CurveShape): number {
  const x = clamp(t, 0, 1);
  if (shape === "front") return 1 - Math.pow(1 - x, 2.15);
  if (shape === "back") return Math.pow(x, 2.15);
  return x * x * (3 - 2 * x);
}

export function directCost(project: Project): number {
  return project.rab.reduce((sum, item) => sum + item.amount, 0);
}

export function projectDuration(project: Project): number {
  return project.activities.reduce(
    (max, a) => Math.max(max, a.offsetWeeks + a.durationWeeks),
    1,
  );
}

/** Weeks from first cash/kerja to last, plus a short pad — not the full fiscal year. */
export function cropActiveWeeks(weeks: WeekPoint[], pad = 2): WeekPoint[] {
  let first = -1;
  let last = -1;
  for (const w of weeks) {
    const live =
      Math.abs(w.cashIn) > 1 ||
      Math.abs(w.cashOut) > 1 ||
      Math.abs(w.revenue) > 1 ||
      Math.abs(w.expense) > 1;
    if (!live) continue;
    if (first < 0) first = w.week;
    last = w.week;
  }
  if (first < 0) return weeks.slice(0, Math.min(weeks.length, 24));
  const from = Math.max(0, first - 1);
  const to = Math.min(weeks.length - 1, last + pad);
  return weeks.slice(from, to + 1);
}

export function dppOf(gross: number, ppnRate: number): number {
  return gross / (1 + ppnRate);
}

export function costMixOf(project: Project): CostMix {
  const mix = project.costMix ?? DEFAULT_COST_MIX;
  const labor = Math.max(0, mix.labor);
  const material = Math.max(0, mix.material);
  const equipment = Math.max(0, mix.equipment);
  const sum = labor + material + equipment || 1;
  return { labor: labor / sum, material: material / sum, equipment: equipment / sum };
}

export function payPolicyOf(project: Project, company?: Company): PayPolicy {
  const p = project.payPolicy;
  const materialFallback = company?.supplierCreditWeeks ?? DEFAULT_PAY_POLICY.materialDelayWeeks;
  return {
    laborDelayWeeks: clamp(Math.round(p?.laborDelayWeeks ?? DEFAULT_PAY_POLICY.laborDelayWeeks), 0, 8),
    materialDelayWeeks: clamp(
      Math.round(p?.materialDelayWeeks ?? materialFallback),
      0,
      8,
    ),
    equipmentDelayWeeks: clamp(
      Math.round(p?.equipmentDelayWeeks ?? DEFAULT_PAY_POLICY.equipmentDelayWeeks),
      0,
      8,
    ),
  };
}

export function setCostShare(mix: CostMix, key: keyof CostMix, value: number): CostMix {
  const v = clamp(value, 0.05, 0.85);
  const others = (["labor", "material", "equipment"] as const).filter((k) => k !== key);
  const rest = 1 - v;
  const otherSum = others.reduce((s, k) => s + Math.max(0.01, mix[k]), 0);
  return {
    labor: key === "labor" ? v : rest * (Math.max(0.01, mix.labor) / otherSum),
    material: key === "material" ? v : rest * (Math.max(0.01, mix.material) / otherSum),
    equipment: key === "equipment" ? v : rest * (Math.max(0.01, mix.equipment) / otherSum),
  };
}

function activityWeight(project: Project, activity: Activity): number {
  const total = directCost(project);
  if (total <= 0) return 0;
  const amount = project.rab
    .filter((item) => item.activityId === activity.id)
    .reduce((sum, item) => sum + item.amount, 0);
  return amount / total;
}

export function workShares(project: Project): number[] {
  const duration = projectDuration(project);
  const shares = Array.from({ length: duration }, () => 0);
  for (const activity of project.activities) {
    const weight = activityWeight(project, activity);
    const d = Math.max(1, activity.durationWeeks);
    for (let w = 0; w < d; w++) {
      const delta =
        sCurve((w + 1) / d, activity.shape) - sCurve(w / d, activity.shape);
      const idx = activity.offsetWeeks + w;
      if (idx >= 0 && idx < duration) shares[idx] += weight * delta;
    }
  }
  const sum = shares.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (let i = 0; i < shares.length; i++) shares[i] /= sum;
  }
  return shares;
}

function applyFreeze(week: number, freeze: boolean): number {
  if (!freeze) return week;
  const inYear = ((week % 52) + 52) % 52;
  if (inYear >= 49) {
    const yearIndex = Math.floor(week / 52);
    return yearIndex * 52 + 54;
  }
  return week;
}

type OwnerPay = {
  cash: number;
  dpp: number;
  pph: number;
  ppn: number;
};

export function ownerPay(gross: number, company: Company): OwnerPay {
  if (gross <= 0) return { cash: 0, dpp: 0, pph: 0, ppn: 0 };
  const dpp = dppOf(gross, company.ppnRate);
  const pph = dpp * company.pphRate;
  return { cash: gross - pph, dpp, pph, ppn: gross - dpp };
}

type ProjectFlows = {
  inflow: number[];
  outflow: number[];
  work: number[];
  billed: number[];
  revenue: number[];
  expense: number[];
  pph: number[];
  ppnKeluaran: number[];
  ppnMasukan: number[];
  ppnRemit: number[];
  laborOut: number[];
  materialOut: number[];
  otherOut: number[];
};

function zeros(n: number): number[] {
  return Array.from({ length: n }, () => 0);
}

function emptyFlows(horizon: number): ProjectFlows {
  return {
    inflow: zeros(horizon),
    outflow: zeros(horizon),
    work: zeros(horizon),
    billed: zeros(horizon),
    revenue: zeros(horizon),
    expense: zeros(horizon),
    pph: zeros(horizon),
    ppnKeluaran: zeros(horizon),
    ppnMasukan: zeros(horizon),
    ppnRemit: zeros(horizon),
    laborOut: zeros(horizon),
    materialOut: zeros(horizon),
    otherOut: zeros(horizon),
  };
}

function projectFlows(project: Project, company: Company, horizon: number): ProjectFlows {
  const flow = emptyFlows(horizon);
  if (!project.enabled) return flow;

  const {
    inflow,
    outflow,
    work,
    billed,
    revenue,
    expense,
    pph,
    ppnKeluaran,
    ppnMasukan,
    ppnRemit,
    laborOut,
    materialOut,
    otherOut,
  } = flow;

  const start = project.startWeek;
  const duration = projectDuration(project);
  const shares = workShares(project);
  const cost = directCost(project);
  const terms = project.terms;
  const endWeek = start + duration;
  const dppContract = dppOf(project.contractValue, company.ppnRate);
  const mix = costMixOf(project);
  const pay = payPolicyOf(project, company);

  const addIn = (week: number, amount: number) => {
    const w = applyFreeze(week, terms.freezeYearEnd);
    if (w >= 0 && w < horizon && amount) inflow[w] += amount;
  };
  const addOut = (week: number, amount: number, bucket?: number[]) => {
    if (week >= 0 && week < horizon && amount) {
      outflow[week] += amount;
      if (bucket) bucket[week] += amount;
    }
  };

  const billOwner = (week: number, gross: number) => {
    const payOut = ownerPay(gross, company);
    const w = applyFreeze(week, terms.freezeYearEnd);
    if (w < 0 || w >= horizon || gross <= 0) return payOut;
    inflow[w] += payOut.cash;
    pph[w] += payOut.pph;
    ppnKeluaran[w] += payOut.ppn;
    billed[w] += gross;
    return payOut;
  };

  if (terms.guaranteePercent > 0) {
    const jaminan = project.contractValue * terms.guaranteePercent;
    addOut(start, jaminan, otherOut);
    addIn(endWeek + 4, jaminan);
  }

  const mobilization = cost * 0.025;
  addOut(start, mobilization, otherOut);

  const umGross = project.contractValue * terms.umPercent;
  if (umGross > 0) {
    billOwner(start + terms.umLagWeeks, umGross);
  }

  const remaining = project.contractValue - umGross;
  const every = Math.max(1, terms.billingEveryWeeks);
  let lastBilledProgress = 0;
  let workCum = 0;

  for (let i = 0; i < duration; i++) {
    const week = start + i;
    const share = shares[i] ?? 0;
    workCum += share;
    const labor = cost * share * mix.labor;
    const materialWork = cost * share * mix.material;
    const equipment = cost * share * mix.equipment;

    if (week >= 0 && week < horizon) {
      work[week] = workCum;
      revenue[week] += dppContract * share;
      expense[week] += labor + materialWork + equipment;
    }

    addOut(week + pay.laborDelayWeeks, labor, laborOut);
    addOut(week + pay.equipmentDelayWeeks, equipment, otherOut);

    const purchaseWeek = week - company.materialLeadWeeks;
    const materialCashWeek = Math.max(start, purchaseWeek + pay.materialDelayWeeks);
    addOut(materialCashWeek, materialWork, materialOut);
    if (materialCashWeek >= 0 && materialCashWeek < horizon && materialWork > 0) {
      ppnMasukan[materialCashWeek] += dppOf(materialWork, company.ppnRate) * company.ppnRate;
    }

    const isBillWeek = (i + 1) % every === 0 || i === duration - 1;
    if (isBillWeek) {
      const progress = workCum;
      const increment = Math.max(0, progress - lastBilledProgress);
      lastBilledProgress = progress;
      const gross = remaining * increment;
      const retained = gross * terms.retentionPercent;
      const net = gross - retained;
      billOwner(week + terms.progressLagWeeks, net);
    }
  }

  const retainedTotal = remaining * terms.retentionPercent;
  billOwner(endWeek + terms.retentionLagWeeks, retainedTotal);

  for (let period = 0; period < horizon; period += 4) {
    let kel = 0;
    let mas = 0;
    for (let w = period; w < period + 4 && w < horizon; w++) {
      kel += ppnKeluaran[w] ?? 0;
      mas += ppnMasukan[w] ?? 0;
    }
    const net = Math.max(0, kel - mas);
    const remitWeek = period + 5;
    if (net && remitWeek < horizon) {
      outflow[remitWeek] += net;
      ppnRemit[remitWeek] += net;
      otherOut[remitWeek] += net;
    }
  }

  for (let w = 0; w < horizon; w++) {
    if (w > 0 && work[w] === 0) {
      const prev = work[w - 1] ?? 0;
      if (prev > 0 && prev < 1 && w < endWeek) work[w] = prev;
      else if (w >= endWeek && prev > 0) work[w] = 1;
    }
  }

  return flow;
}

function zoneOf(peakLoan: number, limit: number, breached: boolean): Zone {
  if (breached || peakLoan >= limit * 0.98) return "merah";
  if (peakLoan >= limit * 0.65) return "kuning";
  return "hijau";
}

function isTermWeek(company: Company, week: number, drawn: number): boolean {
  if (company.debtScheme !== "term" || drawn <= 0) return false;
  const count = Math.max(1, company.termCount);
  const interval = Math.max(1, company.termIntervalWeeks);
  if (week < company.termStartWeek) return false;
  const delta = week - company.termStartWeek;
  if (delta % interval !== 0) return false;
  const index = delta / interval;
  return index >= 0 && index < count;
}

export function simulate(company: Company, projects: Project[]): Simulation {
  const horizon = company.horizonWeeks;
  const weeklyRate = company.annualInterest / 52;
  const enabled = projects.filter((p) => p.enabled);
  const lag = Math.max(0, Math.round(company.disbursementLagWeeks));

  const flows = enabled.map((p) => ({
    project: p,
    flow: projectFlows(p, company, horizon),
  }));

  const pendingArrive = zeros(horizon);
  const weeks: WeekPoint[] = [];
  let cash = company.cashStart;
  let loan = 0;
  let pendingOut = 0;
  let peakLoan = 0;
  let peakLoanWeek = 0;
  let minCash = cash;
  let minCashWeek = 0;
  let minAccum = company.cashStart;
  let minAccumWeek = 0;
  let weeksInDebt = 0;
  let weeksOverLimit = 0;
  let totalInterest = 0;
  let totalDraw = 0;
  let cumIn = 0;
  let cumOut = 0;
  let accumFromZero = 0;
  let breached = false;
  let termDrawn = 0;
  const runningProjectAccum: Record<string, number> = {};

  for (let w = 0; w < horizon; w++) {
    let opsIn = 0;
    let opsOut = 0;
    let revenue = 0;
    let expense = 0;
    let pph = 0;
    let ppnKeluaran = 0;
    let ppnMasukan = 0;
    let ppnRemit = 0;
    let laborOut = 0;
    let materialOut = 0;
    let otherOut = 0;
    const projectIn: Record<string, number> = {};
    const projectOut: Record<string, number> = {};
    const projectWork: Record<string, number> = {};
    const projectAccum: Record<string, number> = {};
    const projectEarning: Record<string, number> = {};
    const projectExpense: Record<string, number> = {};
    let workSum = 0;
    let billedSum = 0;

    for (const { project, flow } of flows) {
      const inn = flow.inflow[w] ?? 0;
      const out = flow.outflow[w] ?? 0;
      opsIn += inn;
      opsOut += out;
      revenue += flow.revenue[w] ?? 0;
      expense += flow.expense[w] ?? 0;
      pph += flow.pph[w] ?? 0;
      ppnKeluaran += flow.ppnKeluaran[w] ?? 0;
      ppnMasukan += flow.ppnMasukan[w] ?? 0;
      ppnRemit += flow.ppnRemit[w] ?? 0;
      laborOut += flow.laborOut[w] ?? 0;
      materialOut += flow.materialOut[w] ?? 0;
      otherOut += flow.otherOut[w] ?? 0;
      projectIn[project.id] = inn;
      projectOut[project.id] = out;
      projectWork[project.id] = flow.work[w] ?? 0;
      projectEarning[project.id] = flow.revenue[w] ?? 0;
      projectExpense[project.id] = flow.expense[w] ?? 0;
      runningProjectAccum[project.id] = (runningProjectAccum[project.id] ?? 0) + inn - out;
      projectAccum[project.id] = runningProjectAccum[project.id] ?? 0;
      workSum += flow.work[w] ?? 0;
      billedSum += flow.billed[w] ?? 0;
    }

    let draw = 0;
    let repay = 0;

    const arrived = pendingArrive[w] ?? 0;
    if (arrived > 0) {
      cash += arrived;
      loan += arrived;
      draw += arrived;
      totalDraw += arrived;
      pendingOut = Math.max(0, pendingOut - arrived);
    }

    const interest = loan * weeklyRate;
    totalInterest += interest;
    cash += opsIn - opsOut - interest;

    const room = () => Math.max(0, company.loanLimit - loan - pendingOut);

    const scheduleDraw = (amount: number) => {
      const req = Math.min(amount, room());
      if (req <= 1) return 0;
      const arriveWeek = w + lag;
      if (arriveWeek === w) {
        cash += req;
        loan += req;
        draw += req;
        totalDraw += req;
      } else if (arriveWeek < horizon) {
        pendingArrive[arriveWeek] += req;
        pendingOut += req;
      }
      return req;
    };

    if (company.debtScheme === "term") {
      if (w === company.termDrawWeek) {
        const wanted =
          company.termDrawAmount > 0 ? company.termDrawAmount : company.loanLimit;
        const got = scheduleDraw(wanted);
        termDrawn += got;
      }
      if (termDrawn > 0 && isTermWeek(company, w, termDrawn)) {
        const installment = termDrawn / Math.max(1, company.termCount);
        const pay = Math.min(installment, loan);
        if (pay > 1) {
          cash -= pay;
          loan -= pay;
          repay += pay;
        }
      }
    } else if (cash < 0) {
      scheduleDraw(-cash);
    } else if (loan > 0 && cash > 0) {
      repay = Math.min(loan, cash);
      loan -= repay;
      cash -= repay;
    }

    const unused = company.loanLimit - loan - pendingOut;
    if (cash < -1 && unused <= 1) breached = true;

    if (loan > peakLoan) {
      peakLoan = loan;
      peakLoanWeek = w;
    }
    if (cash < minCash) {
      minCash = cash;
      minCashWeek = w;
    }
    accumFromZero += opsIn - opsOut;
    const accumOps = company.cashStart + accumFromZero;
    if (accumOps < minAccum) {
      minAccum = accumOps;
      minAccumWeek = w;
    }
    if (loan > 1) weeksInDebt += 1;
    if (loan + pendingOut >= company.loanLimit - 1) weeksOverLimit += 1;

    cumIn += opsIn;
    cumOut += opsOut;

    const nEnabled = Math.max(1, enabled.length);
    weeks.push({
      week: w,
      label: weekLabel(w, company.fiscalYear),
      cashIn: opsIn,
      cashOut: opsOut,
      net: opsIn - opsOut,
      cash,
      loan,
      interest,
      draw,
      repay,
      pendingDraw: pendingOut,
      cumulativeIn: cumIn,
      cumulativeOut: cumOut,
      accumulatedOps: accumOps,
      accumulatedFromZero: accumFromZero,
      workProgress: workSum / nEnabled,
      billedProgress: billedSum,
      revenue,
      expense,
      pph,
      ppnKeluaran,
      ppnMasukan,
      ppnRemit,
      laborOut,
      materialOut,
      otherOut,
      projectIn,
      projectOut,
      projectWork,
      projectAccum: { ...projectAccum },
      projectEarning: { ...projectEarning },
      projectExpense: { ...projectExpense },
    });
  }

  const breakdowns: ProjectBreakdown[] = projects.map((p) => {
    const cost = directCost(p);
    const duration = projectDuration(p);
    const flow = projectFlows(p, company, horizon);
    const dpp = dppOf(p.contractValue, company.ppnRate);
    const totalIn = flow.inflow.reduce((a, b) => a + b, 0);
    const totalOut = flow.outflow.reduce((a, b) => a + b, 0);
    const totalEarning = flow.revenue.reduce((a, b) => a + b, 0);
    const totalExpense = flow.expense.reduce((a, b) => a + b, 0);
    return {
      id: p.id,
      name: p.name,
      market: p.market,
      contractValue: p.contractValue,
      dpp,
      directCost: cost,
      margin: dpp - cost,
      totalIn,
      totalOut,
      totalEarning,
      totalExpense,
      laba: totalEarning - totalExpense,
      kas: totalIn - totalOut,
      durationWeeks: duration,
    };
  });

  const enabledBreak = breakdowns.filter((b) => enabled.some((p) => p.id === b.id));
  const revenue = enabledBreak.reduce((s, b) => s + b.dpp, 0);
  const cogs = enabledBreak.reduce((s, b) => s + b.directCost, 0);
  const grossProfit = revenue - cogs;
  const taxPph = revenue * company.pphRate;
  const ebit = grossProfit;
  const ebt = ebit - totalInterest;
  const netProfit = ebt - taxPph;
  const ppnKeluaran = weeks.reduce((s, w) => s + w.ppnKeluaran, 0);
  const ppnMasukan = weeks.reduce((s, w) => s + w.ppnMasukan, 0);

  const income: IncomeStatement = {
    revenue,
    cogs,
    grossProfit,
    ebit,
    interest: totalInterest,
    ebt,
    taxPph,
    netProfit,
    ppnKeluaran,
    ppnMasukan,
    ppnNet: Math.max(0, ppnKeluaran - ppnMasukan),
  };

  const equity = Math.max(1, company.cashStart);
  const ratios: Ratios = {
    der: peakLoan / equity,
    debtRatio: peakLoan / (peakLoan + equity),
    interestCoverage: totalInterest > 1 ? ebit / totalInterest : ebit > 0 ? 99 : 0,
    netMargin: revenue > 0 ? netProfit / revenue : 0,
    roe: netProfit / equity,
  };

  return {
    weeks,
    peakLoan,
    peakLoanWeek,
    minCash,
    minCashWeek,
    minAccum,
    minAccumWeek,
    weeksInDebt,
    weeksOverLimit,
    totalInterest,
    totalCashIn: cumIn,
    totalCashOut: cumOut,
    totalMargin: enabledBreak.reduce((s, b) => s + b.margin, 0),
    totalDraw,
    zone: zoneOf(peakLoan, company.loanLimit, breached),
    breached,
    projects: breakdowns,
    loanLimit: company.loanLimit,
    cashStart: company.cashStart,
    income,
    ratios,
  };
}

export function insightText(sim: Simulation, fiscalYear: number): string {
  const peak = formatJt(sim.peakLoan);
  const facility = formatJt(sim.loanLimit);
  const hole = formatJt(sim.minAccum);
  const whenHole = weekLabel(sim.minAccumWeek, fiscalYear);
  const whenPeak = weekLabel(sim.peakLoanWeek, fiscalYear);
  const ni = formatJt(sim.income.netProfit);

  if (sim.zone === "merah") {
    return `Kas kumulatif paling dalam ${hole} pada ${whenHole}. Puncak utang ${peak} pada ${whenPeak} — fasilitas ${facility} tidak menutup lubang. Laba bersih ${ni}. Geser jadwal, naikkan ekuitas, atau naikkan fasilitas.`;
  }
  if (sim.zone === "kuning") {
    return `Kas kumulatif paling dalam ${hole} pada ${whenHole}. Puncak utang ${peak} masih dalam fasilitas ${facility}, tapi nyaris. Laba bersih ${ni}.`;
  }
  return `Kas kumulatif paling dalam ${hole} pada ${whenHole}. Puncak utang ${peak} masih longgar terhadap fasilitas ${facility}. Laba bersih ${ni}.`;
}

function formatJt(value: number): string {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const n = abs / 1_000_000;
  const txt = (n >= 10 ? n.toFixed(0) : n.toFixed(1)).replace(".", ",");
  return `Rp ${sign}${txt} jt`;
}

export function applyStartPreset(
  projects: Project[],
  preset: "bersamaan" | "bergelombang" | "numpuk-q4",
): Project[] {
  const starts =
    preset === "bersamaan"
      ? [7, 7, 7]
      : preset === "bergelombang"
        ? [6, 16, 28]
        : [30, 33, 36];
  return projects.map((p, i) => ({
    ...p,
    startWeek: starts[i] ?? starts[starts.length - 1] ?? 7,
  }));
}

export function formatRatio(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits).replace(".", ",");
}

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1).replace(".", ",")}%`;
}
