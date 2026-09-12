const ID_CURRENCY = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRp(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "Rp 0";
  return ID_CURRENCY.format(rounded).replace(/\s/g, "\u00a0");
}

export function formatRpCompact(value: number): string {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    return `${sign}Rp ${trimNum(n)} M`;
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}Rp ${trimNum(n)} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${Math.round(abs / 1_000)} rb`;
  }
  return `${sign}Rp ${Math.round(abs)}`;
}

function trimNum(n: number): string {
  const rounded = n >= 10 ? n.toFixed(0) : n.toFixed(1);
  return rounded.replace(".", ",").replace(/,0$/, "");
}

export function formatAxisJt(value: number): string {
  const sign = value < 0 ? "−" : "";
  const n = Math.abs(value) / 1_000_000;
  if (n < 0.05) return "0";
  if (n >= 100) return `${sign}${Math.round(n)} jt`;
  if (n >= 10) return `${sign}${n.toFixed(0)} jt`;
  return `${sign}${n.toFixed(1).replace(".", ",")} jt`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export function weekToDate(week: number, fiscalYear: number): Date {
  const start = new Date(fiscalYear, 0, 1);
  const day = start.getDay();
  const offset = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  const firstMonday = new Date(fiscalYear, 0, 1 + offset);
  return new Date(firstMonday.getTime() + week * 7 * 24 * 60 * 60 * 1000);
}

export function weekLabel(week: number, fiscalYear: number): string {
  const d = weekToDate(week, fiscalYear);
  return `M${week + 1} · ${MONTHS[d.getMonth()]}`;
}

export function weekShort(week: number): string {
  return `M${week + 1}`;
}

export function weekTickInterval(n: number): number {
  if (n <= 14) return 0;
  if (n <= 24) return 1;
  if (n <= 36) return 2;
  return 4;
}

export function monthLabel(week: number, fiscalYear: number): string {
  const d = weekToDate(week, fiscalYear);
  const year = d.getFullYear() === fiscalYear ? "" : ` ${d.getFullYear()}`;
  return `${MONTHS[d.getMonth()]}${year}`;
}

export function monthKey(week: number, fiscalYear: number): string {
  const d = weekToDate(week, fiscalYear);
  return `${d.getFullYear()}-${d.getMonth()}`;
}
