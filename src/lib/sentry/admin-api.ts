import "server-only";

import { unstable_cache } from "next/cache";
import {
  getSentryAdminConfig,
  type SentryAdminConfig,
} from "@/lib/sentry/admin-config";
import type {
  SentryIssueDetail,
  SentryIssueSummary,
  SentryPerformancePreset,
  SentryPerformanceRow,
} from "@/lib/sentry/types";

export type {
  SentryIssueDetail,
  SentryIssueSummary,
  SentryPerformancePreset,
  SentryPerformanceRow,
} from "@/lib/sentry/types";

const SENTRY_API_BASE = "https://sentry.io/api/0";

const PERFORMANCE_PRESET_QUERIES: Record<
  Exclude<SentryPerformancePreset, "custom">,
  string
> = {
  parent_committees:
    "has:transaction.duration transaction:*parent*committees*",
  api_routes: "has:transaction.duration transaction:/api/*",
  parent_portal:
    "has:transaction.duration transaction:*parent-portal*",
};

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

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Sentry API ${response.status}: ${body.slice(0, 300) || response.statusText}`,
    );
  }

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

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Sentry API ${response.status}: ${body.slice(0, 300) || response.statusText}`,
    );
  }

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
}): Promise<SentryPerformanceRow[]> {
  const config = getSentryAdminConfig();
  const statsPeriod = input.statsPeriod ?? "7d";

  const payload = {
    field: [
      "transaction",
      "p75(transaction.duration)",
      "count()",
      "failure_rate()",
    ],
    query: input.query,
    sort: "-p75(transaction.duration)",
    per_page: 25,
    dataset: "transactions",
    statsPeriod,
  };

  const result = await sentryFetch<{ data: DiscoverRow[] }>(
    config,
    `/organizations/${config.orgSlug}/events/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return (result.data ?? []).map((row) => {
    const transaction = String(row.transaction ?? "—");
    const p75Raw = row["p75(transaction.duration)"];
    const countRaw = row["count()"];
    const failureRaw = row["failure_rate()"];

    return {
      transaction,
      p75DurationMs:
        p75Raw === null || p75Raw === undefined ? null : Number(p75Raw),
      count: Number(countRaw) || 0,
      failureRate:
        failureRaw === null || failureRaw === undefined
          ? null
          : Number(failureRaw),
    };
  });
}

export function resolvePerformanceQuery(
  preset: SentryPerformancePreset,
  customQuery?: string,
): string {
  if (preset === "custom") {
    return customQuery?.trim() || "has:transaction.duration";
  }
  return PERFORMANCE_PRESET_QUERIES[preset];
}

export async function queryDiscoverPerformance(input: {
  preset: SentryPerformancePreset;
  customQuery?: string;
  statsPeriod?: string;
}): Promise<SentryPerformanceRow[]> {
  const query = resolvePerformanceQuery(input.preset, input.customQuery);

  const cacheKey = JSON.stringify({
    query,
    p: input.statsPeriod ?? "7d",
  });

  return unstable_cache(
    () =>
      queryDiscoverUncached({
        query,
        statsPeriod: input.statsPeriod,
      }),
    ["sentry-admin-perf", cacheKey],
    { revalidate: 60 },
  )();
}

export function buildSentryPerformanceExploreUrl(
  config: SentryAdminConfig,
  query: string,
): string {
  const params = new URLSearchParams({
    field: "transaction",
    query,
    dataset: "transactions",
    sort: "-p75(transaction.duration)",
  });
  return `${config.webBaseUrl}/explore/traces/?${params.toString()}`;
}
