"use client";

import { useCallback, useMemo, useState } from "react";
import MobileFeatureUsersDrawer from "@/components/admin/MobileFeatureUsersDrawer";
import type { ActivityDatePreset } from "@/lib/activity-log";
import {
  mobileFeatureAnalyticsSurfaceLabel,
  type MobileFeatureAnalyticsResult,
  type MobileFeatureAnalyticsRow,
  type MobileFeatureAnalyticsSurface,
  type MobileFeatureAnalyticsUsersResult,
} from "@/lib/mobile-feature-analytics";

type OrganizationOption = {
  id: string;
  name: string;
};

type MobileFeatureAnalyticsPanelProps = {
  data: MobileFeatureAnalyticsResult | null;
  loading: boolean;
  error: string | null;
  datePreset: ActivityDatePreset;
  organizationId: string;
  organizations: OrganizationOption[];
};

const SURFACE_ORDER: MobileFeatureAnalyticsSurface[] = [
  "parent_portal",
  "teacher_portal",
  "school_admin",
];

const DATE_PRESET_LABELS: Record<ActivityDatePreset, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export default function MobileFeatureAnalyticsPanel({
  data,
  loading,
  error,
  datePreset,
  organizationId,
  organizations,
}: MobileFeatureAnalyticsPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<MobileFeatureAnalyticsUsersResult | null>(
    null,
  );

  const filterSummary = useMemo(() => {
    const orgName =
      organizations.find((org) => org.id === organizationId)?.name ?? "All organizations";
    return `${DATE_PRESET_LABELS[datePreset]} · ${orgName}`;
  }, [datePreset, organizationId, organizations]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerError(null);
    setDrawerData(null);
  }, []);

  const handleUniqueUsersClick = useCallback(
    async (row: MobileFeatureAnalyticsRow) => {
      setDrawerOpen(true);
      setDrawerLoading(true);
      setDrawerError(null);
      setDrawerData(null);

      try {
        const params = new URLSearchParams({
          preset: datePreset,
          surface: row.surface,
          featureKey: row.featureKey,
        });
        if (organizationId) {
          params.set("organizationId", organizationId);
        }

        const res = await fetch(
          `/api/admin/mobile-feature-analytics/users?${params.toString()}`,
        );
        const body = (await res.json()) as MobileFeatureAnalyticsUsersResult & {
          error?: string;
        };

        if (!res.ok) {
          setDrawerError(body.error ?? "Failed to load users for this feature.");
          return;
        }

        setDrawerData(body);
      } catch {
        setDrawerError("Failed to load users for this feature.");
      } finally {
        setDrawerLoading(false);
      }
    },
    [datePreset, organizationId],
  );

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
    <>
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
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.uniqueUsers > 0 ? (
                          <button
                            type="button"
                            onClick={() => void handleUniqueUsersClick(row)}
                            className="text-admin-accent hover:underline"
                            aria-label={`View users who opened ${row.label}`}
                          >
                            {row.uniqueUsers.toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-admin-text">0</span>
                        )}
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

      <MobileFeatureUsersDrawer
        open={drawerOpen}
        loading={drawerLoading}
        error={drawerError}
        data={drawerData}
        filterSummary={filterSummary}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
