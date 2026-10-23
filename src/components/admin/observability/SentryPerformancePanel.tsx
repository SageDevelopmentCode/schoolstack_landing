"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import type {
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

function formatMs(ms: number | null) {
  if (ms === null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function SentryPerformancePanel({ status }: { status: SentryStatus }) {
  const [preset, setPreset] = useState<SentryPerformancePreset>("parent_committees");
  const [rows, setRows] = useState<SentryPerformanceRow[]>([]);
  const [query, setQuery] = useState("");
  const [exploreUrl, setExploreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!status.configured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ preset });
      const res = await fetch(`/api/admin/sentry/performance/summary?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load performance data.");
      }
      setRows(data.rows ?? []);
      setQuery(data.query ?? "");
      setExploreUrl(data.exploreUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [preset, status.configured]);

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
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
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
      <p className="text-xs text-admin-faint">
        p75 transaction duration from Sentry (7-day window, ~10% trace sample in production). Query:{" "}
        <span className="font-mono">{query || "—"}</span>
      </p>
      {loading ? <AdminPageState variant="loading" /> : null}
      {error ? <p className="text-xs text-admin-accent">{error}</p> : null}
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
                <th className="px-3 py-2 font-medium">p75 duration</th>
                <th className="px-3 py-2 font-medium">Count</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell">Failure rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {rows.map((row) => (
                <tr key={row.transaction} className="bg-admin-surface">
                  <td className="px-3 py-2 font-mono break-all">{row.transaction}</td>
                  <td className="px-3 py-2 tabular-nums">{formatMs(row.p75DurationMs)}</td>
                  <td className="px-3 py-2 tabular-nums">{row.count}</td>
                  <td className="px-3 py-2 hidden sm:table-cell tabular-nums">
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
