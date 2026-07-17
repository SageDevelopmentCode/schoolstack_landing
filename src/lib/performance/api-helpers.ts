import type { AuditFormFactor, PerformanceOpportunity } from "./types";
import type { NormalizedAuditMetrics } from "./types";

export function metricsToResultRow(metrics: NormalizedAuditMetrics) {
  return {
    performance_score: metrics.performanceScore,
    fcp_ms: metrics.fcpMs,
    lcp_ms: metrics.lcpMs,
    tbt_ms: metrics.tbtMs,
    cls: metrics.cls,
    speed_index_ms: metrics.speedIndexMs,
    total_byte_weight: metrics.totalByteWeight,
    opportunities: metrics.opportunities as PerformanceOpportunity[],
  };
}

export function parseFormFactor(value: unknown): AuditFormFactor | null {
  if (value === "mobile" || value === "desktop") return value;
  return null;
}

export function parsePageIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids = value.filter((item): item is string => typeof item === "string");
  return ids.length ? ids : undefined;
}
