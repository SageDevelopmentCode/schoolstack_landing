import "server-only";

import { unstable_cache } from "next/cache";
import {
  getSentryAdminConfig,
  type SentryAdminConfig,
} from "@/lib/sentry/admin-config";
import { throwIfSentryResponseNotOk } from "@/lib/sentry/sentry-api-error";

export { isSentryApiError, SentryApiError } from "@/lib/sentry/sentry-api-error";
import type {
  SentryIssueDetail,
  SentryIssueSummary,
  SentryPerformanceEnvironmentFilter,
  SentryPerformancePreset,
  SentryPerformanceRow,
} from "@/lib/sentry/types";
import {
  normalizeSpansExploreQuery,
  parseSentryPerformanceEnvironment,
  resolvePerformanceQuery,
} from "@/lib/sentry/sentry-performance-queries";
import {
  mapSentryPerformanceDiscoverRow,
  performanceDiscoverPageSize,
} from "@/lib/sentry/sentry-performance-rows";

export {
  normalizeSpansExploreQuery,
  parseSentryPerformanceEnvironment,
  resolvePerformanceQuery,
} from "@/lib/sentry/sentry-performance-queries";

export type {
  SentryIssueDetail,
  SentryIssueSummary,
  SentryPerformancePreset,
  SentryPerformanceRow,
} from "@/lib/sentry/types";

const SENTRY_API_BASE = "https://sentry.io/api/0";

async function sentryFetch<T>(
  config: SentryAdminConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${SENTRY_API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.authToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 0 },
  });

  await throwIfSentryResponseNotOk(response);

  return (await response.json()) as T;
}

type RawIssue = {
  id: string;
  shortId: string;
  title: string;
  culprit?: string;
  level: string;
  status: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
  metadata?: Record<string, unknown>;
  tags?: Array<{ key: string; value: string }>;
};

function mapIssue(row: RawIssue): SentryIssueSummary {
  return {
    id: row.id,
    shortId: row.shortId,
    title: row.title,
    culprit: row.culprit ?? null,
    level: row.level,
    status: row.status,
    count: Number(row.count) || 0,
    userCount: row.userCount ?? 0,
    firstSeen: row.firstSeen,
    lastSeen: row.lastSeen,
    permalink: row.permalink,
  };
}

async function listProjectIssuesUncached(input: {
  query?: string;
  cursor?: string;
  statsPeriod?: string;
}): Promise<{ issues: SentryIssueSummary[]; nextCursor: string | null }> {
  const config = getSentryAdminConfig();
  const params = new URLSearchParams();
  if (input.query) params.set("query", input.query);
  if (input.cursor) params.set("cursor", input.cursor);
  params.set("statsPeriod", input.statsPeriod ?? "14d");

  const path = `/projects/${config.orgSlug}/${config.projectSlug}/issues/?${params}`;
  const linkHeaderKey = "link";

  const response = await fetch(`${SENTRY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${config.authToken}` },
    next: { revalidate: 0 },
  });

  await throwIfSentryResponseNotOk(response);

  const rows = (await response.json()) as RawIssue[];
  const issues = rows.map(mapIssue);

  let nextCursor: string | null = null;
  const link = response.headers.get(linkHeaderKey);
  if (link) {
    const nextPart = link.split(",").find((part) => part.includes('rel="next"'));
    const match = nextPart?.match(/cursor=([^&>]+)/);
    if (match?.[1]) {
      nextCursor = decodeURIComponent(match[1]);
    }
  }

  return { issues, nextCursor };
}

export async function listProjectIssues(input: {
  query?: string;
  cursor?: string;
  statsPeriod?: string;
}): Promise<{ issues: SentryIssueSummary[]; nextCursor: string | null }> {
  const cacheKey = JSON.stringify({
    q: input.query ?? "",
    c: input.cursor ?? "",
    p: input.statsPeriod ?? "14d",
  });

  return unstable_cache(
    () => listProjectIssuesUncached(input),
    ["sentry-admin-issues", cacheKey],
    { revalidate: 45 },
  )();
}

export async function getIssue(issueId: string): Promise<SentryIssueDetail> {
  const config = getSentryAdminConfig();

  return unstable_cache(
    async () => {
      const row = await sentryFetch<RawIssue>(config, `/issues/${issueId}/`);
      return {
        ...mapIssue(row),
        metadata: row.metadata ?? {},
        tags: row.tags ?? [],
      };
    },
    ["sentry-admin-issue", issueId],
    { revalidate: 45 },
  )();
}

type DiscoverRow = Record<string, unknown>;

async function queryDiscoverUncached(input: {
  query: string;
  statsPeriod?: string;
  environment?: SentryPerformanceEnvironmentFilter;
}): Promise<SentryPerformanceRow[]> {
  const config = getSentryAdminConfig();
  const statsPeriod = input.statsPeriod ?? "7d";
  const query = normalizeSpansExploreQuery(input.query);

  const environmentFilter = input.environment ?? "all";

  const params = new URLSearchParams();
  for (const field of [
    "transaction",
    "environment",
    "p75(span.duration)",
    "count(span.duration)",
    "failure_rate()",
  ]) {
    params.append("field", field);
  }
  params.set("dataset", "spans");
  params.set("query", query);
  params.set("sort", "-p75(span.duration)");
  params.set("per_page", String(performanceDiscoverPageSize(environmentFilter)));
  params.set("statsPeriod", statsPeriod);
  if (environmentFilter !== "all") {
    params.append("environment", environmentFilter);
  }

  const result = await sentryFetch<{ data: DiscoverRow[] }>(
    config,
    `/organizations/${config.orgSlug}/events/?${params.toString()}`,
  );

  return (result.data ?? []).map((row) => mapSentryPerformanceDiscoverRow(row));
}

export async function queryDiscoverPerformance(input: {
  preset: SentryPerformancePreset;
  customQuery?: string;
  statsPeriod?: string;
  environment?: SentryPerformanceEnvironmentFilter;
}): Promise<SentryPerformanceRow[]> {
  const query = resolvePerformanceQuery(input.preset, input.customQuery);
  const environment = input.environment ?? "all";

  const cacheKey = JSON.stringify({
    query,
    p: input.statsPeriod ?? "7d",
    env: environment,
  });

  return unstable_cache(
    () =>
      queryDiscoverUncached({
        query,
        statsPeriod: input.statsPeriod,
        environment,
      }),
    ["sentry-admin-perf", cacheKey],
    { revalidate: 60 },
  )();
}

export function buildSentryPerformanceExploreUrl(
  config: SentryAdminConfig,
  query: string,
  environment: SentryPerformanceEnvironmentFilter = "all",
): string {
  const spansQuery = normalizeSpansExploreQuery(query);
  const params = new URLSearchParams({
    field: "transaction",
    query: spansQuery,
    dataset: "spans",
    sort: "-p75(span.duration)",
  });
  if (environment !== "all") {
    params.append("environment", environment);
  }
  return `${config.webBaseUrl}/explore/traces/?${params.toString()}`;
}
