import { getCurrencyInfo } from '../data/currencies';

export function formatCurrencyFor(
  value: number,
  currencyCode = 'USD',
  decimals?: number
): string {
  const info = getCurrencyInfo(currencyCode);
  const effectiveDecimals =
    decimals === undefined ? info.decimals : Math.min(decimals, info.decimals);
  const safeVal = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.code,
    minimumFractionDigits: effectiveDecimals,
    maximumFractionDigits: effectiveDecimals,
  }).format(safeVal);
}

export function formatCompactCurrencyFor(value: number, currencyCode = 'USD'): string {
  const info = getCurrencyInfo(currencyCode);
  const safeVal = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(safeVal);
  } catch {
    return formatCurrencyFor(safeVal, currencyCode, 0);
  }
}

export function formatCurrency(value: number, decimals = 2): string {
  return formatCurrencyFor(value, 'USD', decimals);
}

export function formatCompactCurrency(value: number): string {
  return formatCompactCurrencyFor(value, 'USD');
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 0, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function addMonthsToDate(startDate: Date, monthsToAdd: number): Date {
  const result = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  result.setMonth(result.getMonth() + monthsToAdd);
  return result;
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}
