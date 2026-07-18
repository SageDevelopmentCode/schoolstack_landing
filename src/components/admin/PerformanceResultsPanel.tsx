"use client";

import { useState } from "react";
import {
  opportunityCardClassName,
  performanceScoreClassName,
} from "@/lib/performance/score-styles";
import type { PerformanceOpportunity } from "@/lib/performance/types";

type PerformanceResultDetail = {
  id: string;
  runId: string;
  pageId: string;
  label: string;
  category: string;
  url: string;
  status: string;
  skipReason: string | null;
  performanceScore: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
  tbtMs: number | null;
  cls: number | null;
  speedIndexMs: number | null;
  totalByteWeight: number | null;
  opportunities: PerformanceOpportunity[];
  errorMessage: string | null;
  createdAt: string;
  rawReport?: unknown;
};

function formatMs(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function formatScore(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return String(value);
}

export function PerformanceResultsPanel({
  result,
  onClose,
}: {
  result: PerformanceResultDetail | null;
  onClose: () => void;
}) {
  const [showRaw, setShowRaw] = useState(false);

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-faint">
        Select a page to view audit details
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-semibold text-text">
            {result.label}
          </h1>
          <p className="font-secondary text-sm text-text-muted">
            {result.category.replace(/_/g, " ")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:bg-surface-soft"
        >
          Close
        </button>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
          Summary
        </h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm font-secondary sm:grid-cols-[120px_1fr]">
          <dt className="text-text-muted">URL</dt>
          <dd className="break-all">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay hover:underline"
            >
              {result.url}
            </a>
          </dd>
          <dt className="text-text-muted">Status</dt>
          <dd className="capitalize">{result.status}</dd>
          {result.skipReason ? (
            <>
              <dt className="text-text-muted">Skip reason</dt>
              <dd className="break-words">{result.skipReason.replace(/_/g, " ")}</dd>
            </>
          ) : null}
          {result.errorMessage ? (
            <>
              <dt className="text-text-muted">Error</dt>
              <dd className="break-words text-clay">{result.errorMessage}</dd>
            </>
          ) : null}
          <dt className="text-text-muted">Last run</dt>
          <dd>{new Date(result.createdAt).toLocaleString()}</dd>
        </dl>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
          Scores
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard
            label="Performance"
            value={formatScore(result.performanceScore)}
            className={performanceScoreClassName(result.performanceScore)}
          />
          <MetricCard label="LCP" value={formatMs(result.lcpMs)} />
          <MetricCard label="FCP" value={formatMs(result.fcpMs)} />
          <MetricCard label="TBT" value={formatMs(result.tbtMs)} />
          <MetricCard
            label="CLS"
            value={result.cls === null ? "—" : result.cls.toFixed(3)}
          />
          <MetricCard label="Speed index" value={formatMs(result.speedIndexMs)} />
        </div>
      </section>

      {result.opportunities.length > 0 ? (
        <section className="min-w-0 space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
            Opportunities
          </h2>
          <ul className="space-y-3">
            {result.opportunities.map((item) => (
              <li
                key={item.id}
                className={`min-w-0 rounded-lg border p-3 ${opportunityCardClassName(item.score)}`}
              >
                <p className="break-words text-sm font-medium text-text">
                  {item.title}
                </p>
                {item.displayValue ? (
                  <p className="mt-1 text-xs text-text-muted">{item.displayValue}</p>
                ) : null}
                {item.description ? (
                  <p className="mt-2 break-words text-xs text-text-faint [overflow-wrap:anywhere]">
                    {item.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.rawReport ? (
        <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <button
            type="button"
            onClick={() => setShowRaw((value) => !value)}
            className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint hover:text-text"
          >
            {showRaw ? "Hide" : "Show"} raw JSON
          </button>
          {showRaw ? (
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-bg p-3 text-xs text-text-muted">
              {JSON.stringify(result.rawReport, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  className = "text-text",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-xs text-text-faint">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${className}`}>{value}</p>
    </div>
  );
}

export type { PerformanceResultDetail };
