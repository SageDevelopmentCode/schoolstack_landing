"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ChevronRight } from "lucide-react";
import ActivityFunnelStageDrawer from "@/components/admin/ActivityFunnelStageDrawer";
import type { ActivityDatePreset } from "@/lib/activity-log";
import {
  fetchFunnelStageDetails,
  fetchProductFunnelMetrics,
  getProductFunnelDefinition,
  PRODUCT_FUNNELS,
  type FunnelStageDetails,
  type ProductFunnelMetrics,
} from "@/lib/activity-funnel";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type ActivityFunnelPanelProps = {
  supabase: SupabaseClient;
  datePreset: ActivityDatePreset;
  organizationId: string;
  organizations: OrganizationOption[];
};

function formatPercent(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

function formatCount(value: number) {
  return value.toLocaleString();
}

export default function ActivityFunnelPanel({
  supabase,
  datePreset,
  organizationId,
  organizations,
}: ActivityFunnelPanelProps) {
  const [funnelId, setFunnelId] = useState(PRODUCT_FUNNELS[0].id);
  const [metrics, setMetrics] = useState<ProductFunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [stageDetails, setStageDetails] = useState<FunnelStageDetails | null>(
    null,
  );

  const funnel = useMemo(
    () => getProductFunnelDefinition(funnelId) ?? PRODUCT_FUNNELS[0],
    [funnelId],
  );

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductFunnelMetrics(supabase, {
        funnelId,
        datePreset,
        organizationId: organizationId || undefined,
      });
      setMetrics(data);
    } catch (err) {
      setMetrics(null);
      setError(err instanceof Error ? err.message : "Failed to load funnel.");
    } finally {
      setLoading(false);
    }
  }, [supabase, funnelId, datePreset, organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMetrics();
    });
  }, [loadMetrics]);

  const overallConversion = useMemo(() => {
    if (!metrics || metrics.cohortSize === 0 || metrics.stages.length === 0) {
      return null;
    }
    const lastStage = metrics.stages[metrics.stages.length - 1];
    return (lastStage.count / metrics.cohortSize) * 100;
  }, [metrics]);

  const maxCount = metrics?.stages[0]?.count ?? 0;
  const selectedOrgName =
    organizations.find((org) => org.id === organizationId)?.name ?? null;

  const filterSummary = useMemo(() => {
    const parts = [
      datePreset === "today"
        ? "Today"
        : datePreset === "7d"
          ? "Last 7 days"
          : datePreset === "30d"
            ? "Last 30 days"
            : "All time",
      selectedOrgName ?? "All organizations",
    ];
    return parts.join(" · ");
  }, [datePreset, selectedOrgName]);

  const handleStageClick = useCallback(
    async (stageKey: string) => {
      setDrawerOpen(true);
      setDrawerLoading(true);
      setDrawerError(null);
      setStageDetails(null);

      try {
        const details = await fetchFunnelStageDetails(supabase, {
          funnelId,
          stageKey,
          datePreset,
          organizationId: organizationId || undefined,
        });
        setStageDetails(details);
      } catch (err) {
        setDrawerError(
          err instanceof Error ? err.message : "Failed to load stage details.",
        );
      } finally {
        setDrawerLoading(false);
      }
    },
    [supabase, funnelId, datePreset, organizationId],
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerError(null);
    setStageDetails(null);
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-faint uppercase tracking-wide">
            Product funnel
          </p>
          <h1 className="text-2xl font-medium text-text">{funnel.label}</h1>
          <p className="text-sm text-text-muted">{funnel.description}</p>
        </div>

        <div className="flex gap-1 flex-wrap">
          {PRODUCT_FUNNELS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFunnelId(option.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                funnelId === option.id
                  ? "bg-clay-soft text-clay border-clay/20"
                  : "bg-bg text-text-muted border-border hover:bg-surface-soft"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-clay">{error}</p>
        ) : null}

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-16 text-sm text-text-faint font-secondary">
            Loading funnel…
          </div>
        ) : metrics ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-text-faint">Cohort size</p>
                <p className="text-2xl font-medium text-text tabular-nums mt-1">
                  {formatCount(metrics.cohortSize)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {selectedOrgName ? selectedOrgName : "All organizations"}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-text-faint">Overall conversion</p>
                <p className="text-2xl font-medium text-text tabular-nums mt-1">
                  {formatPercent(overallConversion, 1)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {metrics.stages[metrics.stages.length - 1]?.label ?? "Final stage"}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-text-faint">Stages</p>
                <p className="text-2xl font-medium text-text tabular-nums mt-1">
                  {metrics.stages.length}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Milestone-based funnel
                </p>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide">
                  Funnel stages
                </h2>
                {loading ? (
                  <span className="text-xs text-text-faint">Refreshing…</span>
                ) : null}
              </div>

              {metrics.cohortSize === 0 ? (
                <p className="text-sm text-text-faint text-center py-8">
                  No cohort entries for this filter. Try a wider date range or a
                  different organization.
                </p>
              ) : (
                <div className="space-y-5">
                  {metrics.stages.map((stage, index) => {
                    const widthPercent =
                      maxCount > 0
                        ? Math.max(8, (stage.count / maxCount) * 100)
                        : 8;
                    const isClickable = stage.count > 0;

                    const content = (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text">
                              {index + 1}. {stage.label}
                            </p>
                            {index > 0 ? (
                              <p className="text-xs text-text-muted mt-0.5">
                                {formatPercent(stage.conversionFromPrevious, 0)}{" "}
                                from previous stage
                                {stage.dropOffFromPrevious !== null
                                  ? ` · ${formatPercent(stage.dropOffFromPrevious, 0)} drop-off`
                                  : ""}
                              </p>
                            ) : (
                              <p className="text-xs text-text-muted mt-0.5">
                                Cohort entry point
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <p className="text-lg font-medium text-text tabular-nums">
                                {formatCount(stage.count)}
                              </p>
                              <p className="text-xs text-text-faint tabular-nums">
                                {formatPercent(stage.percentOfCohort, 0)} of cohort
                              </p>
                            </div>
                            {isClickable ? (
                              <ChevronRight className="h-4 w-4 text-text-faint" />
                            ) : null}
                          </div>
                        </div>
                        <div className="h-3 rounded-full bg-bg border border-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-clay/80 transition-all"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </>
                    );

                    return isClickable ? (
                      <button
                        key={stage.key}
                        type="button"
                        onClick={() => void handleStageClick(stage.key)}
                        className="w-full space-y-2 rounded-xl border border-transparent px-2 py-2 -mx-2 text-left transition-colors hover:border-border hover:bg-bg cursor-pointer"
                      >
                        {content}
                      </button>
                    ) : (
                      <div key={stage.key} className="space-y-2 px-2 py-2 -mx-2">
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : null}

        <section className="text-xs text-text-faint space-y-1 border-t border-border pt-4">
          <p>
            Metrics are derived from activity events and only cover the period
            since instrumentation began.
          </p>
          <p>
            Application started counts new applications only, not resume visits.
            Pay-before-submit and submit-before-pay flows are both supported.
          </p>
          <p>
            Schools without an application fee may show low or zero payment
            stages.
          </p>
        </section>
      </div>

      <ActivityFunnelStageDrawer
        open={drawerOpen}
        loading={drawerLoading}
        error={drawerError}
        details={stageDetails}
        filterSummary={filterSummary}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
