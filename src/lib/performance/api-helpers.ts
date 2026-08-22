import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuditEnvironment,
  AuditFormFactor,
  AuditResultStatus,
  PerformanceOpportunity,
} from "./types";
import type { NormalizedAuditMetrics } from "./types";

export type UpsertPerformanceAuditResultInput = {
  page_id: string;
  environment: AuditEnvironment;
  form_factor: AuditFormFactor;
  run_id?: string | null;
  label: string;
  category: string;
  url: string;
  status: AuditResultStatus;
  skip_reason?: string | null;
  error_message?: string | null;
  source_ref?: string | null;
  raw_report?: unknown;
  performance_score?: number | null;
  fcp_ms?: number | null;
  lcp_ms?: number | null;
  tbt_ms?: number | null;
  cls?: number | null;
  speed_index_ms?: number | null;
  total_byte_weight?: number | null;
  opportunities?: PerformanceOpportunity[];
};

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

export async function upsertPerformanceAuditResult(
  admin: SupabaseClient,
  input: UpsertPerformanceAuditResultInput,
) {
  const { error } = await admin.from("performance_audit_results").upsert(
    {
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_id,environment,form_factor" },
  );

  if (error) {
    throw error;
  }
}
