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
  p75DurationMs: number | null;
  count: number;
  failureRate: number | null;
};

export type SentryPerformancePreset =
  | "parent_committees"
  | "api_routes"
  | "parent_portal"
  | "custom";
