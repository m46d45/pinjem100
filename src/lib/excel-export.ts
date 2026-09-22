import type { Simulation } from "./cashflow/types";

type CellValue = string | number | null;

type RichCell = {
  value: CellValue;
  /** SpreadsheetML formula, e.g. "=RC[-2]-RC[-1]" or "=R[-1]C+RC[-1]". */
  formula?: string;
};

type Cell = CellValue | RichCell;

function esc(s: string): string {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function normalize(cell: Cell): RichCell {
  if (cell !== null && typeof cell === "object" && "value" in cell) return cell;
  return { value: cell };
}

function cellXml(raw: Cell): string {
  const { value, formula } = normalize(raw);
  const formulaAttr = formula ? ` ss:Formula="${esc(formula)}"` : "";
  if (value === null || value === "") {
    return formula ? `<Cell${formulaAttr}/>` : "<Cell/>";
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "<Cell/>";
    return `<Cell ss:StyleID="n"${formulaAttr}><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell${formulaAttr}><Data ss:Type="String">${esc(value)}</Data></Cell>`;
}

function row(values: Cell[]): string {
  return `<Row>${values.map(cellXml).join("")}</Row>`;
}

function sheet(name: string, rows: Cell[][]): string {
  const safe = name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31);
  return `<Worksheet ss:Name="${esc(safe)}"><Table>${rows.map(row).join("")}</Table></Worksheet>`;
}

function roundRp(n: number): number {
  return Math.round(n);
}

function num(value: number, formula?: string): RichCell {
  return formula ? { value: roundRp(value), formula } : { value: roundRp(value) };
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
  const body = sim.weeks.map((w, i) => {
    const excelRow = i + 2; // 1-based, row 1 is header
    return [
      w.week + 1,
      w.label,
      Math.round(w.workProgress * 1000) / 10,
      roundRp(w.revenue),
      roundRp(w.expense),
      roundRp(w.cashIn),
      roundRp(w.cashOut),
      // Net = Receipt - Disbursement (cols F - G)
      num(w.net, "=RC[-2]-RC[-1]"),
      // Kumulatif: first row = Net; later = prior kumulatif + Net
      i === 0
        ? num(w.accumulatedFromZero, "=RC[-1]")
        : num(w.accumulatedFromZero, `=R${excelRow - 1}C+RC[-1]`),
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
    ];
  });
  return [head, ...body];
}

function incomeSheet(sim: Simulation): Cell[][] {
  const i = sim.income;
  return [
    ["Pos", "Nilai", "Rumus"],
    ["Revenue (Pendapatan / DPP)", roundRp(i.revenue), "RAB E total"],
    ["Cost of sales (Beban pokok)", roundRp(i.cogs), "RAB C total"],
    ["Gross profit (Laba kotor)", num(i.grossProfit, "=R[-2]C-R[-1]C"), "Revenue − COGS"],
    ["Other income (Hasil cadangan)", roundRp(i.otherIncome), ""],
    ["EBIT (Laba usaha)", num(i.ebit, "=R[-2]C+R[-1]C"), "Gross + other"],
    ["Interest (Beban bunga)", roundRp(i.interest), ""],
    ["EBT (Laba sebelum pajak)", num(i.ebt, "=R[-2]C-R[-1]C"), "EBIT − interest"],
    ["PPh Final 4(2)", roundRp(i.taxPph), ""],
    ["Net profit (Laba bersih)", num(i.netProfit, "=R[-2]C-R[-1]C"), "EBT − PPh"],
    ["PPN keluaran", roundRp(i.ppnKeluaran), ""],
    ["PPN masukan", roundRp(i.ppnMasukan), ""],
    ["PPN net", num(i.ppnNet, "=MAX(0,R[-2]C-R[-1]C)"), "max(0, keluaran − masukan)"],
    ["DER", Math.round(sim.ratios.der * 1000) / 1000, "Utang puncak ÷ ekuitas"],
    ["Debt ratio", Math.round(sim.ratios.debtRatio * 10000) / 10000, ""],
    ["ROE", Math.round(sim.ratios.roe * 10000) / 10000, "NI ÷ ekuitas"],
  ];
}

function projectSheet(sim: Simulation): Cell[][] {
  const head: Cell[] = [
    "Proyek",
    "Pasar",
    "Kontrak (G)",
    "DPP (E)",
    "Cost of sales (C)",
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
    num(p.laba, "=RC[-2]-RC[-1]"),
    num(p.kas, undefined),
    p.durationWeeks,
  ]);
  // Kas is totalIn - totalOut; we don't have those columns — keep cached value.
  // Laba formula uses earning - expense columns.
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

/** Exported for unit tests. */
export function buildWeekSheetXml(sim: Simulation): string {
  return sheet("Minggu", weekSheet(sim));
}

export function buildIncomeSheetXml(sim: Simulation): string {
  return sheet("Laba rugi", incomeSheet(sim));
}
