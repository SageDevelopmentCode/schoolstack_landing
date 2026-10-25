"use client";

import {
  mobileFeatureAnalyticsSurfaceLabel,
  type MobileFeatureAnalyticsResult,
  type MobileFeatureAnalyticsSurface,
} from "@/lib/mobile-feature-analytics";

type MobileFeatureAnalyticsPanelProps = {
  data: MobileFeatureAnalyticsResult | null;
  loading: boolean;
  error: string | null;
};

const SURFACE_ORDER: MobileFeatureAnalyticsSurface[] = [
  "parent_portal",
  "teacher_portal",
  "school_admin",
];

export default function MobileFeatureAnalyticsPanel({
  data,
  loading,
  error,
}: MobileFeatureAnalyticsPanelProps) {
  if (loading) {
    return (
      <p className="text-xs text-admin-muted py-6 text-center">Loading analytics…</p>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-admin-accent py-6 text-center" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return null;
  }

  const rowsBySurface = new Map<MobileFeatureAnalyticsSurface, typeof data.rows>();
  for (const surface of SURFACE_ORDER) {
    rowsBySurface.set(
      surface,
      data.rows.filter((row) => row.surface === surface),
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-admin-md border border-admin-border bg-admin-surface p-3 flex flex-wrap gap-4 text-xs">
        <div>
          <span className="text-admin-muted">Total visits</span>
          <p className="text-base font-semibold text-admin-text tabular-nums">
            {data.totals.visits.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-admin-muted">Unique users</span>
          <p className="text-base font-semibold text-admin-text tabular-nums">
            {data.totals.uniqueUsers.toLocaleString()}
          </p>
        </div>
        {data.truncated ? (
          <p className="text-admin-warning self-center">
            Results capped at 100k events; narrow the date range or organization for full
            accuracy.
          </p>
        ) : null}
      </div>

      {SURFACE_ORDER.map((surface) => {
        const rows = rowsBySurface.get(surface) ?? [];
        if (rows.length === 0) {
          return null;
        }

        return (
          <section
            key={surface}
            className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden"
          >
            <h2 className="text-xs font-semibold text-admin-text px-3 py-2 border-b border-admin-border bg-admin-bg">
              {mobileFeatureAnalyticsSurfaceLabel(surface)}
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-admin-muted border-b border-admin-border">
                  <th className="text-left font-medium px-3 py-2">Feature</th>
                  <th className="text-right font-medium px-3 py-2 w-28">Unique users</th>
                  <th className="text-right font-medium px-3 py-2 w-24">Visits</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.surface}-${row.featureKey}`}
                    className="border-b border-admin-border/60 last:border-0"
                  >
                    <td className="px-3 py-2 text-admin-text">{row.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-admin-text">
                      {row.uniqueUsers.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-admin-text">
                      {row.visits.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      {data.rows.length === 0 ? (
        <p className="text-xs text-admin-muted py-8 text-center">
          No MudKitchen mobile feature visits in this period. Opens are recorded once per feature
          per app session (platform admin and preview sessions are excluded).
        </p>
      ) : null}
    </div>
  );
}
