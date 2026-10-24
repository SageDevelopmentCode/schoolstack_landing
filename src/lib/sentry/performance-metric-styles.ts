export const P75_GOOD_MS = 500;
export const P75_WARN_MS = 2000;

export const FAILURE_WARN_RATE = 0.01;

export const HIGH_IMPACT_MIN_COUNT = 10;

export function p75DurationClassName(ms: number | null): string {
  if (ms === null || Number.isNaN(ms)) return "text-admin-muted";
  if (ms <= P75_GOOD_MS) return "text-admin-success";
  if (ms <= P75_WARN_MS) return "text-admin-warning";
  return "text-admin-error";
}

export function failureRateClassName(rate: number | null): string {
  if (rate === null || Number.isNaN(rate)) return "text-admin-muted";
  if (rate <= 0) return "text-admin-success";
  if (rate < FAILURE_WARN_RATE) return "text-admin-warning";
  return "text-admin-error";
}

export function transactionCountClassName(
  count: number,
  p75Ms: number | null,
): string {
  const slow =
    p75Ms !== null && !Number.isNaN(p75Ms) && p75Ms > P75_WARN_MS;
  if (slow && count >= HIGH_IMPACT_MIN_COUNT) {
    return "font-medium text-admin-text tabular-nums";
  }
  return "text-admin-muted tabular-nums";
}
