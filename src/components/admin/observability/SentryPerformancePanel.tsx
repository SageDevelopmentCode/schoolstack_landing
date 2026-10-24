"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  failureRateClassName,
  p75DurationClassName,
  transactionCountClassName,
} from "@/lib/sentry/performance-metric-styles";
import { sentryPerformanceRowKey } from "@/lib/sentry/sentry-performance-rows";
import type {
  SentryPerformanceEnvironmentFilter,
  SentryPerformancePreset,
  SentryPerformanceRow,
} from "@/lib/sentry/types";

type SentryStatus = {
  configured: boolean;
};

const PRESETS: { value: SentryPerformancePreset; label: string }[] = [
  { value: "parent_committees", label: "Parent committees" },
  { value: "parent_portal", label: "Parent portal APIs" },
  { value: "api_routes", label: "All API routes" },
];

const ENVIRONMENT_OPTIONS: {
  value: SentryPerformanceEnvironmentFilter;
  label: string;
}[] = [
  { value: "all", label: "All environments" },
  { value: "development", label: "development (local)" },
  { value: "production", label: "production" },
  { value: "vercel-production", label: "vercel-production" },
];

function performanceScopeDescription(
  environment: SentryPerformanceEnvironmentFilter,
  projectSlug: string,
): string {
  if (environment === "all") {
    return `Spans from all environments in ${projectSlug} (7d). Local dev is usually development (100% sampled); deployed traffic is production or vercel-production (~10% sampled).`;
  }
  if (environment === "development") {
    return `Environment: development (7d, local next dev — typically 100% trace sample).`;
  }
  return `Environment: ${environment} (7d, ~10% trace sample on deployed builds).`;
}

function formatMs(ms: number | null) {
  if (ms === null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function SentryPerformancePanel({ status }: { status: SentryStatus }) {
  const [preset, setPreset] = useState<SentryPerformancePreset>("parent_committees");
  const [environment, setEnvironment] =
    useState<SentryPerformanceEnvironmentFilter>("all");
  const [rows, setRows] = useState<SentryPerformanceRow[]>([]);
  const [query, setQuery] = useState("");
  const [projectSlug, setProjectSlug] = useState("mudkitchenweb");
  const [activeEnvironment, setActiveEnvironment] =
    useState<SentryPerformanceEnvironmentFilter>("all");
  const [exploreUrl, setExploreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbiddenHint, setForbiddenHint] = useState<string | null>(null);
  const [sentryDetail, setSentryDetail] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!status.configured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setForbiddenHint(null);
    setSentryDetail(null);
    try {
      const params = new URLSearchParams({ preset, environment });
      const res = await fetch(`/api/admin/sentry/performance/summary?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 || data.code === "sentry_forbidden") {
          setError(data.error ?? "Sentry permission denied.");
          setForbiddenHint(
            typeof data.hint === "string"
              ? data.hint
              : "Update SENTRY_AUTH_TOKEN with Issue & Event → Read. See docs/sentry-env-and-verification.md.",
          );
          setRows([]);
          setQuery(typeof data.query === "string" ? data.query : "");
          setExploreUrl(typeof data.exploreUrl === "string" ? data.exploreUrl : null);
          setSentryDetail(
            typeof data.sentryDetail === "string" ? data.sentryDetail : null,
          );
          return;
        }
        throw new Error(data.error ?? "Failed to load performance data.");
      }
      setRows(data.rows ?? []);
      setQuery(data.query ?? "");
      setProjectSlug(
        typeof data.projectSlug === "string" ? data.projectSlug : "mudkitchenweb",
      );
      setActiveEnvironment(
        typeof data.environment === "string"
          ? (data.environment as SentryPerformanceEnvironmentFilter)
          : environment,
      );
      setExploreUrl(data.exploreUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance.");
      setForbiddenHint(null);
      setSentryDetail(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [preset, environment, status.configured]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  if (!status.configured) {
    return (
      <p className="text-sm text-admin-muted">
        Performance summaries require SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN on this
        deployment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center">
        <AdminSelect
          value={preset}
          onChange={(e) => setPreset(e.target.value as SentryPerformancePreset)}
          className="sm:w-56"
          triggerClassName="text-xs"
          aria-label="Performance preset"
        >
          {PRESETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          value={environment}
          onChange={(e) =>
            setEnvironment(e.target.value as SentryPerformanceEnvironmentFilter)
          }
          className="sm:w-52"
          triggerClassName="text-xs"
          aria-label="Sentry environment"
        >
          {ENVIRONMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
        {exploreUrl ? (
          <a
            href={exploreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-admin-accent hover:underline"
          >
            Open in Sentry Performance
          </a>
        ) : null}
      </div>
      <p className="text-xs text-admin-faint leading-relaxed">
        {performanceScopeDescription(activeEnvironment, projectSlug)}
      </p>
      <p className="text-xs text-admin-faint">
        Query: <span className="font-mono">{query || "—"}</span>
        {activeEnvironment !== "all" ? (
          <>
            {" "}
            · Environment: <span className="font-mono">{activeEnvironment}</span>
          </>
        ) : null}
      </p>
      {!loading && rows.length > 0 ? (
        <p className="text-[11px] text-admin-muted leading-relaxed">
          <span className="text-admin-success font-medium">p75:</span> ≤500 ms good ·{" "}
          <span className="text-admin-warning font-medium">500 ms–2 s</span> watch ·{" "}
          <span className="text-admin-error font-medium">&gt;2 s</span> slow ·{" "}
          <span className="text-admin-success font-medium">Failures:</span> 0% ok · ≥1% investigate ·{" "}
          <span className="font-medium text-admin-text">Count</span> bold when slow + frequent (≥10)
        </p>
      ) : null}
      {loading ? <AdminPageState variant="loading" /> : null}
      {error ? (
        <div className="space-y-1 rounded-admin-md border border-admin-border bg-admin-neutral-bg px-3 py-2">
          <p className="text-xs font-medium text-admin-accent">{error}</p>
          {forbiddenHint ? (
            <p className="text-xs text-admin-muted">{forbiddenHint}</p>
          ) : null}
          {sentryDetail ? (
            <p className="font-mono text-[10px] text-admin-faint break-all">
              Sentry: {sentryDetail}
            </p>
          ) : null}
        </div>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <p className="text-sm text-admin-muted">
          No transactions matched this preset. Try another filter or open Sentry Performance for
          this project.
        </p>
      ) : null}
      {!loading && rows.length > 0 ? (
        <div className="rounded-admin-md border border-admin-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-admin-neutral-bg text-admin-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Transaction</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">
                  Environment
                </th>
                <th className="px-3 py-2 font-medium">p75 duration</th>
                <th className="px-3 py-2 font-medium">Count</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell">Failure rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {rows.map((row) => (
                <tr key={sentryPerformanceRowKey(row)} className="bg-admin-surface">
                  <td className="px-3 py-2 font-mono break-all">{row.transaction}</td>
                  <td
                    className="px-3 py-2 hidden md:table-cell font-mono text-[11px] text-admin-muted"
                    title={row.environment ?? undefined}
                  >
                    {row.environment ?? "—"}
                  </td>
                  <td
                    className={`px-3 py-2 tabular-nums ${p75DurationClassName(row.p75DurationMs)}`}
                  >
                    {formatMs(row.p75DurationMs)}
                  </td>
                  <td
                    className={`px-3 py-2 ${transactionCountClassName(row.count, row.p75DurationMs)}`}
                  >
                    {row.count}
                  </td>
                  <td
                    className={`px-3 py-2 hidden sm:table-cell tabular-nums ${failureRateClassName(row.failureRate)}`}
                  >
                    {row.failureRate !== null ? `${(row.failureRate * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
