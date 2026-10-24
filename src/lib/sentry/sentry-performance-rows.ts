import type { SentryPerformanceRow } from "@/lib/sentry/types";

export type SentryPerformanceDiscoverRow = Record<string, unknown>;

export function mapSentryPerformanceDiscoverRow(
  row: SentryPerformanceDiscoverRow,
): SentryPerformanceRow {
  const transaction = String(row.transaction ?? "—");
  const environmentRaw = row.environment;
  const environment =
    environmentRaw === null || environmentRaw === undefined
      ? null
      : String(environmentRaw);

  const p75Raw = row["p75(span.duration)"];
  const countRaw = row["count(span.duration)"] ?? row["count()"];
  const failureRaw = row["failure_rate()"];

  return {
    transaction,
    environment,
    p75DurationMs:
      p75Raw === null || p75Raw === undefined ? null : Number(p75Raw),
    count: Number(countRaw) || 0,
    failureRate:
      failureRaw === null || failureRaw === undefined
        ? null
        : Number(failureRaw),
  };
}

export function sentryPerformanceRowKey(row: SentryPerformanceRow): string {
  return `${row.transaction}\0${row.environment ?? ""}`;
}

export function performanceDiscoverPageSize(
  environmentFilter: "all" | string,
): number {
  return environmentFilter === "all" ? 50 : 25;
}
