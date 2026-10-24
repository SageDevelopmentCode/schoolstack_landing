import {
  SENTRY_PERFORMANCE_ENVIRONMENT_FILTERS,
  type SentryPerformanceEnvironmentFilter,
  type SentryPerformancePreset,
} from "@/lib/sentry/types";

const PERFORMANCE_PRESET_QUERIES: Record<
  Exclude<SentryPerformancePreset, "custom">,
  string
> = {
  parent_committees:
    "is_transaction:true transaction:*parent*committees*",
  api_routes: "is_transaction:true transaction:*/api/*",
  parent_portal: "is_transaction:true transaction:*parent-portal*",
};

export function parseSentryPerformanceEnvironment(
  value: string | null | undefined,
): SentryPerformanceEnvironmentFilter {
  if (
    value &&
    (SENTRY_PERFORMANCE_ENVIRONMENT_FILTERS as readonly string[]).includes(value)
  ) {
    return value as SentryPerformanceEnvironmentFilter;
  }
  return "all";
}

/** Map legacy Discover queries to Sentry Explore spans syntax. */
export function normalizeSpansExploreQuery(query: string): string {
  let normalized = query.trim();
  if (!normalized) return "is_transaction:true";
  if (/\bis_transaction:/.test(normalized)) return normalized;
  normalized = normalized.replace(
    /\bhas:transaction\.duration\b/g,
    "is_transaction:true",
  );
  if (!/\bis_transaction:/.test(normalized)) {
    normalized = `is_transaction:true ${normalized}`;
  }
  return normalized.trim();
}

export function resolvePerformanceQuery(
  preset: SentryPerformancePreset,
  customQuery?: string,
): string {
  if (preset === "custom") {
    return normalizeSpansExploreQuery(
      customQuery?.trim() || "is_transaction:true",
    );
  }
  return PERFORMANCE_PRESET_QUERIES[preset];
}
