export type SentryIssueSummary = {
  id: string;
  shortId: string;
  title: string;
  culprit: string | null;
  level: string;
  status: string;
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
};

export type SentryIssueDetail = SentryIssueSummary & {
  metadata: Record<string, unknown>;
  tags: Array<{ key: string; value: string }>;
};

export type SentryPerformanceRow = {
  transaction: string;
  environment: string | null;
  p75DurationMs: number | null;
  count: number;
  failureRate: number | null;
};

export type SentryProjectTarget = "web" | "mobile";

export type SentryWebPerformancePreset =
  | "parent_committees"
  | "api_routes"
  | "parent_portal";

export type SentryMobilePerformancePreset =
  | "mobile_all_screens"
  | "mobile_parent_portal"
  | "mobile_teacher_portal"
  | "mobile_school_admin"
  | "mobile_api_client";

export type SentryPerformancePreset =
  | SentryWebPerformancePreset
  | SentryMobilePerformancePreset
  | "custom";

export const SENTRY_PERFORMANCE_ENVIRONMENT_FILTERS = [
  "all",
  "development",
  "production",
  "vercel-production",
] as const;

export type SentryPerformanceEnvironmentFilter =
  (typeof SENTRY_PERFORMANCE_ENVIRONMENT_FILTERS)[number];
