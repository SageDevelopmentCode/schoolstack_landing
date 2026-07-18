import type { NormalizedAuditMetrics, PerformanceOpportunity } from "./types";

type LighthouseAudit = {
  id?: string;
  title?: string;
  description?: string;
  displayValue?: string;
  score?: number | null;
  numericValue?: number;
  details?: { overallSavingsBytes?: number };
};

type LighthouseCategory = {
  score?: number | null;
};

type LighthouseResult = {
  categories?: {
    performance?: LighthouseCategory;
  };
  audits?: Record<string, LighthouseAudit>;
};

function auditMetric(
  audits: Record<string, LighthouseAudit> | undefined,
  id: string,
): number | null {
  const value = audits?.[id]?.numericValue;
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value;
}

function parseOpportunities(
  audits: Record<string, LighthouseAudit> | undefined,
): PerformanceOpportunity[] {
  if (!audits) return [];

  return Object.values(audits)
    .filter((audit) => {
      if (!audit.id || !audit.title) return false;
      if (audit.score === null || audit.score === undefined) return false;
      return audit.score < 0.9;
    })
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, 5)
    .map((audit) => ({
      id: audit.id!,
      title: audit.title!,
      description: audit.description ?? "",
      displayValue: audit.displayValue,
      score: audit.score ?? undefined,
    }));
}

export function normalizeLighthouseResult(
  lighthouseResult: LighthouseResult | null | undefined,
): NormalizedAuditMetrics {
  const audits = lighthouseResult?.audits;

  const performanceScoreRaw = lighthouseResult?.categories?.performance?.score;
  const performanceScore =
    typeof performanceScoreRaw === "number"
      ? Math.round(performanceScoreRaw * 100)
      : null;

  const totalByteWeight = audits?.["total-byte-weight"]?.numericValue;
  const tbt = audits?.["total-blocking-time"]?.numericValue;

  return {
    performanceScore,
    fcpMs: auditMetric(audits, "first-contentful-paint"),
    lcpMs: auditMetric(audits, "largest-contentful-paint"),
    tbtMs: typeof tbt === "number" ? tbt : null,
    cls: auditMetric(audits, "cumulative-layout-shift"),
    speedIndexMs: auditMetric(audits, "speed-index"),
    totalByteWeight:
      typeof totalByteWeight === "number" ? Math.round(totalByteWeight) : null,
    opportunities: parseOpportunities(audits),
  };
}

export function extractLighthouseFromPsiResponse(payload: unknown): LighthouseResult | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as { lighthouseResult?: LighthouseResult };
  return record.lighthouseResult ?? null;
}
