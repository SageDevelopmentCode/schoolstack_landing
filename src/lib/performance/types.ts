export type AuditEnvironment = "production" | "local" | "ci";
export type AuditFormFactor = "mobile" | "desktop";

export const BULK_AUDIT_FORM_FACTORS: AuditFormFactor[] = ["mobile", "desktop"];
export type AuditRunStatus = "pending" | "running" | "completed" | "failed";
export type AuditResultStatus = "success" | "failed" | "skipped";

export type PageCategory =
  | "marketing"
  | "demo"
  | "school_admin"
  | "school_parent"
  | "admissions";

export const PERFORMANCE_PAGE_CATEGORIES: PageCategory[] = [
  "marketing",
  "demo",
  "admissions",
  "school_admin",
  "school_parent",
];

export type PageAuth = "none" | "school_admin" | "parent";

export type PageTarget = {
  id: string;
  category: PageCategory;
  label: string;
  path: string;
  requiresAuth: PageAuth;
};

export type PerformanceOpportunity = {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score?: number;
};

export type NormalizedAuditMetrics = {
  performanceScore: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
  tbtMs: number | null;
  cls: number | null;
  speedIndexMs: number | null;
  totalByteWeight: number | null;
  opportunities: PerformanceOpportunity[];
};

export type PerformanceAuditRunRow = {
  id: string;
  environment: AuditEnvironment;
  status: AuditRunStatus;
  triggered_by: string | null;
  page_ids: string[];
  form_factor: AuditFormFactor;
  completed_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type PerformanceAuditResultRow = {
  id: string;
  run_id: string;
  page_id: string;
  label: string;
  category: string;
  url: string;
  status: AuditResultStatus;
  skip_reason: string | null;
  performance_score: number | null;
  fcp_ms: number | null;
  lcp_ms: number | null;
  tbt_ms: number | null;
  cls: number | null;
  speed_index_ms: number | null;
  total_byte_weight: number | null;
  opportunities: PerformanceOpportunity[];
  raw_report: unknown;
  error_message: string | null;
  created_at: string;
};
