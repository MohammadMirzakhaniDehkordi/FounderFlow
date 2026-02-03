/**
 * German number and currency formatting utilities
 */

/**
 * Format a number as German currency (EUR)
 */
export function formatCurrency(
  value: number,
  options?: { decimals?: number; showSymbol?: boolean }
): string {
  const { decimals = 2, showSymbol = true } = options || {};

  const formatted = new Intl.NumberFormat("de-DE", {
    style: showSymbol ? "currency" : "decimal",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return formatted;
}

/**
 * Format a number with German decimal notation
 */
export function formatNumber(
  value: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)} %`;
}

/**
 * Format a date in German format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format a month string (YYYY-MM) to German format
 */
export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "long",
  }).format(date);
}

/**
 * German month names
 */
export const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * Short German month names
 */
export const MONTHS_DE_SHORT = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

/**
 * Parse a German-formatted number string
 */
export function parseGermanNumber(value: string): number {
  // Replace German decimal comma with period and remove thousands separators
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Format a large number in compact form
 */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)} Mio. €`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)} Tsd. €`;
  }
  return formatCurrency(value, { decimals: 0 });
}

/**
 * Validate that a value is a valid positive number
 */
export function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && value >= 0;
}

/**
 * Validate a month string format (YYYY-MM)
 */
export function isValidMonthFormat(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
