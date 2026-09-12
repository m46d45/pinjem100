import type { Simulation } from "./cashflow/types";

type Cell = string | number | null;

function esc(s: string): string {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function cell(value: Cell): string {
  if (value === null || value === "") return "<Cell/>";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "<Cell/>";
    return `<Cell ss:StyleID="n"><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${esc(value)}</Data></Cell>`;
}

function row(values: Cell[]): string {
  return `<Row>${values.map(cell).join("")}</Row>`;
}

function sheet(name: string, rows: Cell[][]): string {
  const safe = name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31);
  return `<Worksheet ss:Name="${esc(safe)}"><Table>${rows.map(row).join("")}</Table></Worksheet>`;
}

function roundRp(n: number): number {
  return Math.round(n);
}

export function downloadSimExcel(sim: Simulation, filename: string): void {
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="n"><NumberFormat ss:Format="#,##0"/></Style>
</Styles>
${sheet("Ringkasan", summarySheet(sim))}
${sheet("Minggu", weekSheet(sim))}
${sheet("Laba rugi", incomeSheet(sim))}
${sheet("Proyek", projectSheet(sim))}
${sheet("Cadangan", reserveSheet(sim))}
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(href);
}

function summarySheet(sim: Simulation): Cell[][] {
  const last = sim.weeks[sim.weeks.length - 1];
  return [
    ["Uraian", "Nilai"],
    ["Zona", sim.zone],
    ["Kas kumulatif terdalam", roundRp(sim.minAccum)],
    ["Minggu terdalam", sim.minAccumWeek + 1],
    ["Kas di tangan terendah", roundRp(sim.minCash)],
    ["Puncak utang", roundRp(sim.peakLoan)],
    ["Minggu puncak utang", sim.peakLoanWeek + 1],
    ["Minggu terutang", sim.weeksInDebt],
    ["Fasilitas utang", roundRp(sim.loanLimit)],
    ["Ekuitas awal", roundRp(sim.cashStart)],
    ["Pencairan utang (total)", roundRp(sim.totalDraw)],
    ["Bunga", roundRp(sim.totalInterest)],
    ["Penerimaan kas", roundRp(sim.totalCashIn)],
    ["Pengeluaran kas", roundRp(sim.totalCashOut)],
    ["Cadangan akhir", roundRp(sim.endReserve)],
    ["Keluar ke cadangan", roundRp(sim.totalPark)],
    ["Cair ke proyek", roundRp(sim.totalLiquidate)],
    ["Hasil cadangan", roundRp(sim.totalOtherIncome)],
    ["Laba bersih", roundRp(sim.income.netProfit)],
    ["DER", Math.round(sim.ratios.der * 1000) / 1000],
    ["Kas akhir", roundRp(last?.cash ?? 0)],
    ["Utang akhir", roundRp(last?.loan ?? 0)],
  ];
}

function weekSheet(sim: Simulation): Cell[][] {
  const head: Cell[] = [
    "Minggu",
    "Label",
    "Progress %",
    "Earning",
    "Expense",
    "Receipt",
    "Disbursement",
    "Net",
    "Kumulatif",
    "Cair utang",
    "Kembali utang",
    "Kas di tangan",
    "Utang",
    "Cadangan",
    "Parkir",
    "Cair cadangan",
    "Bunga",
    "Hasil cadangan",
    "Upah",
    "Bahan",
    "Lainnya",
    "PPh",
    "PPN keluaran",
    "PPN masukan",
    "PPN disetor",
  ];
  const body = sim.weeks.map((w) => [
    w.week + 1,
    w.label,
    Math.round(w.workProgress * 1000) / 10,
    roundRp(w.revenue),
    roundRp(w.expense),
    roundRp(w.cashIn),
    roundRp(w.cashOut),
    roundRp(w.net),
    roundRp(w.accumulatedFromZero),
    roundRp(w.draw),
    roundRp(w.repay),
    roundRp(w.cash),
    roundRp(w.loan),
    roundRp(w.reserve),
    roundRp(w.park),
    roundRp(w.liquidate),
    roundRp(w.interest),
    roundRp(w.otherIncome),
    roundRp(w.laborOut),
    roundRp(w.materialOut),
    roundRp(w.otherOut),
    roundRp(w.pph),
    roundRp(w.ppnKeluaran),
    roundRp(w.ppnMasukan),
    roundRp(w.ppnRemit),
  ]);
  return [head, ...body];
}

function incomeSheet(sim: Simulation): Cell[][] {
  const i = sim.income;
  return [
    ["Pos", "Nilai"],
    ["Revenue (Pendapatan / DPP)", roundRp(i.revenue)],
    ["Cost of sales (Beban pokok)", roundRp(i.cogs)],
    ["Gross profit (Laba kotor)", roundRp(i.grossProfit)],
    ["Other income (Hasil cadangan)", roundRp(i.otherIncome)],
    ["EBIT (Laba usaha)", roundRp(i.ebit)],
    ["Interest (Beban bunga)", roundRp(i.interest)],
    ["EBT (Laba sebelum pajak)", roundRp(i.ebt)],
    ["PPh Final 4(2)", roundRp(i.taxPph)],
    ["Net profit (Laba bersih)", roundRp(i.netProfit)],
    ["PPN keluaran", roundRp(i.ppnKeluaran)],
    ["PPN masukan", roundRp(i.ppnMasukan)],
    ["PPN net", roundRp(i.ppnNet)],
    ["DER", Math.round(sim.ratios.der * 1000) / 1000],
    ["Debt ratio", Math.round(sim.ratios.debtRatio * 10000) / 10000],
    ["ROE", Math.round(sim.ratios.roe * 10000) / 10000],
  ];
}

function projectSheet(sim: Simulation): Cell[][] {
  const head: Cell[] = [
    "Proyek",
    "Pasar",
    "Kontrak",
    "DPP",
    "Cost of sales",
    "Earning",
    "Expense",
    "Laba",
    "Kas",
    "Durasi minggu",
  ];
  const body = sim.projects.map((p) => [
    p.name,
    p.market,
    roundRp(p.contractValue),
    roundRp(p.dpp),
    roundRp(p.directCost),
    roundRp(p.totalEarning),
    roundRp(p.totalExpense),
    roundRp(p.laba),
    roundRp(p.kas),
    p.durationWeeks,
  ]);
  return [head, ...body];
}

function reserveSheet(sim: Simulation): Cell[][] {
  const head: Cell[] = ["Minggu", "Label", "Parkir", "Cair", "Saldo cadangan", "Hasil"];
  const body = sim.weeks
    .filter((w) => w.park || w.liquidate || w.reserve || w.otherIncome)
    .map((w) => [
      w.week + 1,
      w.label,
      roundRp(w.park),
      roundRp(w.liquidate),
      roundRp(w.reserve),
      roundRp(w.otherIncome),
    ]);
  return [head, ...body];
}
