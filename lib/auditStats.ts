const AUDIT_COUNT_KEY = "auditai_count";
const TOTAL_SAVINGS_KEY = "auditai_total_savings";

export interface AuditStats {
  count: number;
  totalSavings: number;
  avgSavings: number;
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readNumber(key: string): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  const rawValue = window.localStorage.getItem(key);
  const parsedValue = rawValue === null ? 0 : Number(rawValue);

  return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
}

function writeNumber(key: string, value: number): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, String(Math.max(0, value)));
}

function buildStats(count: number, totalSavings: number): AuditStats {
  return {
    count,
    totalSavings,
    avgSavings: count > 0 ? totalSavings / count : 0
  };
}

export function getAuditStats(): AuditStats {
  const count = readNumber(AUDIT_COUNT_KEY);
  const totalSavings = readNumber(TOTAL_SAVINGS_KEY);

  return buildStats(count, totalSavings);
}

export function incrementAuditCount(savingsAmount: number): AuditStats {
  const currentStats = getAuditStats();
  const normalizedSavings = Number.isFinite(savingsAmount) ? Math.max(0, savingsAmount) : 0;
  const nextCount = currentStats.count + 1;
  const nextTotalSavings = currentStats.totalSavings + normalizedSavings;

  writeNumber(AUDIT_COUNT_KEY, nextCount);
  writeNumber(TOTAL_SAVINGS_KEY, nextTotalSavings);

  return buildStats(nextCount, nextTotalSavings);
}
